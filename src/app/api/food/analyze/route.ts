import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { reservePhotoCredit } from "@/lib/credits";
import { analyzeFood } from "@/lib/gemini/client";
import type { Database } from "@/types/supabase";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ["image/jpeg", "image/png"];

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: { code: "unauthorized", message: "Authentication required" } },
      { status: 401 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: { code: "missing_image", message: "Request must be multipart/form-data" } },
      { status: 400 }
    );
  }

  const imageFile = formData.get("image");

  if (!imageFile || !(imageFile instanceof File)) {
    return Response.json(
      { error: { code: "missing_image", message: "Field 'image' is required" } },
      { status: 400 }
    );
  }

  if (imageFile.size > MAX_IMAGE_BYTES) {
    return Response.json(
      { error: { code: "image_too_large", message: "Image must be ≤ 5 MB" } },
      { status: 400 }
    );
  }

  if (!ALLOWED_MIME.includes(imageFile.type)) {
    return Response.json(
      { error: { code: "invalid_image_type", message: "Image must be image/jpeg or image/png" } },
      { status: 400 }
    );
  }

  const arrayBuffer = await imageFile.arrayBuffer();
  const imageBase64 = Buffer.from(arrayBuffer).toString("base64");

  // Upload to Supabase Storage using service role
  const service = createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const storagePath = `${user.id}/${Date.now()}-${imageFile.name}`;
  const { error: uploadError } = await service.storage
    .from("food-images")
    .upload(storagePath, arrayBuffer, { contentType: imageFile.type });

  if (uploadError) {
    return Response.json(
      { error: { code: "storage_error", message: uploadError.message } },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl: photoUrl },
  } = service.storage.from("food-images").getPublicUrl(storagePath);

  // Reserve photo credit (fails with insufficient_credits if none left)
  let photoJobId: string;
  try {
    photoJobId = await reservePhotoCredit(user.id);
  } catch (err) {
    const error = err as Error & { code?: string };
    if (error.code === "insufficient_credits") {
      return Response.json(
        { error: { code: "insufficient_credits", message: "No photo credits remaining today" } },
        { status: 402 }
      );
    }
    return Response.json(
      { error: { code: "credits_error", message: error.message } },
      { status: 500 }
    );
  }

  // Analyze with Gemini Vision
  try {
    const analysis = await analyzeFood(imageBase64);
    return Response.json({ data: { photo_job_id: photoJobId, analysis, photo_url: photoUrl } });
  } catch (err) {
    const error = err as Error & { code?: string };

    if (error.message === "gemini_timeout") {
      // Job stays pending; sweeper will refund credit in ≤1h
      return Response.json(
        { error: { code: "gemini_timeout", message: "Analysis timed out — try again later" } },
        { status: 504 }
      );
    }

    return Response.json(
      { error: { code: "gemini_unavailable", message: "Vision service unavailable" } },
      { status: 502 }
    );
  }
}

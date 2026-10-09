import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { settlePhotoCredit } from "@/lib/credits";
import type { Database } from "@/types/supabase";
import type { FoodAnalysis } from "@/types/food";
import { z } from "zod";

const schema = z.object({
  photo_job_id: z.string().uuid(),
  photo_url: z.string().url(),
  analysis: z.object({
    items: z.array(z.any()),
    total_calories: z.number().positive(),
    total_protein_g: z.number(),
    total_carbs_g: z.number(),
    total_fat_g: z.number(),
    description: z.string(),
    confidence: z.enum(["high", "medium", "low"]),
  }),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: { code: "unauthorized", message: "Authentication required" } },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { code: "invalid_body", message: "Invalid JSON" } },
      { status: 400 }
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "validation_error", message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { photo_job_id, photo_url, analysis } = parsed.data;
  const a = analysis as FoodAnalysis;

  // Verify the photo_job belongs to this student and is still pending
  const service = createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: job } = await service
    .from("photo_jobs")
    .select("id, status, student_id")
    .eq("id", photo_job_id)
    .single();

  if (!job || job.student_id !== user.id) {
    return Response.json(
      { error: { code: "job_not_found", message: "Photo job not found" } },
      { status: 404 }
    );
  }

  if (job.status !== "pending") {
    return Response.json(
      { error: { code: "job_already_processed", message: "Photo job already processed" } },
      { status: 409 }
    );
  }

  const { data: foodLog, error: insertError } = await service
    .from("food_logs")
    .insert({
      student_id: user.id,
      photo_url,
      analysis_json: a as unknown as import("@/types/supabase").Json,
      total_calories: Math.round(a.total_calories),
      total_protein_g: a.total_protein_g,
      total_carbs_g: a.total_carbs_g,
      total_fat_g: a.total_fat_g,
    })
    .select("id")
    .single();

  if (insertError || !foodLog) {
    return Response.json(
      { error: { code: "insert_error", message: "Failed to save food log" } },
      { status: 500 }
    );
  }

  try {
    await settlePhotoCredit(photo_job_id);
  } catch {
    // Job might already be settled — non-fatal
  }

  return Response.json({ data: { food_log_id: foodLog.id } }, { status: 201 });
}

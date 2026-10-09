import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
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

  const service = createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Verify caller is an instructor
  const { data: instructor } = await service
    .from("instructors")
    .select("profile_id")
    .eq("profile_id", user.id)
    .single();

  if (!instructor) {
    return Response.json(
      { error: { code: "not_instructor", message: "Only instructors can invite students" } },
      { status: 403 }
    );
  }

  const inviteToken = crypto.randomUUID();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const redirectTo = `${appUrl}/api/invites/${inviteToken}/accept`;

  // Create (or re-invite) the student user via Supabase Admin API
  const { data: inviteData, error: inviteError } = await service.auth.admin.inviteUserByEmail(
    parsed.data.email,
    { data: { role: "student" }, redirectTo }
  );

  if (inviteError || !inviteData?.user) {
    return Response.json(
      { error: { code: "invite_error", message: inviteError?.message ?? "Failed to send invite" } },
      { status: 500 }
    );
  }

  const studentId = inviteData.user.id;

  // Ensure profile row exists for invited user
  // cast needed: generated types predate the profiles.email column (added separately)
  await service.from("profiles").upsert(
    { id: studentId, email: parsed.data.email, role: "student" } as unknown as Database["public"]["Tables"]["profiles"]["Insert"],
    { onConflict: "id", ignoreDuplicates: true }
  );

  // Upsert student_instructor row (invite_token column added in migration 20261009000001;
  // cast needed until types are regenerated)
  const siRow = {
    instructor_id: user.id,
    student_id: studentId,
    status: "pending",
    invite_token: inviteToken,
  } as unknown as Database["public"]["Tables"]["student_instructor"]["Insert"];

  const { error: siError } = await service
    .from("student_instructor")
    .upsert(siRow, { onConflict: "student_id,instructor_id" });

  if (siError) {
    return Response.json(
      { error: { code: "link_error", message: "Failed to create instructor link" } },
      { status: 500 }
    );
  }

  return Response.json({ data: { invited: true, email: parsed.data.email } }, { status: 201 });
}

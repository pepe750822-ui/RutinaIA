import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

  // RLS guarantees instructor only sees their own student_instructor rows
  const { data, error } = await supabase
    .from("student_instructor")
    .select("student_id, status, accepted_at, profiles!student_instructor_student_id_fkey(id, display_name, avatar_url)")
    .eq("instructor_id", user.id)
    .eq("status", "active");

  if (error) {
    return Response.json(
      { error: { code: "query_error", message: error.message } },
      { status: 500 }
    );
  }

  return Response.json({ data: data ?? [] });
}

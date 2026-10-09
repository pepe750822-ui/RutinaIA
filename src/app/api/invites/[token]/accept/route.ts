import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { redirect } from "next/navigation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const service = createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // invite_token column added in migration 20261009000001; cast until types regenerated
  const { data: invite } = await service
    .from("student_instructor")
    .select("id, student_id, status")
    .eq("invite_token" as "id", token)
    .single();

  if (!invite) {
    redirect("/dashboard?invite=invalid");
  }

  if (invite.status === "active") {
    redirect("/dashboard?invite=already_accepted");
  }

  if (invite.student_id !== user.id) {
    redirect("/dashboard?invite=wrong_account");
  }

  await service
    .from("student_instructor")
    .update({ status: "active", accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  redirect("/dashboard?invite=accepted");
}

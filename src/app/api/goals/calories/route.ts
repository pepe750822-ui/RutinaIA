import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { z } from "zod";

const schema = z.object({
  daily_limit_kcal: z.number().int().min(500).max(10000),
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

  const today = new Date().toISOString().slice(0, 10);

  const { data: goal, error } = await service
    .from("calorie_goals")
    .upsert(
      { student_id: user.id, daily_limit_kcal: parsed.data.daily_limit_kcal, effective_from: today },
      { onConflict: "student_id,effective_from" }
    )
    .select("id, daily_limit_kcal")
    .single();

  if (error || !goal) {
    return Response.json(
      { error: { code: "upsert_error", message: "Failed to save calorie goal" } },
      { status: 500 }
    );
  }

  return Response.json({ data: { goal_id: goal.id, daily_limit_kcal: goal.daily_limit_kcal } }, { status: 200 });
}

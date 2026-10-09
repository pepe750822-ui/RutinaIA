import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { z } from "zod";

const schema = z.object({
  amount_ml: z.number().int().min(1).max(2000),
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

  const { data: waterLog, error } = await service
    .from("water_logs")
    .insert({ student_id: user.id, amount_ml: parsed.data.amount_ml })
    .select("id, amount_ml")
    .single();

  if (error || !waterLog) {
    return Response.json(
      { error: { code: "insert_error", message: "Failed to save water log" } },
      { status: 500 }
    );
  }

  return Response.json({ data: { water_log_id: waterLog.id, amount_ml: waterLog.amount_ml } }, { status: 201 });
}

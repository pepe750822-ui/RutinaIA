import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json(
      { error: { code: "unauthorized", message: "Invalid CRON_SECRET" } },
      { status: 401 }
    );
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase.rpc("sweep_stale_jobs");

  if (error) {
    return Response.json(
      { error: { code: "db_error", message: error.message } },
      { status: 500 }
    );
  }

  return Response.json({ data: { swept: data as number } });
}

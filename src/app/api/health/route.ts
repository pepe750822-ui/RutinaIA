import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Lightweight connectivity check — no rows fetched
    const { error } = await supabase.from("profiles").select("id").limit(0);
    if (error) throw error;

    return Response.json(
      { data: { status: "ok", timestamp: new Date().toISOString() } },
      { status: 200 }
    );
  } catch {
    return Response.json(
      { error: { status: "error", timestamp: new Date().toISOString() } },
      { status: 503 }
    );
  }
}

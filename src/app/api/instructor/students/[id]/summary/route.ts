import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: studentId } = await params;

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

  // Verify instructor↔student relationship (RLS also enforces this on subsequent queries)
  const { data: relation } = await supabase
    .from("student_instructor")
    .select("id")
    .eq("instructor_id", user.id)
    .eq("student_id", studentId)
    .eq("status", "active")
    .single();

  if (!relation) {
    return Response.json(
      { error: { code: "forbidden", message: "Student not linked to this instructor" } },
      { status: 403 }
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  const [{ data: foodLogs }, { data: waterLogs }, { data: goal }, { data: profile }] =
    await Promise.all([
      supabase
        .from("food_logs")
        .select("id, photo_url, total_calories, total_protein_g, total_carbs_g, total_fat_g, analysis_json, created_at")
        .eq("student_id", studentId)
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false }),
      supabase
        .from("water_logs")
        .select("id, amount_ml, logged_at")
        .eq("student_id", studentId)
        .gte("logged_at", today.toISOString())
        .order("logged_at", { ascending: false }),
      supabase
        .from("calorie_goals")
        .select("daily_limit_kcal")
        .eq("student_id", studentId)
        .lte("effective_from", todayStr)
        .order("effective_from", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .eq("id", studentId)
        .single(),
    ]);

  const totalCalories = (foodLogs ?? []).reduce((s, f) => s + f.total_calories, 0);
  const totalWaterMl = (waterLogs ?? []).reduce((s, w) => s + w.amount_ml, 0);
  const dailyLimitKcal = goal?.daily_limit_kcal ?? null;

  return Response.json({
    data: {
      profile,
      food_logs: foodLogs ?? [],
      water_logs: waterLogs ?? [],
      total_calories: Math.round(totalCalories),
      total_water_ml: totalWaterMl,
      daily_limit_kcal: dailyLimitKcal,
    },
  });
}

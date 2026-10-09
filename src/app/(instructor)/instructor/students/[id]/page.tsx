import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentNutritionCard from "@/components/instructor/StudentNutritionCard";
import type { FoodAnalysis } from "@/types/food";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: studentId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify active relationship
  const { data: relation } = await supabase
    .from("student_instructor")
    .select("id")
    .eq("instructor_id", user.id)
    .eq("student_id", studentId)
    .eq("status", "active")
    .single();

  if (!relation) notFound();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  const [{ data: profile }, { data: foodLogs }, { data: waterLogs }, { data: goal }] =
    await Promise.all([
      supabase.from("profiles").select("display_name").eq("id", studentId).single(),
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
    ]);

  const totalCalories = (foodLogs ?? []).reduce((s, f) => s + f.total_calories, 0);
  const totalWaterMl = (waterLogs ?? []).reduce((s, w) => s + w.amount_ml, 0);

  return (
    <main className="flex flex-col pt-8 pb-24 min-h-screen">
      <StudentNutritionCard
        studentName={profile?.display_name ?? "Alumno"}
        totalCalories={Math.round(totalCalories)}
        totalWaterMl={totalWaterMl}
        dailyLimitKcal={goal?.daily_limit_kcal ?? null}
        foodLogs={(foodLogs ?? []) as unknown as Parameters<typeof StudentNutritionCard>[0]["foodLogs"]}
        waterLogs={waterLogs ?? []}
      />
    </main>
  );
}

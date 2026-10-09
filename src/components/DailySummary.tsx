import { createClient } from "@/lib/supabase/server";

const WATER_GOAL_ML = 2000;

export default async function DailySummary() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  const [{ data: foodLogs }, { data: waterLogs }, { data: goal }] = await Promise.all([
    supabase
      .from("food_logs")
      .select("total_calories")
      .eq("student_id", user.id)
      .gte("created_at", today.toISOString()),
    supabase
      .from("water_logs")
      .select("amount_ml")
      .eq("student_id", user.id)
      .gte("logged_at", today.toISOString()),
    supabase
      .from("calorie_goals")
      .select("daily_limit_kcal")
      .eq("student_id", user.id)
      .lte("effective_from", todayStr)
      .order("effective_from", { ascending: false })
      .limit(1)
      .single(),
  ]);

  const totalCalories = (foodLogs ?? []).reduce((s, f) => s + f.total_calories, 0);
  const dailyLimitKcal = goal?.daily_limit_kcal ?? null;
  const totalWaterMl = (waterLogs ?? []).reduce((s, w) => s + w.amount_ml, 0);
  const waterPct = Math.min(100, Math.round((totalWaterMl / WATER_GOAL_ML) * 100));

  return (
    <section className="w-full max-w-sm mx-auto px-4 space-y-4">
      {/* Calorie summary */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Calorías</span>
        <span className="text-sm text-[--fg-muted]">
          {Math.round(totalCalories)}
          {dailyLimitKcal ? ` / ${dailyLimitKcal} kcal` : " kcal"}
        </span>
      </div>
      {dailyLimitKcal && (
        <div className="h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              totalCalories > dailyLimitKcal ? "bg-red-400" : "bg-emerald-400"
            }`}
            style={{ width: `${Math.min(100, Math.round((totalCalories / dailyLimitKcal) * 100))}%` }}
            role="progressbar"
            aria-valuenow={Math.round(totalCalories)}
            aria-valuemin={0}
            aria-valuemax={dailyLimitKcal}
            aria-label={`${Math.round(totalCalories)} de ${dailyLimitKcal} kcal`}
          />
        </div>
      )}

      {/* Water summary */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Agua</span>
        <span className="text-sm text-[--fg-muted]">
          {totalWaterMl} / {WATER_GOAL_ML} ml
        </span>
      </div>
      <div className="h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-sky-400 transition-all duration-300"
          style={{ width: `${waterPct}%` }}
          role="progressbar"
          aria-valuenow={totalWaterMl}
          aria-valuemin={0}
          aria-valuemax={WATER_GOAL_ML}
          aria-label={`${totalWaterMl} de ${WATER_GOAL_ML} ml de agua`}
        />
      </div>
    </section>
  );
}

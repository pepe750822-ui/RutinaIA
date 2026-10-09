import type { FoodAnalysis } from "@/types/food";

const WATER_GOAL_ML = 2000;

interface FoodLogRow {
  id: string;
  photo_url: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  analysis_json: FoodAnalysis;
  created_at: string;
}

interface WaterLogRow {
  id: string;
  amount_ml: number;
  logged_at: string;
}

interface Props {
  studentName: string;
  totalCalories: number;
  totalWaterMl: number;
  dailyLimitKcal: number | null;
  foodLogs: FoodLogRow[];
  waterLogs: WaterLogRow[];
}

export default function StudentNutritionCard({
  studentName,
  totalCalories,
  totalWaterMl,
  dailyLimitKcal,
  foodLogs,
  waterLogs,
}: Props) {
  const waterPct = Math.min(100, Math.round((totalWaterMl / WATER_GOAL_ML) * 100));
  const caloriePct = dailyLimitKcal
    ? Math.min(100, Math.round((totalCalories / dailyLimitKcal) * 100))
    : 0;
  const overLimit = dailyLimitKcal !== null && totalCalories > dailyLimitKcal;

  return (
    <article className="flex flex-col gap-5 w-full max-w-sm mx-auto px-4">
      <h1 className="text-lg font-bold">{studentName}</h1>

      {/* Calorie summary */}
      <section className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Calorías hoy</span>
          <span className="text-[--fg-muted]">
            {Math.round(totalCalories)}
            {dailyLimitKcal ? ` / ${dailyLimitKcal} kcal` : " kcal"}
          </span>
        </div>
        {dailyLimitKcal && (
          <div className="h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${overLimit ? "bg-red-400" : "bg-emerald-400"}`}
              style={{ width: `${caloriePct}%` }}
              role="progressbar"
              aria-valuenow={Math.round(totalCalories)}
              aria-valuemin={0}
              aria-valuemax={dailyLimitKcal}
            />
          </div>
        )}
      </section>

      {/* Water summary */}
      <section className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Agua</span>
          <span className="text-[--fg-muted]">{totalWaterMl} / {WATER_GOAL_ML} ml</span>
        </div>
        <div className="h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-sky-400 transition-all"
            style={{ width: `${waterPct}%` }}
            role="progressbar"
            aria-valuenow={totalWaterMl}
            aria-valuemin={0}
            aria-valuemax={WATER_GOAL_ML}
          />
        </div>
      </section>

      {/* Food logs */}
      {foodLogs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Comidas registradas</h2>
          {foodLogs.map((log) => (
            <div key={log.id} className="flex gap-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 p-3">
              <img
                src={log.photo_url}
                alt=""
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{log.analysis_json.description}</p>
                <p className="text-xs text-[--fg-muted]">
                  {Math.round(log.total_calories)} kcal · P {Math.round(log.total_protein_g)}g ·
                  C {Math.round(log.total_carbs_g)}g · G {Math.round(log.total_fat_g)}g
                </p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Water logs */}
      {waterLogs.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Agua registrada</h2>
          <ul className="space-y-1">
            {waterLogs.map((log) => (
              <li key={log.id} className="flex justify-between text-sm text-[--fg-muted]">
                <span>{new Date(log.logged_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
                <span>{log.amount_ml} ml</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {foodLogs.length === 0 && waterLogs.length === 0 && (
        <p className="text-[--fg-muted] text-sm text-center">Sin registros hoy.</p>
      )}
    </article>
  );
}

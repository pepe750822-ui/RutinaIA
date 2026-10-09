import { createClient } from "@/lib/supabase/server";
import type { FoodLogEntry } from "@/types/food";

export default async function FoodLogList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: logs } = await supabase
    .from("food_logs")
    .select("*")
    .eq("student_id", user.id)
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: false });

  const entries = (logs ?? []) as unknown as FoodLogEntry[];
  const totalCalories = entries.reduce((sum, e) => sum + e.total_calories, 0);

  if (entries.length === 0) {
    return (
      <section className="w-full max-w-sm mx-auto px-4">
        <p className="text-[--fg-muted] text-sm text-center">Sin registros hoy.</p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-sm mx-auto px-4 space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-sm">Hoy</h2>
        <span className="text-sm text-[--fg-muted]">{Math.round(totalCalories)} kcal total</span>
      </div>

      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center gap-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 p-3"
        >
          <img
            src={entry.photo_url}
            alt=""
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{entry.analysis_json.description}</p>
            <p className="text-xs text-[--fg-muted]">
              {Math.round(entry.total_calories)} kcal · P {Math.round(entry.total_protein_g)}g · C{" "}
              {Math.round(entry.total_carbs_g)}g · G {Math.round(entry.total_fat_g)}g
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}

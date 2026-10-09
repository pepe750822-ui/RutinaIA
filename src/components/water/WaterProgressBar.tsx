import { createClient } from "@/lib/supabase/server";

const DAILY_GOAL_ML = 2000;

export default async function WaterProgressBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: logs } = await supabase
    .from("water_logs")
    .select("amount_ml")
    .eq("student_id", user.id)
    .gte("logged_at", today.toISOString());

  const totalMl = (logs ?? []).reduce((sum, l) => sum + l.amount_ml, 0);
  const pct = Math.min(100, Math.round((totalMl / DAILY_GOAL_ML) * 100));

  return (
    <div className="w-full max-w-sm mx-auto px-4 space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Agua</span>
        <span className="text-[--fg-muted]">
          {totalMl} / {DAILY_GOAL_ML} ml
        </span>
      </div>
      <div className="h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-sky-400 transition-all duration-300"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={totalMl}
          aria-valuemin={0}
          aria-valuemax={DAILY_GOAL_ML}
          aria-label={`${totalMl} de ${DAILY_GOAL_ML} ml de agua`}
        />
      </div>
    </div>
  );
}

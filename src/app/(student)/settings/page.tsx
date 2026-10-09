import { createClient } from "@/lib/supabase/server";
import CalorieGoalForm from "@/components/settings/CalorieGoalForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentLimit: number | undefined;

  if (user) {
    const today = new Date().toISOString().slice(0, 10);
    const { data: goal } = await supabase
      .from("calorie_goals")
      .select("daily_limit_kcal")
      .eq("student_id", user.id)
      .lte("effective_from", today)
      .order("effective_from", { ascending: false })
      .limit(1)
      .single();

    currentLimit = goal?.daily_limit_kcal ?? undefined;
  }

  return (
    <main className="flex flex-col items-center px-4 pt-8 pb-24 min-h-screen gap-6">
      <h1 className="text-lg font-bold self-start">Configuración</h1>
      <CalorieGoalForm currentLimit={currentLimit} />
    </main>
  );
}

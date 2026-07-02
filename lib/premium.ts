import { getSupabaseClient } from "./supabase";

const MAX_FREE_PER_WEEK = 3;

export async function checkWeeklyLimit(userId: string): Promise<{
  allowed: boolean;
  used: number;
  max: number;
  plan: string;
}> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { allowed: true, used: 0, max: MAX_FREE_PER_WEEK, plan: "gratis" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, rutinas_semana, ultimo_reset_semana")
    .eq("id", userId)
    .single() as unknown as { data: { plan: string; rutinas_semana: number; ultimo_reset_semana: string } | null };

  if (!profile) {
    return { allowed: true, used: 0, max: MAX_FREE_PER_WEEK, plan: "gratis" };
  }

  if (profile.plan === "premium") {
    return { allowed: true, used: 0, max: Infinity, plan: "premium" };
  }

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const lastReset = profile.ultimo_reset_semana
    ? new Date(profile.ultimo_reset_semana)
    : null;

  let used = profile.rutinas_semana ?? 0;

  if (lastReset && lastReset < startOfWeek) {
    used = 0;
    await supabase
      .from("profiles")
      .update({ rutinas_semana: 0, ultimo_reset_semana: today.toISOString().split("T")[0] } as never)
      .eq("id", userId);
  }

  const allowed = used < MAX_FREE_PER_WEEK;

  return { allowed, used, max: MAX_FREE_PER_WEEK, plan: "gratis" };
}

export async function incrementWeeklyCount(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("rutinas_semana")
    .eq("id", userId)
    .single() as unknown as { data: { rutinas_semana: number } | null };

  const current = (profile?.rutinas_semana ?? 0) + 1;
  const today = new Date().toISOString().split("T")[0];

  await supabase
    .from("profiles")
    .update({ rutinas_semana: current, ultimo_reset_semana: today } as never)
    .eq("id", userId);
}

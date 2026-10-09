import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface StudentRow {
  student_id: string;
  profiles: { id: string; display_name: string | null; avatar_url: string | null } | null;
}

interface DaySummary {
  totalCalories: number;
  dailyLimitKcal: number | null;
}

type CalorieStatus = "under" | "on_track" | "over";

function calorieStatus(total: number, limit: number | null): CalorieStatus {
  if (!limit) return "under";
  if (total > limit) return "over";
  if (total >= limit * 0.8) return "on_track";
  return "under";
}

const STATUS_STYLE: Record<CalorieStatus, string> = {
  under: "bg-neutral-100 text-neutral-500",
  on_track: "bg-emerald-100 text-emerald-700",
  over: "bg-red-100 text-red-600",
};

const STATUS_LABEL: Record<CalorieStatus, string> = {
  under: "Bajo meta",
  on_track: "En meta",
  over: "Sobre meta",
};

async function fetchDaySummary(supabase: Awaited<ReturnType<typeof createClient>>, studentId: string): Promise<DaySummary> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  const [{ data: foodLogs }, { data: goal }] = await Promise.all([
    supabase
      .from("food_logs")
      .select("total_calories")
      .eq("student_id", studentId)
      .gte("created_at", today.toISOString()),
    supabase
      .from("calorie_goals")
      .select("daily_limit_kcal")
      .eq("student_id", studentId)
      .lte("effective_from", todayStr)
      .order("effective_from", { ascending: false })
      .limit(1)
      .single(),
  ]);

  return {
    totalCalories: (foodLogs ?? []).reduce((s, f) => s + f.total_calories, 0),
    dailyLimitKcal: goal?.daily_limit_kcal ?? null,
  };
}

export default async function StudentList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: rows } = await supabase
    .from("student_instructor")
    .select("student_id, profiles!student_instructor_student_id_fkey(id, display_name, avatar_url)")
    .eq("instructor_id", user.id)
    .eq("status", "active");

  const students = (rows ?? []) as StudentRow[];

  if (students.length === 0) {
    return (
      <p className="text-[--fg-muted] text-sm text-center w-full max-w-sm mx-auto px-4">
        Aún no tienes alumnos activos. Invita uno arriba.
      </p>
    );
  }

  const summaries = await Promise.all(
    students.map((s) => fetchDaySummary(supabase, s.student_id))
  );

  return (
    <section className="w-full max-w-sm mx-auto px-4 space-y-3">
      <h2 className="font-semibold text-sm">Alumnos activos hoy</h2>
      {students.map((student, i) => {
        const summary = summaries[i];
        const status = calorieStatus(summary.totalCalories, summary.dailyLimitKcal);
        const name = student.profiles?.display_name ?? "Alumno";

        return (
          <Link
            key={student.student_id}
            href={`/instructor/students/${student.student_id}`}
            className="flex items-center gap-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 p-3 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{name}</p>
              <p className="text-xs text-[--fg-muted]">
                {Math.round(summary.totalCalories)} kcal hoy
                {summary.dailyLimitKcal ? ` / ${summary.dailyLimitKcal}` : ""}
              </p>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_STYLE[status]}`}>
              {STATUS_LABEL[status]}
            </span>
          </Link>
        );
      })}
    </section>
  );
}

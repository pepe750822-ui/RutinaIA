const FREE_EXERCISE_DB_RAW =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

export function getExerciseImageUrlByName(name: string): string | null {
  if (!name) return null;
  const slug = name
    .replace(/\//g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .replace(/_+/g, "_");
  return `${FREE_EXERCISE_DB_RAW}/${slug}/0.jpg`;
}

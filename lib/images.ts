const FREE_EXERCISE_DB_RAW =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export function getExerciseImageUrlByName(name: string): string | null {
  if (!name) return null;
  const titleCased = toTitleCase(name);
  const slug = titleCased
    .replace(/\//g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .replace(/_+/g, "_");
  return `${FREE_EXERCISE_DB_RAW}/${slug}/0.jpg`;
}

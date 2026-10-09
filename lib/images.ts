const FREE_EXERCISE_DB_RAW =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function nameToSlug(name: string): string {
  return toTitleCase(name)
    .replace(/\//g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .replace(/_+/g, "_");
}

function stripParenthetical(name: string): string {
  return name.replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim();
}

export function getExerciseImageUrlByName(name: string): string | null {
  if (!name) return null;
  const slug = nameToSlug(name);
  return `${FREE_EXERCISE_DB_RAW}/${slug}/0.jpg`;
}

export function getExerciseImageFallbacks(name: string): string[] {
  if (!name) return [];
  const urls: string[] = [];
  const primary = nameToSlug(name);
  urls.push(`${FREE_EXERCISE_DB_RAW}/${primary}/0.jpg`);
  urls.push(`${FREE_EXERCISE_DB_RAW}/${primary}/1.jpg`);
  const stripped = stripParenthetical(name);
  if (stripped !== name) {
    const slug2 = nameToSlug(stripped);
    urls.push(`${FREE_EXERCISE_DB_RAW}/${slug2}/0.jpg`);
    urls.push(`${FREE_EXERCISE_DB_RAW}/${slug2}/1.jpg`);
  }
  return urls;
}

const LETTER_COLORS = [
  "#00ff88", "#0066ff", "#ff0066", "#ffaa00", "#aa66ff",
  "#00ccff", "#ff6600", "#66ff33", "#ff3399", "#33ccff",
];
export function getPlaceholderSvg(name: string): string {
  const letter = (name || "?").charAt(0).toUpperCase();
  const color = LETTER_COLORS[(name || "?").charCodeAt(0) % LETTER_COLORS.length];
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
      <rect width="400" height="200" fill="${color}15" rx="8"/>
      <circle cx="200" cy="100" r="48" fill="${color}25"/>
      <text x="200" y="108" text-anchor="middle" font-size="56" font-weight="700" fill="${color}" font-family="system-ui,sans-serif">${letter}</text>
    </svg>`
  )}`;
}

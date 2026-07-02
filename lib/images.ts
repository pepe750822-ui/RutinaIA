const EXERCISEDB_CDN = "https://static.exercisedb.dev/media";

export function getExerciseImageUrl(mediaId?: string | null): string | null {
  if (!mediaId) return null;
  return `${EXERCISEDB_CDN}/${mediaId}.gif`;
}

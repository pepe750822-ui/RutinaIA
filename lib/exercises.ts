import { Exercise } from "@/types";

let exercisesCache: Exercise[] | null = null;

export async function getAllExercises(): Promise<Exercise[]> {
  if (exercisesCache) return exercisesCache;

  try {
    const res = await fetch("/data/exercises.json");
    const data = await res.json();
    exercisesCache = data as Exercise[];
    return exercisesCache;
  } catch {
    return [];
  }
}

export function filterExercisesByBodyPart(
  exercises: Exercise[],
  bodyParts: string[]
): Exercise[] {
  if (!bodyParts.length) return exercises;
  return exercises.filter((e) =>
    bodyParts.some(
      (bp) => e.bodyPart.toLowerCase() === bp.toLowerCase()
    )
  );
}

export function filterExercisesByEquipment(
  exercises: Exercise[],
  equipment: string[]
): Exercise[] {
  if (!equipment.length) return exercises;
  return exercises.filter((e) =>
    equipment.some(
      (eq) => e.equipment.toLowerCase() === eq.toLowerCase()
    )
  );
}

export function getBodyParts(exercises: Exercise[]): string[] {
  return [...new Set(exercises.map((e) => e.bodyPart))].sort();
}

export function getEquipment(exercises: Exercise[]): string[] {
  return [...new Set(exercises.map((e) => e.equipment))].sort();
}

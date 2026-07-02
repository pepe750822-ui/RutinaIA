import { Exercise } from "@/types";
import fs from "fs";
import path from "path";

let exercisesCache: Exercise[] | null = null;

export async function getAllExercises(): Promise<Exercise[]> {
  if (exercisesCache) return exercisesCache;

  try {
    const filePath = path.join(process.cwd(), "public", "data", "exercises.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as Exercise[];
    exercisesCache = data;
    return exercisesCache;
  } catch {
    return [];
  }
}

const BODY_PART_MAP: Record<string, string> = {
  todo: "full body",
  pecho: "chest",
  espalda: "back",
  piernas: "upper legs",
  pierna: "upper legs",
  hombros: "shoulders",
  brazos: "upper arms",
  brazo: "upper arms",
  core: "waist",
  cardio: "cardio",
};

const EQUIPMENT_MAP: Record<string, string> = {
  peso_corporal: "body weight",
  mancuernas: "dumbbell",
  barra: "barbell",
  bandas: "band",
  maquina: "machine",
};

export function filterExercisesByBodyPart(
  exercises: Exercise[],
  bodyParts: string[]
): Exercise[] {
  if (!bodyParts.length) return exercises;
  const englishTerms = bodyParts.map((bp) => BODY_PART_MAP[bp.toLowerCase()] || bp.toLowerCase());
  return exercises.filter((e) =>
    englishTerms.some((term) => e.bodyPart.toLowerCase() === term)
  );
}

export function filterExercisesByEquipment(
  exercises: Exercise[],
  equipment: string[]
): Exercise[] {
  if (!equipment.length) return exercises;
  const englishTerms = equipment.map((eq) => EQUIPMENT_MAP[eq.toLowerCase()] || eq.toLowerCase());
  return exercises.filter((e) =>
    englishTerms.some((term) => e.equipment.toLowerCase() === term)
  );
}

export function getBodyParts(exercises: Exercise[]): string[] {
  return [...new Set(exercises.map((e) => e.bodyPart))].sort();
}

export function getEquipment(exercises: Exercise[]): string[] {
  return [...new Set(exercises.map((e) => e.equipment))].sort();
}

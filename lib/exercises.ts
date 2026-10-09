import { Exercise } from "@/types";
import fs from "fs";
import path from "path";

let exercisesCache: Exercise[] | null = null;

export async function getAllExercises(): Promise<Exercise[]> {
  if (exercisesCache) return exercisesCache;

  try {
    const filePath = path.join(process.cwd(), "public", "data", "exercises.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.length === 0) return [];
    exercisesCache = data as Exercise[];
    return exercisesCache;
  } catch {
    return [];
  }
}

const BODY_PART_MAP: Record<string, string[]> = {
  todo: ["full body", "total"],
  pecho: ["chest", "pectoral"],
  espalda: ["back", "lat", "lats", "upper back", "lower back"],
  piernas: ["upper legs", "lower legs", "legs", "quadriceps", "hamstring", "glute", "calves", "hip"],
  hombros: ["shoulders", "deltoid", "trapezius"],
  brazos: ["upper arms", "lower arms", "biceps", "triceps", "forearms"],
  core: ["waist", "abs", "abdominals", "core", "abdominal"],
  cardio: ["cardio"],
};

const EQUIPMENT_MAP: Record<string, string[]> = {
  peso_corporal: ["body weight", "bodyweight", "none"],
  mancuernas: ["dumbbell"],
  barra: ["barbell", "ez barbell"],
  bandas: ["band", "resistance band"],
  maquina: ["machine", "cable", "smith machine"],
};

function normalize(val: unknown): string {
  return String(val ?? "").toLowerCase().trim();
}

export function filterExercisesByBodyPart(
  exercises: Exercise[],
  bodyParts: string[]
): Exercise[] {
  if (!Array.isArray(exercises)) return [];
  if (!Array.isArray(bodyParts) || bodyParts.length === 0) return exercises;

  const searchTerms = bodyParts.flatMap((bp) => BODY_PART_MAP[bp.toLowerCase()] || [bp.toLowerCase()]);

  return exercises.filter((ex) => {
    if (!ex) return false;
    const bp = normalize(ex.body_part);
    return searchTerms.some((term) => bp.includes(term));
  });
}

export function filterExercisesByEquipment(
  exercises: Exercise[],
  equipment: string[]
): Exercise[] {
  if (!Array.isArray(exercises)) return [];
  if (!Array.isArray(equipment) || equipment.length === 0) return exercises;

  const searchTerms = equipment.flatMap((eq) => EQUIPMENT_MAP[eq.toLowerCase()] || [eq.toLowerCase()]);

  return exercises.filter((ex) => {
    if (!ex) return false;
    const eq = normalize(ex.equipment);
    return searchTerms.some((term) => eq.includes(term));
  });
}

export function getBodyParts(exercises: Exercise[]): string[] {
  if (!Array.isArray(exercises)) return [];
  const parts = new Set<string>();
  for (const ex of exercises) {
    if (ex?.body_part) parts.add(ex.body_part);
  }
  return [...parts].sort();
}

export function getEquipment(exercises: Exercise[]): string[] {
  if (!Array.isArray(exercises)) return [];
  const eq = new Set<string>();
  for (const ex of exercises) {
    if (ex?.equipment) eq.add(ex.equipment);
  }
  return [...eq].sort();
}

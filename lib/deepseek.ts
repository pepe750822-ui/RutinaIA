import { Exercise, RutinaEjercicio } from "@/types";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

function buildPrompt(
  objetivo: string,
  nivel: string,
  tiempo: number,
  equipo: string[],
  musculos: string[],
  ejercicios: Exercise[]
): string {
  return `Eres un entrenador personal experto. Genera una rutina de ejercicios personalizada.

OBJETIVO DEL USUARIO: ${objetivo}
NIVEL: ${nivel}
TIEMPO DISPONIBLE: ${tiempo} minutos
EQUIPO DISPONIBLE: ${equipo.length ? equipo.join(", ") : "Ninguno (solo peso corporal)"}
GRUPOS MUSCULARES: ${musculos.join(", ")}

Los ejercicios deben seleccionarse del siguiente dataset de ${ejercicios.length} ejercicios.
Para cada ejercicio, proporciona series, repeticiones y descanso.

Responde SOLO con un JSON válido con esta estructura:
{
  "nombre": "Nombre sugerido para la rutina",
  "duracion_minutos": ${tiempo},
  "ejercicios": [
    {
      "exerciseId": "id del ejercicio del dataset",
      "sets": 3,
      "reps": 12,
      "restSeconds": 60,
      "order": 1
    }
  ]
}

Incluye de 4 a 8 ejercicios. Usa SOLO los IDs del dataset proporcionado.`;
}

export async function generarRutinaConIA(
  objetivo: string,
  nivel: string,
  tiempo: number,
  equipo: string[],
  musculos: string[],
  ejercicios: Exercise[]
): Promise<{ nombre: string; duracion_minutos: number; ejercicios: RutinaEjercicio[] }> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY no configurada");
  }

  const prompt = buildPrompt(objetivo, nivel, tiempo, equipo, musculos, ejercicios);

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "Eres un entrenador personal experto. Siempre respondes con JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error DeepSeek API: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || "";

  const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  const ejerciciosMap = new Map(ejercicios.map((e) => [e.id, e]));

  const rutinaEjercicios: RutinaEjercicio[] = parsed.ejercicios
    .filter((ej: { exerciseId: string }) => ejerciciosMap.has(ej.exerciseId))
    .map((ej: { exerciseId: string; sets: number; reps: number; restSeconds: number; order: number }) => ({
      exercise: ejerciciosMap.get(ej.exerciseId)!,
      sets: ej.sets,
      reps: ej.reps,
      restSeconds: ej.restSeconds,
      order: ej.order,
    }));

  return {
    nombre: parsed.nombre,
    duracion_minutos: parsed.duracion_minutos,
    ejercicios: rutinaEjercicios,
  };
}

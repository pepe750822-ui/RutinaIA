import { Exercise, RutinaEjercicio, RutinaGeneratorForm } from "@/types";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

const OBJETIVO_LABELS: Record<string, string> = {
  perder_peso: "Perder peso",
  mejorar_condicion: "Mejorar condición física",
  ganar_muscular: "Ganar masa muscular",
  mantener: "Mantenerse en forma",
};

const NIVEL_LABELS: Record<string, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

const EXPERIENCIA_LABELS: Record<string, string> = {
  ninguna: "Ninguna",
  basica: "Básica (1-6 meses)",
  intermedia: "Intermedia (6-24 meses)",
  avanzada: "Avanzada (+2 años)",
};

const CONOCIMIENTO_LABELS: Record<string, string> = {
  poco: "Poco",
  bueno: "Bueno",
  muy_bueno: "Muy bueno",
};

const CONDICION_LABELS: Record<string, string> = {
  mala: "Mala",
  regular: "Regular",
  buena: "Buena",
  excelente: "Excelente",
};

function buildPrompt(
  data: RutinaGeneratorForm,
  ejercicios: Exercise[]
): string {
  return `Eres un entrenador personal experto y nutricionista. Genera una rutina de ejercicios HIPERPERSONALIZADA basada en los siguientes datos del usuario.

## DATOS DEL USUARIO

### Objetivo
- Objetivo principal: ${OBJETIVO_LABELS[data.objetivo]}

### Nivel y experiencia
- Nivel: ${NIVEL_LABELS[data.nivel]}
- Experiencia entrenando: ${EXPERIENCIA_LABELS[data.experiencia]}
- Conocimiento de técnica: ${CONOCIMIENTO_LABELS[data.conocimiento]}

### Datos personales
- Edad: ${data.edad} años
- Peso: ${data.peso} kg
- Altura: ${data.altura} cm
- Género: ${data.genero}
- IMC aproximado: ${(data.peso / ((data.altura / 100) * (data.altura / 100))).toFixed(1)}

### Condición física
- Condición actual: ${CONDICION_LABELS[data.condicion_fisica]}
- Lesiones previas: ${data.lesiones || "Ninguna"}
- Condiciones médicas: ${data.condiciones_medicas || "Ninguna"}

### Preferencias de entrenamiento
- Frecuencia semanal: ${data.frecuencia_semanal} días
- Duración por sesión: ${data.duracion_minutos} minutos
- Horario preferido: ${data.horario_preferido}
- Equipo disponible: ${data.equipo_disponible.length ? data.equipo_disponible.join(", ") : "Ninguno (solo peso corporal)"}

### Musculatura
- Grupos musculares a trabajar: ${data.grupos_musculares.join(", ")}
- Prioridad muscular: ${data.prioridad_muscular || "Ninguna en particular"}

## INSTRUCCIONES

1. Los ejercicios deben seleccionarse del siguiente dataset de ${ejercicios.length} ejercicios.
2. Para cada ejercicio, proporciona series, repeticiones y descanso.
3. Adapta la intensidad según el nivel, experiencia y condición física del usuario.
4. Si hay lesiones o condiciones médicas, evita ejercicios que puedan agravarlas.
5. Distribuye los ejercicios según la frecuencia semanal disponible.
6. Prioriza los grupos musculares indicados.
7. Considera el equipo disponible.

Responde SOLO con un JSON válido con esta estructura exacta:
{
  "nombre": "Nombre sugerido para la rutina (máx 60 caracteres, en español)",
  "duracion_minutos": ${data.duracion_minutos},
  "ejercicios": [
    {
      "exerciseId": "id exacto del ejercicio del dataset",
      "sets": 3,
      "reps": 12,
      "restSeconds": 60,
      "order": 1
    }
  ]
}

Incluye de 4 a 8 ejercicios. Usa SOLO los IDs exactos del dataset proporcionado.`;
}

export async function generarRutinaConIA(
  data: RutinaGeneratorForm,
  ejercicios: Exercise[]
): Promise<{ nombre: string; duracion_minutos: number; ejercicios: RutinaEjercicio[] }> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY no configurada");
  }

  const prompt = buildPrompt(data, ejercicios);

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
            "Eres un entrenador personal experto. Siempre respondes exclusivamente con JSON válido, sin texto adicional ni markdown.",
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

    const json = await response.json();
    const content = json.choices[0]?.message?.content || "";

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

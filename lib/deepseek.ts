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

const LUGAR_LABELS: Record<string, string> = {
  gimnasio: "Gimnasio",
  casa: "Casa",
  ambos: "Ambos (gimnasio y casa)",
};

const EDAD_LABELS: Record<string, string> = {
  menor_18: "Menor de 18 años",
  "18_25": "18-25 años",
  "26_35": "26-35 años",
  "36_45": "36-45 años",
  "46_55": "46-55 años",
  mayor_55: "Mayor de 55 años",
};

const PESO_LABELS: Record<string, string> = {
  menos_60: "Menos de 60 kg",
  "60_75": "60-75 kg",
  "76_90": "76-90 kg",
  "91_110": "91-110 kg",
  mas_110: "Más de 110 kg",
};

const ALTURA_LABELS: Record<string, string> = {
  bajo: "Bajo (-160 cm)",
  medio: "Medio (160-175 cm)",
  alto: "Alto (176-190 cm)",
  muy_alto: "Muy alto (+190 cm)",
};

const LESIONES_LABELS: Record<string, string> = {
  ninguna: "Ninguna",
  espalda: "Espalda",
  rodillas: "Rodillas",
  hombros: "Hombros",
  muñecas: "Muñecas",
  tobillos: "Tobillos",
  multiple: "Múltiples lesiones",
};

const MEDICAS_LABELS: Record<string, string> = {
  ninguna: "Ninguna",
  hipertension: "Hipertensión",
  diabetes: "Diabetes",
  corazon: "Problemas cardíacos",
  asthma: "Asma",
  multiple: "Múltiples condiciones",
};

const FRECUENCIA_LABELS: Record<string, string> = {
  "1_2": "1-2 días por semana",
  "3_4": "3-4 días por semana",
  "5_6": "5-6 días por semana",
  "7": "Todos los días",
};

const DURACION_LABELS: Record<string, string> = {
  "15_20": "15-20 minutos",
  "25_30": "25-30 minutos",
  "35_45": "35-45 minutos",
  "45_60": "45-60 minutos",
  "60_90": "60-90 minutos",
};

const DURACION_MIDPOINT: Record<string, number> = {
  "15_20": 17,
  "25_30": 27,
  "35_45": 40,
  "45_60": 52,
  "60_90": 75,
};

const EQUIPO_LABELS: Record<string, string> = {
  peso_corporal: "Peso corporal",
  mancuernas: "Mancuernas",
  barra: "Barra",
  bandas: "Bandas elásticas",
  maquina: "Máquinas",
};

const MUSCULO_LABELS: Record<string, string> = {
  todo: "Cuerpo completo",
  pecho: "Pecho",
  espalda: "Espalda",
  piernas: "Piernas",
  hombros: "Hombros",
  brazos: "Brazos",
  core: "Core",
};

const PRIORIDAD_LABELS: Record<string, string> = {
  ninguna: "Ninguna en particular",
  pecho: "Pecho",
  espalda: "Espalda",
  piernas: "Piernas",
  hombros: "Hombros",
  brazos: "Brazos",
  core: "Core",
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

### Lugar de entrenamiento
- Lugar: ${LUGAR_LABELS[data.lugar]}

### Objetivo
- Objetivo principal: ${OBJETIVO_LABELS[data.objetivo]}

### Nivel y experiencia
- Nivel: ${NIVEL_LABELS[data.nivel]}
- Experiencia entrenando: ${EXPERIENCIA_LABELS[data.experiencia]}
- Conocimiento de técnica: ${CONOCIMIENTO_LABELS[data.conocimiento]}

### Datos personales
- Edad: ${EDAD_LABELS[data.edad]}
- Peso: ${PESO_LABELS[data.peso]}
- Altura: ${ALTURA_LABELS[data.altura]}
- Género: ${data.genero}

### Condición física
- Condición actual: ${CONDICION_LABELS[data.condicion_fisica]}
- Lesiones previas: ${LESIONES_LABELS[data.lesiones]}
- Condiciones médicas: ${MEDICAS_LABELS[data.condiciones_medicas]}

### Preferencias de entrenamiento
- Frecuencia semanal: ${FRECUENCIA_LABELS[data.frecuencia_semanal]}
- Duración por sesión: ${DURACION_LABELS[data.duracion_minutos]}
- Horario preferido: ${data.horario_preferido}
- Equipo disponible: ${data.equipo_disponible.length ? data.equipo_disponible.map((e) => EQUIPO_LABELS[e] || e).join(", ") : "Ninguno (solo peso corporal)"}

### Musculatura
- Grupos musculares a trabajar: ${data.grupos_musculares.map((g) => MUSCULO_LABELS[g] || g).join(", ")}
- Prioridad muscular: ${PRIORIDAD_LABELS[data.prioridad_muscular] || "Ninguna en particular"}

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
  "duracion_minutos": ${DURACION_MIDPOINT[data.duracion_minutos]},
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

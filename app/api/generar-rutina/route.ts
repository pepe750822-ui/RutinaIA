import { NextResponse } from "next/server";
import { generarRutinaConIA } from "@/lib/deepseek";
import { getAllExercises } from "@/lib/exercises";
import { filterExercisesByBodyPart, filterExercisesByEquipment } from "@/lib/exercises";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      objetivo,
      nivel,
      experiencia,
      conocimiento,
      edad,
      peso,
      altura,
      genero,
      condicion_fisica,
      lesiones,
      condiciones_medicas,
      frecuencia_semanal,
      duracion_minutos,
      horario_preferido,
      equipo_disponible,
      grupos_musculares,
      prioridad_muscular,
    } = body;

    if (!objetivo) {
      return NextResponse.json(
        { error: "El objetivo es requerido" },
        { status: 400 }
      );
    }

    const todosEjercicios = await getAllExercises();

    let ejerciciosFiltrados = [...todosEjercicios];

    if (equipo_disponible && equipo_disponible.length > 0) {
      ejerciciosFiltrados = filterExercisesByEquipment(
        ejerciciosFiltrados,
        equipo_disponible
      );
    }

    if (grupos_musculares && grupos_musculares.length > 0) {
      ejerciciosFiltrados = filterExercisesByBodyPart(
        ejerciciosFiltrados,
        grupos_musculares
      );
    }

    if (ejerciciosFiltrados.length < 4) {
      ejerciciosFiltrados = todosEjercicios;
    }

    const result = await generarRutinaConIA(
      {
        objetivo,
        nivel,
        experiencia,
        conocimiento,
        edad,
        peso,
        altura,
        genero,
        condicion_fisica,
        lesiones,
        condiciones_medicas,
        frecuencia_semanal,
        duracion_minutos,
        horario_preferido,
        equipo_disponible,
        grupos_musculares,
        prioridad_muscular,
      },
      ejerciciosFiltrados
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error generando rutina:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al generar la rutina" },
      { status: 500 }
    );
  }
}

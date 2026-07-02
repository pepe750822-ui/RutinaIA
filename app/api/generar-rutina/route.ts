import { NextResponse } from "next/server";
import { generarRutinaConIA } from "@/lib/deepseek";
import { getAllExercises } from "@/lib/exercises";
import { filterExercisesByBodyPart, filterExercisesByEquipment } from "@/lib/exercises";

export async function POST(request: Request) {
  try {
    const { objetivo, nivel, tiempo, equipo, musculos } = await request.json();

    if (!objetivo) {
      return NextResponse.json(
        { error: "El objetivo es requerido" },
        { status: 400 }
      );
    }

    const todosEjercicios = await getAllExercises();

    let ejerciciosFiltrados = [...todosEjercicios];

    if (equipo && equipo.length > 0) {
      ejerciciosFiltrados = filterExercisesByEquipment(ejerciciosFiltrados, equipo);
    }

    if (musculos && musculos.length > 0) {
      ejerciciosFiltrados = filterExercisesByBodyPart(ejerciciosFiltrados, musculos);
    }

    if (ejerciciosFiltrados.length < 4) {
      ejerciciosFiltrados = todosEjercicios;
    }

    const result = await generarRutinaConIA(
      objetivo,
      nivel || "principiante",
      tiempo || 30,
      equipo || [],
      musculos || [],
      ejerciciosFiltrados
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error generando rutina:", error);
    return NextResponse.json(
      { error: error.message || "Error al generar la rutina" },
      { status: 500 }
    );
  }
}

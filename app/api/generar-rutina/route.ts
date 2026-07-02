import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { generarRutinaConIA } from "@/lib/deepseek";
import { getAllExercises } from "@/lib/exercises";
import { filterExercisesByBodyPart, filterExercisesByEquipment } from "@/lib/exercises";
import { checkWeeklyLimit, incrementWeeklyCount } from "@/lib/premium";

async function getSupabaseAuth() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return { supabase: null, user: null };

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getSupabaseAuth();

    if (!user) {
      const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (hasSupabase) {
        return NextResponse.json(
          { error: "Debes iniciar sesión para generar una rutina" },
          { status: 401 }
        );
      }
    }

    if (user) {
      const limit = await checkWeeklyLimit(user.id);
      if (!limit.allowed) {
        return NextResponse.json(
          {
            error: `Has alcanzado el límite de ${limit.max} rutinas gratuitas por semana. Actualiza a premium para generar más.`,
            limit,
          },
          { status: 403 }
        );
      }
    }

    const body = await request.json();

    const {
      lugar,
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
        lugar,
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

    let rutinaId: string | undefined;

    if (supabase && user) {
      const { data: rutina, error } = await supabase
        .from("rutinas")
        .insert({
          user_id: user.id,
          nombre: result.nombre,
          objetivo,
          nivel,
          ejercicios: result.ejercicios,
          dias: result.dias,
          duracion_minutos: result.duracion_minutos,
        })
        .select("id")
        .single();

      if (!error && rutina) {
        rutinaId = rutina.id;
      }

      await incrementWeeklyCount(user.id);
    }

    return NextResponse.json({ ...result, id: rutinaId });
  } catch (error: unknown) {
    console.error("Error generando rutina:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al generar la rutina" },
      { status: 500 }
    );
  }
}

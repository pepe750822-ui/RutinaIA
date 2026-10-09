import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { RutinaDia, RutinaEjercicio } from "@/types";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, objetivo, nivel, ejercicios, dias, duracion_minutos } = body as {
      nombre: string;
      objetivo: string;
      nivel: string;
      ejercicios: RutinaEjercicio[];
      dias?: RutinaDia[];
      duracion_minutos: number;
    };

    const insertData: Record<string, unknown> = {
      user_id: user.id,
      nombre: nombre || "Rutina personalizada",
      objetivo: objetivo || null,
      nivel: nivel || null,
      ejercicios: ejercicios || [],
      duracion_minutos: duracion_minutos || 30,
    };
    if (dias) insertData.dias = dias;

    const { data: rutina, error } = await supabase
      .from("rutinas")
      .insert(insertData)
      .select("id")
      .single();

    if (error && String(error).includes("column")) {
      delete insertData.dias;
      const { data: retry } = await supabase
        .from("rutinas")
        .insert(insertData)
        .select("id")
        .single();
      if (retry) {
        return NextResponse.json({ id: retry.id });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: rutina?.id });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al guardar" },
      { status: 500 }
    );
  }
}

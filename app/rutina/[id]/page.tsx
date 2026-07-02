"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TimerEntrenamiento from "@/components/TimerEntrenamiento";
import EjercicioCard from "@/components/EjercicioCard";
import { Play, ArrowLeft, Loader2, Clock, Flame, Dumbbell } from "lucide-react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";
import type { RutinaEjercicio } from "@/types";

interface RutinaData {
  id: string;
  user_id: string;
  nombre: string;
  objetivo: string;
  nivel: string;
  ejercicios: RutinaEjercicio[];
  duracion_minutos: number;
  created_at: string;
  completada: boolean;
}

const objetivoBadge: Record<string, string> = {
  perder_peso: "FAT LOSS",
  mejorar_condicion: "CARDIO",
  ganar_muscular: "HIPERTROFIA",
  mantener: "MANTENIMIENTO",
};

export default function RutinaDetallePage() {
  const params = useParams();
  const [rutina, setRutina] = useState<RutinaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modoEntrenamiento, setModoEntrenamiento] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase || !params.id) { setLoading(false); return; }

      const { data } = await supabase
        .from("rutinas")
        .select("*")
        .eq("id", params.id)
        .single();

      setRutina(data);
      setLoading(false);
    }
    load();
  }, [params.id]);

  const handleComplete = async () => {
    const supabase = getSupabaseClient();
    if (supabase && rutina) {
      await supabase.from("ejercicios_completados").insert({
        user_id: rutina.user_id,
        rutina_id: rutina.id,
        duracion_min: rutina.duracion_minutos,
      } as never);
      await supabase
        .from("rutinas")
        .update({ completada: true } as never)
        .eq("id", rutina.id);
    }
    setModoEntrenamiento(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00ff88]" />
      </div>
    );
  }

  if (!rutina) {
    return (
      <div className="text-center py-16">
        <p className="text-white/50">Rutina no encontrada</p>
        <Link href="/app">
          <Button variant="outline" className="mt-4">Volver al dashboard</Button>
        </Link>
      </div>
    );
  }

  if (modoEntrenamiento) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-lg mx-auto py-6 sm:py-8 pb-28 sm:pb-8 px-0"
      >
        <button
          onClick={() => setModoEntrenamiento(false)}
          className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Salir del entrenamiento
        </button>
        <TimerEntrenamiento
          ejercicios={rutina.ejercicios ?? []}
          onComplete={handleComplete}
        />
      </motion.div>
    );
  }

  const kcal = Math.round((rutina.duracion_minutos || 30) * 7);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 pb-28"
      >
        {/* Back */}
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al dashboard
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 uppercase tracking-wider">
              AI-GENERATED
            </span>
            {rutina.objetivo && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white/60 uppercase tracking-wider">
                {objetivoBadge[rutina.objetivo] ?? rutina.objetivo}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            {rutina.nombre}
          </h1>

          <div className="flex items-center gap-4 text-sm text-white/50 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#00ff88]" />
              {rutina.duracion_minutos} min
            </span>
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              {kcal} kcal
            </span>
            <span className="flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-white/40" />
              {rutina.ejercicios?.length ?? 0} ejercicios
            </span>
          </div>
        </div>

        {/* Exercise list */}
        {rutina.ejercicios?.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider">
              Ejercicios
            </h2>
            {rutina.ejercicios.map((ej: RutinaEjercicio, i: number) => (
              <EjercicioCard key={ej.exercise?.id ?? i} ejercicio={ej} index={i} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-white/50">Esta rutina no tiene ejercicios aún.</p>
              <Link href="/rutina/nueva">
                <Button variant="outline" className="mt-4">Generar una nueva rutina</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Sticky CTA */}
      {rutina.ejercicios?.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 p-4 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/90 to-transparent pb-6">
          <Button
            onClick={() => setModoEntrenamiento(true)}
            size="lg"
            className="w-full max-w-lg mx-auto flex h-14 rounded-2xl bg-[#00ff88] text-[#0a0f1e] hover:bg-[#00ff88]/90 font-bold text-base gap-2"
          >
            <Play className="w-5 h-5" />
            Iniciar entrenamiento
          </Button>
        </div>
      )}
    </>
  );
}

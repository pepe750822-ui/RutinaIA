"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TimerEntrenamiento from "@/components/TimerEntrenamiento";
import EjercicioCard from "@/components/EjercicioCard";
import { Play, ArrowLeft, Loader2 } from "lucide-react";
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

export default function RutinaDetallePage() {
  const params = useParams();
  const [rutina, setRutina] = useState<RutinaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modoEntrenamiento, setModoEntrenamiento] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase || !params.id) {
        setLoading(false);
        return;
      }

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
      await supabase
        .from("ejercicios_completados")
        .insert({
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
        className="max-w-lg mx-auto py-8"
      >
        <button
          onClick={() => setModoEntrenamiento(false)}
          className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors"
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <Link
          href="/app"
          className="text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {rutina.nombre}
          </h1>
          <p className="text-white/50 mt-1">
            {rutina.objetivo} &middot; {rutina.nivel} &middot;{" "}
            {rutina.duracion_minutos} min
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">¿Listo para entrenar?</p>
            <p className="text-sm text-white/50">
              {(rutina.ejercicios?.length ?? 0)} ejercicios &middot;{" "}
              {rutina.duracion_minutos} minutos estimados
            </p>
          </div>
          <Button
            onClick={() => setModoEntrenamiento(true)}
            size="lg"
            disabled={!rutina.ejercicios?.length}
          >
            <Play className="w-5 h-5 mr-2" />
            Iniciar entrenamiento
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {(rutina.ejercicios ?? []).map((ej: RutinaEjercicio, i: number) => (
          <EjercicioCard key={ej.exercise?.id ?? i} ejercicio={ej} index={i} />
        ))}
      </div>

      {!rutina.ejercicios?.length && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-white/50">
              Esta rutina no tiene ejercicios aún.
            </p>
            <Link href="/rutina/nueva">
              <Button variant="outline" className="mt-4">
                Generar una nueva rutina
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

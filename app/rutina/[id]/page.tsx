"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EjercicioCard from "@/components/EjercicioCard";
import TimerEntrenamiento from "@/components/TimerEntrenamiento";
import { Play, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Rutina, RutinaEjercicio } from "@/types";

// Mock data — se reemplazará con datos reales de Supabase
const MOCK_RUTINA: Rutina = {
  id: "1",
  user_id: "1",
  nombre: "Rutina de fuerza básica",
  objetivo: "Ganar fuerza general",
  nivel: "principiante",
  ejercicios: [],
  created_at: new Date().toISOString(),
  completada: false,
  duracion_minutos: 30,
};

export default function RutinaDetallePage() {
  const params = useParams();
  const [modoEntrenamiento, setModoEntrenamiento] = useState(false);

  const handleComplete = () => {
    // TODO: guardar en Supabase
    setModoEntrenamiento(false);
  };

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
          ejercicios={MOCK_RUTINA.ejercicios}
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
            {MOCK_RUTINA.nombre}
          </h1>
          <p className="text-white/50 mt-1">
            {MOCK_RUTINA.objetivo} &middot; {MOCK_RUTINA.nivel} &middot;{" "}
            {MOCK_RUTINA.duracion_minutos} min
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">¿Listo para entrenar?</p>
            <p className="text-sm text-white/50">
              {MOCK_RUTINA.ejercicios.length} ejercicios &middot;{" "}
              {MOCK_RUTINA.duracion_minutos} minutos estimados
            </p>
          </div>
          <Button
            onClick={() => setModoEntrenamiento(true)}
            size="lg"
            disabled={MOCK_RUTINA.ejercicios.length === 0}
          >
            <Play className="w-5 h-5 mr-2" />
            Iniciar entrenamiento
          </Button>
        </CardContent>
      </Card>

      {MOCK_RUTINA.ejercicios.length === 0 && (
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

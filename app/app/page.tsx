"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Sparkles, Zap, ChevronRight, Play, BarChart3 } from "lucide-react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { getExerciseImageFallbacks, getPlaceholderSvg } from "@/lib/images";

interface RutinaEjDB {
  exercise: { media_id?: string | null; name: string };
}

interface RutinaRow {
  id: string;
  nombre: string;
  duracion_minutos: number;
  ejercicios: RutinaEjDB[];
  created_at: string;
  objetivo: string;
  nivel: string;
}

export default function DashboardPage() {
  const [nombre, setNombre] = useState("Usuario");
  const [stats, setStats] = useState({ sesiones: 0, rutinas: 0, minutos: 0 });
  const [rutinas, setRutinas] = useState<RutinaRow[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("nombre, plan, rutinas_semana")
        .eq("id", user.id)
        .single() as unknown as { data: { nombre?: string; plan: string; rutinas_semana: number } | null };

      if (profile?.nombre) setNombre(profile.nombre);
      else if (user.email) setNombre(user.email.split("@")[0]);

      const { data: rutinasData } = await supabase
        .from("rutinas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: completadas } = await supabase
        .from("ejercicios_completados")
        .select("duracion_min")
        .eq("user_id", user.id) as unknown as { data: { duracion_min: number }[] | null };

      const totalMinutos = completadas?.reduce(
        (acc, c) => acc + (c.duracion_min || 0), 0
      ) ?? 0;

      setStats({
        sesiones: completadas?.length ?? 0,
        rutinas: rutinasData?.length ?? 0,
        minutos: totalMinutos,
      });

      if (rutinasData) setRutinas(rutinasData as RutinaRow[]);
    }
    load();
  }, []);

  const objetivoLabel: Record<string, string> = {
    perder_peso: "FAT LOSS",
    mejorar_condicion: "CARDIO",
    ganar_muscular: "HIPERTROFIA",
    mantener: "MANTENIMIENTO",
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/10 px-2.5 py-1 rounded-full uppercase tracking-widest mb-2">
          <Zap className="w-3 h-3" />
          AI POWERED
        </span>
        <h1 className="text-2xl font-bold text-white">¡Hola, {nombre} 👋</h1>
        <p className="text-sm text-white/50 mt-1">
          Tu entrenador digital ha optimizado los datos. ¡Listo para el siguiente nivel!
        </p>
      </motion.div>

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <Card className="border-[#00ff88]/20 bg-gradient-to-br from-[#00ff88]/10 to-transparent overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#00ff88]/5 rounded-full blur-3xl pointer-events-none" />
          <CardContent className="p-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-3 h-3 text-[#00ff88]" />
              <span className="text-[10px] font-bold text-[#00ff88] uppercase tracking-widest">
                Nueva rutina con IA
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Tu próximo entrenamiento</h2>
            <p className="text-sm text-white/40 mb-4">
              Genera una rutina personalizada adaptada a tu progreso actual.
            </p>
            <Link href="/rutina/nueva">
              <Button className="h-11 gap-2 bg-[#00ff88] text-[#0a0f1e] hover:bg-[#00ff88]/90 font-bold rounded-xl">
                Generar Entrenamiento
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Sesiones", value: stats.sesiones },
          { label: "Rutinas", value: stats.rutinas },
          { label: "Minutos", value: stats.minutos },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.05 }}
          >
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent routines */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white">Mis rutinas recientes</h2>
          <Link href="/app?tab=historial" className="text-xs text-[#00ff88] hover:text-[#00ff88]/80 transition-colors">
            Ver todas
          </Link>
        </div>

        {rutinas.length > 0 ? (
          <div className="space-y-2">
            {rutinas.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 + i * 0.06 }}
              >
                <Link href={`/rutina/${r.id}`}>
                  <Card className="hover:border-white/20 transition-colors cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-20 rounded-xl bg-[#00ff88]/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {(() => {
                            const ej = r.ejercicios?.[0];
                            if (!ej) return <Dumbbell className="w-6 h-6 text-[#00ff88]" />;
                            const fallbacks = getExerciseImageFallbacks(ej.exercise?.name);
                            return (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={fallbacks[0] || getPlaceholderSvg(ej.exercise?.name)} alt="" className="w-full h-full object-cover" />
                            );
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="mb-0.5">
                            <span className="text-[9px] font-bold text-white/30 uppercase bg-white/5 px-1.5 py-0.5 rounded tracking-wider">
                              {objetivoLabel[r.objetivo] ?? r.nivel ?? "RUTINA"}
                            </span>
                          </div>
                          <p className="text-white font-semibold text-sm truncate">{r.nombre}</p>
                          <p className="text-xs text-white/40 mt-0.5">
                            {new Date(r.created_at).toLocaleDateString("es-MX")} · {r.duracion_minutos} min
                          </p>
                        </div>
                        <Play className="w-4 h-4 text-white/20 shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-white/40 text-sm mb-3">Aún no tienes rutinas guardadas.</p>
              <Link href="/rutina/nueva">
                <Button size="sm" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generar tu primera rutina
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Progress analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="border-[#0066ff]/20 bg-gradient-to-br from-[#0066ff]/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-[#0066ff]" />
              <span className="text-xs font-bold text-[#0066ff] uppercase tracking-wider">
                Análisis de Progreso
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              {stats.sesiones > 0
                ? `Has completado ${stats.sesiones} sesión${stats.sesiones !== 1 ? "es" : ""} con un total de ${stats.minutos} minutos entrenados. La IA sugiere priorizar el descanso para optimizar tu recuperación muscular.`
                : "Completa tu primera sesión para que la IA analice tu rendimiento y genere recomendaciones personalizadas."}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Sparkles, Zap, ChevronRight, Play, BarChart3, Trophy, TrendingUp, History } from "lucide-react";
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

const weekStart = () => {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

export default function DashboardPage() {
  const [nombre, setNombre] = useState("Usuario");
  const [stats, setStats] = useState({ sesiones: 0, rutinas: 0, minutos: 0, minSemana: 0, setsSemana: 0, racha: 0 });
  const [prs, setPrs] = useState<{ nombre: string; peso: number }[]>([]);
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

      if (rutinasData) setRutinas(rutinasData as RutinaRow[]);

      // Sessions
      const { data: sesionesRaw } = await supabase
        .from("sesiones")
        .select("id, duracion_min, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const sesiones = (sesionesRaw ?? []) as { id: string; duracion_min: number; created_at: string }[];

      const totalMinutos = sesiones.reduce((a: number, s) => a + (s.duracion_min || 0), 0);

      // Weekly: sets + volume
      const ws = weekStart();
      const { data: setsSemana } = await supabase
        .from("sets_completados")
        .select("peso_kg, created_at")
        .eq("user_id", user.id)
        .gte("created_at", ws) as unknown as { data: { peso_kg: number; created_at: string }[] | null };

      const { data: sesionesSemana } = await supabase
        .from("sesiones")
        .select("duracion_min, created_at")
        .eq("user_id", user.id)
        .gte("created_at", ws) as unknown as { data: { duracion_min: number; created_at: string }[] | null };

      const setsCount = setsSemana?.length ?? 0;
      const minSemana = (sesionesSemana ?? []).reduce((a: number, s: { duracion_min: number }) => a + (s.duracion_min || 0), 0);

      // Streak: consecutive days with sessions
      let racha = 0;
      if (sesiones.length > 0) {
        const fechas = [...new Set(sesiones.map((s) => s.created_at?.split("T")[0]))].sort().reverse() as string[];
        const hoy = new Date();
        for (let i = 0; i < fechas.length; i++) {
          const expected = new Date(hoy);
          expected.setDate(expected.getDate() - i);
          if (fechas[i] === expected.toISOString().split("T")[0]) {
            racha++;
          } else break;
        }
      }

      setStats({
        sesiones: sesiones?.length ?? 0,
        rutinas: rutinasData?.length ?? 0,
        minutos: totalMinutos,
        minSemana,
        setsSemana: setsCount,
        racha,
      });

      // PRs: highest weight per exercise (last 90 days)
      const { data: setsPr } = await supabase
        .from("sets_completados")
        .select("ejercicio_nombre, peso_kg")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 90 * 86400000).toISOString())
        .order("peso_kg", { ascending: false }) as unknown as { data: { ejercicio_nombre: string; peso_kg: number }[] | null };

      if (setsPr) {
        const prMap = new Map<string, number>();
        setsPr.forEach((s) => {
          const prev = prMap.get(s.ejercicio_nombre) ?? 0;
          if (s.peso_kg > prev) prMap.set(s.ejercicio_nombre, s.peso_kg);
        });
        setPrs(
          Array.from(prMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([nombre, peso]) => ({ nombre, peso }))
        );
      }
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
          { label: "Sets/racha", value: `${stats.setsSemana} · ${stats.racha}d`, icon: Zap },
          { label: "Semanal", value: `${stats.minSemana} min`, icon: TrendingUp },
          { label: "Total", value: `${stats.sesiones} sesiones`, icon: History },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.05 }}
          >
            <Card>
              <CardContent className="p-3 text-center space-y-1">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
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

      {/* PRs */}
      {prs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
        >
          <Card className="border-[#ffaa00]/20 bg-gradient-to-br from-[#ffaa00]/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-[#ffaa00]" />
                <span className="text-xs font-bold text-[#ffaa00] uppercase tracking-wider">
                  PRs personales
                </span>
              </div>
              <div className="space-y-2">
                {prs.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-white/80 truncate pr-2">{p.nombre}</span>
                    <span className="text-sm font-bold text-[#ffaa00] shrink-0">{p.peso} kg</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Progress analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
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
                ? `Llevas ${stats.sesiones} sesión${stats.sesiones !== 1 ? "es" : ""} (${stats.minutos} min total). Esta semana: ${stats.setsSemana} sets en ${stats.minSemana} min.${stats.racha > 0 ? ` Racha activa: ${stats.racha} día${stats.racha > 1 ? "s" : ""}.` : ""} La IA ajustará tus cargas en la próxima rutina según estos datos.`
                : "Completa tu primera sesión para que la IA analice tu rendimiento."}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

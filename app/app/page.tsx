"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Zap, Play, ChevronRight, Clock, Trophy } from "lucide-react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

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

const DIAS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

export default function DashboardPage() {
  const [nombre, setNombre] = useState("José Luis");
  const [stats, setStats] = useState({ kcal: 486, minSemana: 38, racha: 12, sesiones: 3 });
  const [rutinas, setRutinas] = useState<RutinaRow[]>([
    { id: 'mock-1', nombre: 'Potencia de Empuje', duracion_minutos: 42, ejercicios: [{ exercise: { name: 'Press de banca' } }], created_at: new Date().toISOString(), objetivo: 'ganar_muscular', nivel: 'intermedio' },
  ]);
  const [prs, setPrs] = useState<{ nombre: string; peso: number }[]>([
    { nombre: 'Press de banca', peso: 80 },
    { nombre: 'Sentadilla', peso: 100 },
    { nombre: 'Peso muerto', peso: 120 },
  ]);

  const now = new Date();
  const diasLabel = DIAS[now.getDay()];
  const hora = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("nombre")
        .eq("id", user.id)
        .single() as unknown as { data: { nombre?: string } | null };

      if (profile?.nombre) setNombre(profile.nombre.split(" ")[0]);
      else if (user.email) setNombre(user.email.split("@")[0]);

      const { data: rutinasData } = await supabase
        .from("rutinas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (rutinasData) setRutinas(rutinasData as RutinaRow[]);

      const { data: sesionesRaw } = await supabase
        .from("sesiones")
        .select("id, duracion_min, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const sesiones = (sesionesRaw ?? []) as { id: string; duracion_min: number; created_at: string }[];

      const ws = weekStart();
      const { data: sesionesSemana } = await supabase
        .from("sesiones")
        .select("duracion_min")
        .eq("user_id", user.id)
        .gte("created_at", ws) as unknown as { data: { duracion_min: number }[] | null };

      const minSemana = (sesionesSemana ?? []).reduce((a, s) => a + (s.duracion_min || 0), 0);
      const kcal = Math.round(minSemana * 8);

      let racha = 0;
      if (sesiones.length > 0) {
        const fechas = [...new Set(sesiones.map((s) => s.created_at?.split("T")[0]))].sort().reverse() as string[];
        const hoy = new Date();
        for (let i = 0; i < fechas.length; i++) {
          const expected = new Date(hoy);
          expected.setDate(expected.getDate() - i);
          if (fechas[i] === expected.toISOString().split("T")[0]) racha++;
          else break;
        }
      }

      setStats({ kcal, minSemana, racha, sesiones: sesiones.length });

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
        setPrs(Array.from(prMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n, p]) => ({ nombre: n, peso: p })));
      }
    }
    load();
  }, []);

  const rutinaHoy = rutinas[0];
  const primerEjercicio = rutinaHoy?.ejercicios?.[0];
  const metaDias = 5;
  const diasSemana = Math.min(stats.sesiones, metaDias);
  const pctSemana = Math.round((diasSemana / metaDias) * 100);

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#39FF14" }}>
          {diasLabel} · {hora}
        </p>
        <h1 className="text-3xl font-black uppercase leading-tight tracking-tight text-white">
          BUENOS DÍAS,<br />
          <span style={{ color: "#39FF14" }}>{nombre.toUpperCase()}</span>
        </h1>
      </motion.div>

      {/* Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4 }}
        className="rounded-2xl p-4"
        style={{ background: "rgba(57,255,20,0.04)", border: "1px solid rgba(57,255,20,0.2)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#39FF14" }}>ESTADO DE HOY</span>
          <Zap className="w-3 h-3" style={{ color: "#CCFF00" }} />
        </div>
        <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
          {[
            { value: stats.kcal, unit: "KCAL", color: "#fff" },
            { value: stats.minSemana, unit: "MIN ACTIVOS", color: "#fff" },
            { value: stats.racha, unit: "DÍAS RACHA", color: "#CCFF00" },
          ].map((m, i) => (
            <div key={i} className="text-center" style={{ paddingLeft: i > 0 ? 8 : 0 }}>
              <p className="text-2xl font-black leading-none" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[9px] uppercase tracking-widest text-white/40 mt-1">{m.unit}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Rutina de hoy */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.4 }}>
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2">SESIÓN PROGRAMADA</p>

        {rutinaHoy ? (
          <Link href={`/rutina/${rutinaHoy.id}`}>
            <div
              className="rounded-2xl p-4 cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: "#0d0d0d", border: "1px solid rgba(57,255,20,0.3)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                  style={{ color: "#39FF14", background: "rgba(57,255,20,0.1)", border: "1px solid rgba(57,255,20,0.25)" }}
                >
                  {rutinaHoy.nivel?.toUpperCase() ?? "RUTINA"}
                </span>
                <span className="ml-auto text-[10px] font-bold text-white/40">{rutinaHoy.duracion_minutos} MIN</span>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white leading-tight mb-3">
                {rutinaHoy.nombre}
              </h2>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 12 }}>
                <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1.5">PRÓXIMO EJERCICIO</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{primerEjercicio?.exercise?.name ?? "Ver rutina"}</p>
                    {rutinaHoy.ejercicios?.length > 0 && (
                      <p className="text-[10px] text-white/30 mt-0.5">{rutinaHoy.ejercicios.length} ejercicios</p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#39FF14" }}>
                    <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <Link href="/rutina/nueva">
            <div
              className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer"
              style={{ background: "rgba(57,255,20,0.03)", border: "1px dashed rgba(57,255,20,0.3)" }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(57,255,20,0.1)" }}>
                <Zap className="w-5 h-5" style={{ color: "#39FF14" }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Generar rutina con IA</p>
                <p className="text-xs text-white/40">Personalizada a tu nivel</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
            </div>
          </Link>
        )}
      </motion.div>

      {/* Carga semanal */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-white">CARGA SEMANAL</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">OBJETIVO {pctSemana}%</span>
        </div>
        <div className="rounded-full overflow-hidden h-2" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pctSemana}%` }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "#39FF14" }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[9px] text-white/30">0 KG</span>
          <span className="text-[10px] font-black" style={{ color: "#39FF14" }}>{diasSemana}/{metaDias} DÍAS</span>
          <span className="text-[9px] text-white/30">{metaDias} DÍAS</span>
        </div>
      </motion.div>

      {/* PRs */}
      {prs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26, duration: 0.4 }}>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-3.5 h-3.5" style={{ color: "#CCFF00" }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#CCFF00" }}>RÉCORDS PERSONALES</span>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(204,255,0,0.15)" }}>
            {prs.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: i < prs.length - 1 ? "1px solid rgba(255,255,255,0.05)" : undefined, background: "rgba(204,255,0,0.02)" }}
              >
                <span className="text-sm text-white/70 truncate pr-2">{p.nombre}</span>
                <span className="text-sm font-black" style={{ color: "#CCFF00" }}>{p.peso} kg</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="grid grid-cols-2 gap-3"
      >
        <Link href="/rutina/nueva">
          <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: "rgba(57,255,20,0.05)", border: "1px solid rgba(57,255,20,0.18)" }}>
            <Dumbbell className="w-5 h-5" style={{ color: "#39FF14" }} />
            <p className="text-sm font-bold text-white">Nueva rutina</p>
            <p className="text-xs text-white/40">Generada con IA</p>
          </div>
        </Link>
        <Link href="/historial">
          <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Clock className="w-5 h-5 text-white/40" />
            <p className="text-sm font-bold text-white">Historial</p>
            <p className="text-xs text-white/40">{stats.sesiones} sesiones</p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

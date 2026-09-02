"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

interface Sesion {
  id: string;
  duracion_min: number;
  created_at: string;
  rutina_id?: string;
  rutina?: { nombre: string; ejercicios: { exercise: { name: string } }[] };
}

const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { offset, daysInMonth };
}

export default function HistorialPage() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [trainedDays, setTrainedDays] = useState<Set<string>>(new Set());
  const [calDate, setCalDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("sesiones")
        .select("id, duracion_min, created_at, rutina_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50) as unknown as { data: Sesion[] | null };

      if (data) {
        setSesiones(data);
        const days = new Set(data.map((s) => s.created_at.split("T")[0]));
        setTrainedDays(days);
      }
    }
    load();
  }, []);

  const { year, month } = calDate;
  const { offset, daysInMonth } = buildCalendar(year, month);
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const prevMonth = () => setCalDate(({ year, month }) =>
    month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
  );
  const nextMonth = () => setCalDate(({ year, month }) =>
    month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
  );

  const sessionCount = sesiones.filter((s) => {
    const d = new Date(s.created_at);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

  const formatRelative = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Ayer";
    return `Hace ${diff} días`;
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#39FF14" }}>REGISTRO & MÉTRICAS</p>
        <h1 className="text-3xl font-black uppercase leading-tight tracking-tight text-white">
          HISTORIAL DE<br />
          <span style={{ color: "#39FF14" }}>SESIONES</span>
        </h1>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4 }}
        className="rounded-2xl p-4"
        style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-base font-black text-white uppercase">{MESES[month]} {year}</span>
            {sessionCount > 0 && (
              <span className="ml-2 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded" style={{ color: "#39FF14", background: "rgba(57,255,20,0.12)", border: "1px solid rgba(57,255,20,0.25)" }}>
                {sessionCount} SESIONES
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-white/30 uppercase">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const trained = trainedDays.has(dateStr);
            const isToday = dateStr === todayStr;
            return (
              <div
                key={day}
                className="aspect-square flex items-center justify-center rounded-lg text-[11px] font-bold transition-all"
                style={{
                  background: trained ? "#39FF14" : isToday ? "rgba(255,255,255,0.08)" : "transparent",
                  color: trained ? "#0a0a0a" : isToday ? "#fff" : "rgba(255,255,255,0.4)",
                  border: isToday && !trained ? "1px solid rgba(204,255,0,0.5)" : undefined,
                }}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#39FF14" }} />
            <span className="text-[9px] uppercase tracking-widest text-white/40">Entrenado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ border: "1px solid rgba(204,255,0,0.5)" }} />
            <span className="text-[9px] uppercase tracking-widest text-white/40">Hoy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="text-[9px] uppercase tracking-widest text-white/40">Descanso</span>
          </div>
        </div>
      </motion.div>

      {/* Sessions list */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.4 }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-white">ÚLTIMAS SESIONES</span>
          {sesiones.length > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#39FF14" }}>
              {sesiones.length} COMPLETADAS
            </span>
          )}
        </div>

        {sesiones.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Dumbbell className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/40">Aún no tienes sesiones completadas.</p>
            <Link href="/rutina/nueva">
              <button className="mt-4 px-4 py-2 rounded-xl text-sm font-bold" style={{ background: "rgba(57,255,20,0.1)", color: "#39FF14", border: "1px solid rgba(57,255,20,0.25)" }}>
                Generar primera rutina
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sesiones.slice(0, 15).map((s, i) => {
              const relDate = formatRelative(s.created_at);
              const time = formatTime(s.created_at);
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.04, duration: 0.35 }}
                  className="rounded-2xl p-4"
                  style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#39FF14" }}>
                        {relDate} · {time}
                      </p>
                      <p className="text-base font-black uppercase text-white truncate">
                        SESIÓN DE ENTRENAMIENTO
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {s.duracion_min ? `${s.duracion_min} min · ` : ""}
                        {new Date(s.created_at).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-black text-white leading-none">{s.duracion_min ?? "—"}</p>
                      <p className="text-[9px] uppercase tracking-widest text-white/30">MIN</p>
                    </div>
                  </div>
                  {s.rutina_id && (
                    <Link href={`/rutina/${s.rutina_id}`}>
                      <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <span className="text-[10px] text-white/30 uppercase tracking-widest">Ver rutina</span>
                        <ChevronRight className="w-3 h-3 text-white/20" />
                      </div>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SkipForward, CheckCircle, ChevronLeft, Pause, Play, Plus } from "lucide-react"
import { RutinaEjercicio } from "@/types"
import { getExerciseImageFallbacks, getPlaceholderSvg } from "@/lib/images"
import { getSupabaseBrowserClient } from "@/lib/supabase"

interface Props {
  ejercicios: RutinaEjercicio[]
  onComplete: (sesionId?: string) => void
}

type Fase = "preparacion" | "ejercicio" | "registro" | "descanso"
type ModoFlujo = "calentamiento" | "rutina" | "cardio_final" | "enfriamiento"

const FASE_LABEL: Record<Fase, string> = {
  preparacion: "Preparación",
  ejercicio: "Ejercicio",
  registro: "Registro",
  descanso: "Descanso",
}

const RPE_BUTTONS = [6, 7, 8, 9, 10]
const PREP_SECONDS = 10

const OPCIONES_CALENTAMIENTO = [
  { label: "Caminadora", minutos: 10 },
  { label: "Bicicleta fija", minutos: 15 },
  { label: "Elíptica", minutos: 15 },
  { label: "Saltar cuerda", minutos: 5 },
]

const OPCIONES_CARDIO = [
  { label: "HIIT Caminadora", minutos: 20 },
  { label: "HIIT Elíptica", minutos: 25 },
  { label: "Cardio moderado", minutos: 30 },
  { label: "Bicicleta fija", minutos: 20 },
]

export default function TimerEntrenamiento({ ejercicios, onComplete }: Props) {
  const [modoFlujo, setModoFlujo] = useState<ModoFlujo>("calentamiento")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fase, setFase] = useState<Fase>("preparacion")
  const [timeLeft, setTimeLeft] = useState(0)
  const [maxTime, setMaxTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [sesionId, setSesionId] = useState<string | null>(null)
  const [setsCount, setSetsCount] = useState(1)
  const [setsLog, setSetsLog] = useState<{ peso: number; reps: number; rpe: number }[]>([])
  const [logPeso, setLogPeso] = useState(0)
  const [logReps, setLogReps] = useState(0)
  const [logRpe, setLogRpe] = useState(6)
  const [opcionCalentamiento, setOpcionCalentamiento] = useState<number | null>(null)
  const [opcionCardio, setOpcionCardio] = useState<number | null>(null)
  const [enfriamientoIniciado, setEnfriamientoIniciado] = useState(false)

  const current = ejercicios[currentIndex]
  const next = ejercicios[currentIndex + 1]
  const total = ejercicios.length

  const goToFase = useCallback((f: Fase, seconds: number) => {
    setFase(f)
    setTimeLeft(seconds)
    setMaxTime(seconds)
    setIsRunning(true)
  }, [])

  useEffect(() => {
    async function init() {
      const supabase = getSupabaseBrowserClient()
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("sesiones")
        .insert({ user_id: user.id, nombre: "Entrenamiento" })
        .select("id")
        .single() as unknown as { data: { id: string } | null }
      if (data?.id) setSesionId(data.id)
    }
    init()
  }, [])

  useEffect(() => {
    if (modoFlujo !== "rutina") return
    if (current) {
      goToFase("preparacion", PREP_SECONDS)
      setVideoSrc(null)
      setSetsLog([])
      setSetsCount(1)
      setLogPeso(0)
      setLogReps(current?.reps || 10)
      setLogRpe(7)
      const name = current?.exercise?.name
      const urls = getExerciseImageFallbacks(name)
      setImgSrc(urls[0] || null)
      fetch(`/api/media?name=${encodeURIComponent(name)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.videoUrl) setVideoSrc(data.videoUrl)
          else if (data.imageUrl && !urls.length) setImgSrc(data.imageUrl)
        })
        .catch(() => {})
    }
  }, [currentIndex, current, goToFase, modoFlujo])

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return
    const id = setInterval(() => setTimeLeft((p) => p - 1), 1000)
    return () => clearInterval(id)
  }, [isRunning, timeLeft])

  // Fin de timer para la rutina
  useEffect(() => {
    if (modoFlujo !== "rutina") return
    if (timeLeft > 0) return
    setIsRunning(false)
    if (fase === "preparacion") {
      goToFase("ejercicio", 60)
    } else if (fase === "ejercicio") {
      goToFase("registro", 9999)
    } else if (fase === "descanso") {
      if (setsCount <= current?.sets && setsLog.length < current?.sets) {
        goToFase("ejercicio", 60)
      } else {
        if (currentIndex < total - 1) {
          setCurrentIndex((i) => i + 1)
        } else {
          setIsRunning(false)
          setTimeLeft(0)
          setModoFlujo("cardio_final")
        }
      }
    }
  }, [timeLeft, fase, currentIndex, total, current, goToFase, setsCount, setsLog.length, modoFlujo])

  // Fin de timer para fases extra (solo para)
  useEffect(() => {
    if (modoFlujo === "rutina") return
    if (timeLeft <= 0 && isRunning) setIsRunning(false)
  }, [timeLeft, isRunning, modoFlujo])

  const guardarSet = async () => {
    if (!sesionId) return
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const numSet = setsLog.length + 1
    await supabase.from("sets_completados").insert({
      user_id: user.id,
      sesion_id: sesionId,
      ejercicio_nombre: current?.exercise?.name,
      exercise: current?.exercise as never,
      peso_kg: logPeso,
      reps: logReps,
      rpe: logRpe,
      numero_set: numSet,
    } as never)

    setSetsLog((prev) => [...prev, { peso: logPeso, reps: logReps, rpe: logRpe }])
    setSetsCount((c) => c + 1)
    setLogPeso(0)
    setLogReps(current?.reps || 10)
    setLogRpe(7)

    if (numSet >= (current?.sets || 3)) {
      goToFase("descanso", current?.restSeconds || 60)
    } else {
      goToFase("ejercicio", 60)
    }
  }

  const skip = () => {
    setTimeLeft(0)
    setIsRunning(false)
  }
  const skipBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }
  const handlePesoQuick = (delta: number) => {
    setLogPeso((p) => Math.max(0, p + delta))
  }

  const startCalentamientoTimer = (idx: number) => {
    setOpcionCalentamiento(idx)
    const secs = OPCIONES_CALENTAMIENTO[idx].minutos * 60
    setTimeLeft(secs)
    setMaxTime(secs)
    setIsRunning(true)
  }

  const startCardioTimer = (idx: number) => {
    setOpcionCardio(idx)
    const secs = OPCIONES_CARDIO[idx].minutos * 60
    setTimeLeft(secs)
    setMaxTime(secs)
    setIsRunning(true)
  }

  const startEnfriamientoTimer = () => {
    setEnfriamientoIniciado(true)
    setTimeLeft(5 * 60)
    setMaxTime(5 * 60)
    setIsRunning(true)
  }

  const RADIUS = 80
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const progress = maxTime > 0 ? timeLeft / maxTime : 0
  const dashOffset = CIRCUMFERENCE * (1 - progress)
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <CheckCircle className="w-20 h-20 text-[#00ff88] mx-auto" />
        </motion.div>
        <div className="text-5xl">🏆</div>
        <h2 className="text-2xl font-bold text-white">¡Entrenamiento completado!</h2>
        <p className="text-white/50">Excelente trabajo. Sigue así.</p>
      </div>
    )
  }

  // ── CALENTAMIENTO ──────────────────────────────────────────────────────
  if (modoFlujo === "calentamiento") {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="calentamiento" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-white">🔥 Calentamiento</h2>
            <p className="text-sm text-white/50">Elige una opción para comenzar</p>
          </div>

          {opcionCalentamiento === null ? (
            <div className="space-y-3">
              {OPCIONES_CALENTAMIENTO.map((op, idx) => (
                <button
                  key={idx}
                  onClick={() => startCalentamientoTimer(idx)}
                  className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ff6b35]/50 rounded-2xl px-5 py-4 transition-all"
                >
                  <span className="text-white font-medium">{op.label}</span>
                  <span className="text-[#ff6b35] font-bold text-sm">{op.minutos} min</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-center text-[#ff6b35] font-semibold">{OPCIONES_CALENTAMIENTO[opcionCalentamiento].label}</p>
              <div className="flex items-center justify-center">
                <div className="relative w-[200px] h-[200px]">
                  <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90 absolute inset-0">
                    <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
                    <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#ff6b35" strokeWidth="10"
                      strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset}
                      className="transition-all duration-1000" style={{ filter: "drop-shadow(0 0 10px #ff6b3580)" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold tabular-nums text-[#ff6b35]">
                      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Calentamiento</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <Button variant="outline" size="icon" onClick={() => setIsRunning((p) => !p)}
                  className="w-16 h-16 rounded-full border-[#ff6b35]/30 bg-[#ff6b35]/10 hover:bg-[#ff6b35]/20">
                  {isRunning ? <Pause className="w-6 h-6 text-[#ff6b35]" /> : <Play className="w-6 h-6 text-[#ff6b35]" />}
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={() => { setIsRunning(false); setModoFlujo("rutina") }}
            className="w-full h-12 rounded-xl bg-[#00ff88] text-[#0a0f1e] font-bold text-base hover:bg-[#00ff88]/90"
          >
            ✓ Calentamiento listo, empezar rutina
          </Button>
        </motion.div>
      </AnimatePresence>
    )
  }

  // ── CARDIO FINAL ───────────────────────────────────────────────────────
  if (modoFlujo === "cardio_final") {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="cardio_final" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-white">🏃 Cardio de Cierre</h2>
            <p className="text-sm text-white/50">Elige una opción de cardio</p>
          </div>

          {opcionCardio === null ? (
            <div className="space-y-3">
              {OPCIONES_CARDIO.map((op, idx) => (
                <button
                  key={idx}
                  onClick={() => startCardioTimer(idx)}
                  className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00ff88]/50 rounded-2xl px-5 py-4 transition-all"
                >
                  <span className="text-white font-medium">{op.label}</span>
                  <span className="text-[#00ff88] font-bold text-sm">{op.minutos} min</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-center text-[#00ff88] font-semibold">{OPCIONES_CARDIO[opcionCardio].label}</p>
              <div className="flex items-center justify-center">
                <div className="relative w-[200px] h-[200px]">
                  <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90 absolute inset-0">
                    <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
                    <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#00ff88" strokeWidth="10"
                      strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset}
                      className="transition-all duration-1000" style={{ filter: "drop-shadow(0 0 10px #00ff8880)" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold tabular-nums text-[#00ff88]">
                      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Cardio Final</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <Button variant="outline" size="icon" onClick={() => setIsRunning((p) => !p)}
                  className="w-16 h-16 rounded-full border-[#00ff88]/30 bg-[#00ff88]/10 hover:bg-[#00ff88]/20">
                  {isRunning ? <Pause className="w-6 h-6 text-[#00ff88]" /> : <Play className="w-6 h-6 text-[#00ff88]" />}
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={() => { setIsRunning(false); setModoFlujo("enfriamiento") }}
            className="w-full h-12 rounded-xl bg-[#00ff88] text-[#0a0f1e] font-bold text-base hover:bg-[#00ff88]/90"
          >
            ✓ Cardio listo, finalizar
          </Button>
        </motion.div>
      </AnimatePresence>
    )
  }

  // ── ENFRIAMIENTO ───────────────────────────────────────────────────────
  if (modoFlujo === "enfriamiento") {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="enfriamiento" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-white">❄️ Enfriamiento</h2>
            <p className="text-sm text-white/50">Estiramientos sugeridos · 5 minutos</p>
          </div>

          {!enfriamientoIniciado ? (
            <div className="bg-white/5 rounded-2xl p-5 space-y-4 text-center">
              <p className="text-white/70 text-sm">
                Realiza estiramientos generales durante 5 minutos para recuperarte adecuadamente.
              </p>
              <Button onClick={startEnfriamientoTimer}
                className="w-full h-11 rounded-xl bg-[#00ccff] text-[#0a0f1e] font-bold hover:bg-[#00ccff]/90">
                Iniciar timer de 5 min
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-center">
                <div className="relative w-[200px] h-[200px]">
                  <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90 absolute inset-0">
                    <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
                    <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#00ccff" strokeWidth="10"
                      strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset}
                      className="transition-all duration-1000" style={{ filter: "drop-shadow(0 0 10px #00ccff80)" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold tabular-nums text-[#00ccff]">
                      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Enfriamiento</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <Button variant="outline" size="icon" onClick={() => setIsRunning((p) => !p)}
                  className="w-16 h-16 rounded-full border-[#00ccff]/30 bg-[#00ccff]/10 hover:bg-[#00ccff]/20">
                  {isRunning ? <Pause className="w-6 h-6 text-[#00ccff]" /> : <Play className="w-6 h-6 text-[#00ccff]" />}
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={() => { setCompleted(true); onComplete(sesionId ?? undefined) }}
            className="w-full h-12 rounded-xl bg-[#00ff88] text-[#0a0f1e] font-bold text-base hover:bg-[#00ff88]/90"
          >
            ✓ Finalizar entrenamiento
          </Button>
        </motion.div>
      </AnimatePresence>
    )
  }

  // ── RUTINA (ejercicios) ────────────────────────────────────────────────
  const isLogPhase = fase === "registro"
  const rutinaTimerColor = fase === "descanso" ? "#0066ff" : "#00ff88"

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${currentIndex}-${fase}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-5"
      >
        {/* Session progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/50 uppercase tracking-wider">Progreso de Sesión</span>
            <span className="text-xs font-bold text-white">{currentIndex + 1} / {total}</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00ff88] transition-all duration-500 rounded-full"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Phase tabs */}
        <div className="flex items-center justify-center gap-8">
          {(["preparacion", "ejercicio", "registro", "descanso"] as Fase[]).map((f) => (
            <div key={f} className="flex flex-col items-center gap-1">
              <span className={`text-xs font-medium transition-colors ${fase === f ? "text-[#00ff88]" : "text-white/30"}`}>
                {FASE_LABEL[f]}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full transition-all ${fase === f ? "bg-[#00ff88]" : "bg-transparent"}`} />
            </div>
          ))}
        </div>

        {/* Exercise image / video */}
        {!isLogPhase && (
          <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-white/5">
            {videoSrc ? (
              <video src={videoSrc} autoPlay muted loop playsInline className="w-full h-full object-cover" />
            ) : imgSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgSrc}
                alt={current?.exercise?.name}
                className="w-full h-full object-cover"
                onError={() => {
                  const name = current?.exercise?.name
                  const urls = getExerciseImageFallbacks(name)
                  const idx = urls.indexOf(imgSrc)
                  if (idx >= 0 && idx + 1 < urls.length) setImgSrc(urls[idx + 1])
                  else {
                    fetch(`/api/media?name=${encodeURIComponent(name)}`)
                      .then((r) => r.json())
                      .then((data) => { if (data.imageUrl) setImgSrc(data.imageUrl); else setImgSrc(null) })
                      .catch(() => setImgSrc(null))
                  }
                }}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={getPlaceholderSvg(current?.exercise?.name || "")} alt="" className="w-full h-full object-cover" />
            )}
            {next && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                <p className="text-xs text-white/70">
                  <span className="text-[#00ff88] font-semibold">Próximo: </span>
                  {next.exercise?.name}
                </p>
              </div>
            )}
          </div>
        )}

        {isLogPhase ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 rounded-2xl p-5 space-y-4">
            <div className="text-center">
              <h3 className="text-white font-bold text-lg">{current?.exercise?.name}</h3>
              <p className="text-sm text-white/50">
                Serie {setsLog.length + 1} de {current?.sets || 3}
              </p>
            </div>

            {setsLog.length > 0 && (
              <div className="bg-black/20 rounded-xl p-3 space-y-1.5 max-h-28 overflow-y-auto">
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Series registradas</p>
                {setsLog.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Serie {i + 1}</span>
                    <span className="text-white font-medium">{s.peso} kg × {s.reps} reps · RPE {s.rpe}</span>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Peso (kg)</label>
              <div className="flex gap-2">
                {[2.5, 5, 10].map((d) => (
                  <Button key={d} type="button" variant="outline" size="sm" onClick={() => handlePesoQuick(d)}
                    className="text-xs h-8 border-white/10 text-white/70 hover:border-white/30">
                    +{d}
                  </Button>
                ))}
                {[2.5, 5, 10].map((d) => (
                  <Button key={`m${d}`} type="button" variant="outline" size="sm" onClick={() => handlePesoQuick(-d)}
                    className="text-xs h-8 border-white/10 text-white/70 hover:border-white/30">
                    -{d}
                  </Button>
                ))}
              </div>
              <input
                type="number"
                value={logPeso}
                onChange={(e) => setLogPeso(Number(e.target.value))}
                className="w-full mt-2 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white text-center text-lg font-bold outline-none focus:border-[#00ff88]/50"
                step="0.5"
                min="0"
              />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Reps completadas</label>
              <input
                type="number"
                value={logReps}
                onChange={(e) => setLogReps(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white text-center text-lg font-bold outline-none focus:border-[#00ff88]/50"
                min="1"
              />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1.5 block">RPE (esfuerzo percibido)</label>
              <div className="flex gap-1.5">
                {RPE_BUTTONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setLogRpe(v)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                      logRpe === v
                        ? "bg-[#00ff88] text-[#0a0f1e]"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={guardarSet}
              className="w-full h-12 rounded-xl bg-[#00ff88] text-[#0a0f1e] font-bold text-base hover:bg-[#00ff88]/90 gap-2"
            >
              <Plus className="w-5 h-5" />
              {setsLog.length + 1 >= (current?.sets || 3) ? "Guardar y descansar" : "Guardar serie"}
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-center">
              <div className="relative w-[200px] h-[200px]">
                <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90 absolute inset-0">
                  <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
                  <circle cx="100" cy="100" r={RADIUS} fill="none" stroke={rutinaTimerColor} strokeWidth="10"
                    strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset}
                    className="transition-all duration-1000"
                    style={{ filter: `drop-shadow(0 0 10px ${rutinaTimerColor}80)` }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold tabular-nums" style={{ color: rutinaTimerColor }}>
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-white/40 uppercase tracking-widest mt-1">
                    {FASE_LABEL[fase]}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-white">{current?.exercise?.name}</h3>
              <p className="text-sm text-white/50">
                {current?.sets} series · {current?.reps} reps · {current?.restSeconds}s descanso
              </p>
              {setsLog.length > 0 && (
                <p className="text-xs text-[#00ff88]">
                  {setsLog.length}/{current?.sets} series registradas
                </p>
              )}
            </div>
          </>
        )}

        <div className="flex items-center justify-center gap-4 pb-2">
          <Button
            variant="outline"
            size="icon"
            onClick={skipBack}
            disabled={currentIndex === 0 || isLogPhase}
            className="w-12 h-12 rounded-full border-white/10 hover:border-white/30"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsRunning((p) => !p)}
            disabled={isLogPhase}
            className="w-16 h-16 rounded-full border-[#00ff88]/30 bg-[#00ff88]/10 hover:bg-[#00ff88]/20"
          >
            {isRunning
              ? <Pause className="w-6 h-6 text-[#00ff88]" />
              : <Play className="w-6 h-6 text-[#00ff88]" />
            }
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={skip}
            disabled={isLogPhase}
            className="w-12 h-12 rounded-full border-white/10 hover:border-white/30"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

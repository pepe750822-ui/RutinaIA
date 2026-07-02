"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SkipForward, CheckCircle, ChevronLeft, Pause, Play } from "lucide-react"
import { RutinaEjercicio } from "@/types"
import { getExerciseImageUrlByName } from "@/lib/images"

interface Props {
  ejercicios: RutinaEjercicio[]
  onComplete: () => void
}

type Fase = "preparacion" | "ejercicio" | "descanso"

const FASE_LABEL: Record<Fase, string> = {
  preparacion: "Preparación",
  ejercicio: "Ejercicio",
  descanso: "Descanso",
}

const PREP_SECONDS = 10

export default function TimerEntrenamiento({ ejercicios, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fase, setFase] = useState<Fase>("preparacion")
  const [timeLeft, setTimeLeft] = useState(PREP_SECONDS)
  const [maxTime, setMaxTime] = useState(PREP_SECONDS)
  const [isRunning, setIsRunning] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [imgError, setImgError] = useState(false)

  const current = ejercicios[currentIndex]
  const next = ejercicios[currentIndex + 1]
  const total = ejercicios.length
  const imgUrl = getExerciseImageUrlByName(current?.exercise?.name)

  const goToFase = useCallback((f: Fase, seconds: number) => {
    setFase(f)
    setTimeLeft(seconds)
    setMaxTime(seconds)
    setIsRunning(true)
  }, [])

  useEffect(() => {
    if (current) goToFase("preparacion", PREP_SECONDS)
    setImgError(false)
  }, [currentIndex, current, goToFase])

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return
    const id = setInterval(() => setTimeLeft((p) => p - 1), 1000)
    return () => clearInterval(id)
  }, [isRunning, timeLeft])

  useEffect(() => {
    if (timeLeft > 0) return
    setIsRunning(false)
    if (fase === "preparacion") {
      goToFase("ejercicio", 60)
    } else if (fase === "ejercicio") {
      goToFase("descanso", current?.restSeconds || 60)
    } else {
      if (currentIndex < total - 1) {
        setCurrentIndex((i) => i + 1)
      } else {
        setCompleted(true)
        onComplete()
      }
    }
  }, [timeLeft, fase, currentIndex, total, current, goToFase, onComplete])

  const skip = () => { setTimeLeft(0); setIsRunning(false) }
  const skipBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  // SVG circular timer
  const RADIUS = 80
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const progress = maxTime > 0 ? timeLeft / maxTime : 0
  const dashOffset = CIRCUMFERENCE * (1 - progress)
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timerColor = fase === "descanso" ? "#0066ff" : "#00ff88"

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <CheckCircle className="w-20 h-20 text-[#00ff88] mx-auto" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">¡Entrenamiento completado!</h2>
        <p className="text-white/50">Excelente trabajo. Sigue así.</p>
      </div>
    )
  }

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
          {(["preparacion", "ejercicio", "descanso"] as Fase[]).map((f) => (
            <div key={f} className="flex flex-col items-center gap-1">
              <span className={`text-xs font-medium transition-colors ${fase === f ? "text-[#00ff88]" : "text-white/30"}`}>
                {FASE_LABEL[f]}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full transition-all ${fase === f ? "bg-[#00ff88]" : "bg-transparent"}`} />
            </div>
          ))}
        </div>

        {/* Exercise image */}
        <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-white/5">
          {imgUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgUrl}
              alt={current?.exercise?.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🏋️</div>
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

        {/* Circular SVG timer */}
        <div className="flex items-center justify-center">
          <div className="relative w-[200px] h-[200px]">
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              className="-rotate-90 absolute inset-0"
            >
              <circle
                cx="100" cy="100" r={RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="10"
              />
              <circle
                cx="100" cy="100" r={RADIUS}
                fill="none"
                stroke={timerColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                className="transition-all duration-1000"
                style={{ filter: `drop-shadow(0 0 10px ${timerColor}80)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold tabular-nums" style={{ color: timerColor }}>
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
              <span className="text-[9px] text-white/40 uppercase tracking-widest mt-1">
                {FASE_LABEL[fase]}
              </span>
            </div>
          </div>
        </div>

        {/* Exercise info */}
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-white">{current?.exercise?.name}</h3>
          <p className="text-sm text-white/50">
            {current?.sets} series · {current?.reps} reps · {current?.restSeconds}s descanso
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 pb-2">
          <Button
            variant="outline"
            size="icon"
            onClick={skipBack}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-full border-white/10 hover:border-white/30"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsRunning((p) => !p)}
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
            className="w-12 h-12 rounded-full border-white/10 hover:border-white/30"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

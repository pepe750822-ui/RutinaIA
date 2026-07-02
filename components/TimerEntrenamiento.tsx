"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, SkipForward, CheckCircle } from "lucide-react"
import { RutinaEjercicio } from "@/types"

interface Props {
  ejercicios: RutinaEjercicio[]
  onComplete: () => void
}

type Fase = "ejercicio" | "descanso"

export default function TimerEntrenamiento({ ejercicios, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fase, setFase] = useState<Fase>("ejercicio")
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [completed, setCompleted] = useState(false)

  const current = ejercicios[currentIndex]
  const total = ejercicios.length

  const startExercise = useCallback(() => {
    setFase("ejercicio")
    setTimeLeft(60)
    setIsRunning(true)
  }, [])

  const startRest = useCallback(() => {
    setFase("descanso")
    setTimeLeft(current?.restSeconds || 60)
    setIsRunning(true)
  }, [current])

  useEffect(() => {
    if (current) startExercise()
  }, [currentIndex, current, startExercise])

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  useEffect(() => {
    if (timeLeft > 0) return
    setIsRunning(false)
    if (fase === "ejercicio") {
      startRest()
    } else {
      if (currentIndex < total - 1) {
        setCurrentIndex((i) => i + 1)
      } else {
        setCompleted(true)
        onComplete()
      }
    }
  }, [timeLeft, fase, currentIndex, total, startRest, onComplete])

  const togglePause = () => setIsRunning((p) => !p)

  const skip = () => {
    setTimeLeft(0)
    setIsRunning(false)
  }

  if (completed) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <CheckCircle className="w-16 h-16 text-[#00ff88] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            ¡Entrenamiento completado!
          </h2>
          <p className="text-white/50">Excelente trabajo. Sigue así.</p>
        </CardContent>
      </Card>
    )
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex + fase}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="space-y-6"
      >
        <Card className="text-center py-8">
          <CardContent className="space-y-6">
            <div className="text-sm text-white/40 uppercase tracking-wider">
              {fase === "ejercicio" ? `Ejercicio ${currentIndex + 1} de ${total}` : "DESCANSO"}
            </div>

            {fase === "ejercicio" ? (
              <>
                <div className="w-32 h-32 mx-auto rounded-xl overflow-hidden bg-white/5">
                  {current?.exercise.gifUrl && (
                    <img
                      src={current.exercise.gifUrl}
                      alt={current.exercise.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {current?.exercise.name}
                </h3>
                <p className="text-white/50">
                  {current?.sets} series x {current?.reps} reps
                </p>
              </>
            ) : (
              <div className="py-8">
                <p className="text-white/40 text-lg mb-2">Descansa</p>
                <p className="text-white/30 text-sm">
                  Prepárate para el siguiente ejercicio
                </p>
              </div>
            )}

            <div className="text-7xl font-bold text-white tabular-nums">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </div>

            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={togglePause}
                className="w-14 h-14 rounded-full"
              >
                {isRunning ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={skip}
                className="w-14 h-14 rounded-full"
              >
                <SkipForward className="w-6 h-6" />
              </Button>
            </div>

            {fase === "ejercicio" && (
              <p className="text-sm text-white/30">
                Target: {current?.exercise.target} &middot;{" "}
                {current?.exercise.equipment}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

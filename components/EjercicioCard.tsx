"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { RutinaEjercicio } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { getExerciseImageUrl } from "@/lib/images"

interface Props {
  ejercicio: RutinaEjercicio
  index: number
}

export default function EjercicioCard({ ejercicio, index }: Props) {
  const { exercise, sets, reps, restSeconds } = ejercicio
  const imgUrl = getExerciseImageUrl(exercise.media_id)
  const [imgError, setImgError] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-[#00ff88]/10 shrink-0 flex items-center justify-center">
              {imgUrl && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgUrl}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-2xl">🏋️</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">
                {exercise.name}
              </h3>
              <p className="text-sm text-white/50 capitalize mt-1">
                {exercise.target || exercise.body_part} &middot; {exercise.equipment}
              </p>
              <div className="flex gap-4 mt-3">
                <div className="text-center">
                  <p className="text-[#00ff88] text-lg font-bold">{sets}</p>
                  <p className="text-xs text-white/40">Series</p>
                </div>
                <div className="text-center">
                  <p className="text-[#0066ff] text-lg font-bold">{reps}</p>
                  <p className="text-xs text-white/40">Reps</p>
                </div>
                <div className="text-center">
                  <p className="text-white text-lg font-bold">{restSeconds}s</p>
                  <p className="text-xs text-white/40">Descanso</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

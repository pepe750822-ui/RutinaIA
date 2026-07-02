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
      transition={{ delay: index * 0.08 }}
    >
      <Card className="overflow-hidden">
        {/* Full-width image */}
        <div className="relative w-full h-48 bg-[#00ff88]/5 overflow-hidden flex items-center justify-center">
          {imgUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgUrl}
              alt={exercise.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-6xl">🏋️</span>
          )}
          <span className="absolute top-2 left-2 text-[9px] font-bold bg-black/60 text-white/60 px-2 py-0.5 rounded uppercase tracking-wider">
            #{index + 1}
          </span>
          <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-black/60 text-white px-2 py-0.5 rounded uppercase tracking-wider">
            DEMO
          </span>
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">{exercise.name}</h3>
            <p className="text-sm text-white/50 capitalize mt-1">
              {exercise.target || exercise.body_part} · {exercise.equipment}
            </p>
          </div>

          {/* Stats chips */}
          <div className="flex gap-2">
            <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[#00ff88] text-xl font-bold">{sets}</p>
              <p className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">Series</p>
            </div>
            <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[#0066ff] text-xl font-bold">{reps}</p>
              <p className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">Reps</p>
            </div>
            <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
              <p className="text-white text-xl font-bold">{restSeconds}s</p>
              <p className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">Descanso</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

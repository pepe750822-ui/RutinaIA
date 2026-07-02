"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { RutinaEjercicio } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { getExerciseImageFallbacks, getPlaceholderSvg } from "@/lib/images"

const TR: Record<string, string> = {
  abs: "Abdominales",
  quads: "Cuádriceps",
  lats: "Dorsales",
  calves: "Gemelos",
  pectorals: "Pectorales",
  glutes: "Glúteos",
  hamstrings: "Isquiotibiales",
  adductors: "Aductores",
  triceps: "Tríceps",
  "cardiovascular system": "Cardiovascular",
  spine: "Columna",
  "upper back": "Espalda alta",
  biceps: "Bíceps",
  delts: "Hombros",
  forearms: "Antebrazos",
  traps: "Trapecios",
  "serratus anterior": "Serrato",
  abductors: "Abductores",
  "levator scapulae": "Elevador escápula",
  waist: "Cintura",
  "upper legs": "Piernas",
  back: "Espalda",
  "lower legs": "Pantorrillas",
  chest: "Pecho",
  "upper arms": "Brazos",
  cardio: "Cardio",
  shoulders: "Hombros",
  "lower arms": "Antebrazos",
  neck: "Cuello",
  "body weight": "Peso corporal",
  cable: "Cable",
  "leverage machine": "Máquina",
  assisted: "Asistido",
  "medicine ball": "Balón medicinal",
  "stability ball": "Pelota estabilidad",
  band: "Banda",
  barbell: "Barra",
  rope: "Cuerda",
  dumbbell: "Mancuerna",
  "ez barbell": "Barra Z",
  "sled machine": "Máquina sled",
  "upper body ergometer": "Ergómetro",
  kettlebell: "Kettlebell",
  "olympic barbell": "Barra olímpica",
  weighted: "Lastrado",
  "bosu ball": "Bosu",
  "resistance band": "Banda resistencia",
  roller: "Rodillo",
  "skierg machine": "Máquina remo",
  hammer: "Martillo",
  "smith machine": "Máquina Smith",
  "wheel roller": "Rueda abdominal",
  "stationary bike": "Bicicleta estática",
  tire: "Llanta",
  "trap bar": "Barra trampa",
  "elliptical machine": "Elíptica",
  "stepmill machine": "Escaladora",
};

function t(val: string): string {
  return TR[val.toLowerCase().trim()] || val;
}

interface Props {
  ejercicio: RutinaEjercicio
  index: number
}

function ExerciseImage({ name }: { name: string }) {
  const urls = getExerciseImageFallbacks(name)
  const [imgSrc, setImgSrc] = useState<string | null>(urls[0] || null)
  const [fallbackIdx, setFallbackIdx] = useState(0)
  const [hasVideo, setHasVideo] = useState(false)
  const svgPlaceholder = getPlaceholderSvg(name)

  const handleError = () => {
    const next = fallbackIdx + 1
    if (next < urls.length) {
      setFallbackIdx(next)
      setImgSrc(urls[next])
    } else {
      setImgSrc(null)
    }
  }

  useEffect(() => {
    if (fallbackIdx >= urls.length) {
      fetch(`/api/media?name=${encodeURIComponent(name)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.imageUrl) {
            setImgSrc(data.imageUrl)
            setHasVideo(!!data.videoUrl)
          } else {
            setImgSrc(null)
          }
        })
        .catch(() => setImgSrc(null))
    }
  }, [fallbackIdx, urls.length, name])

  // eslint-disable-next-line @next/next/no-img-element
  return imgSrc ? (
    <img src={imgSrc} alt={name} className="w-full h-full object-cover" onError={handleError} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={svgPlaceholder} alt={name} className="w-full h-full object-cover" />
  )
}

export default function EjercicioCard({ ejercicio, index }: Props) {
  const { exercise, sets, reps, restSeconds } = ejercicio

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card className="overflow-hidden">
        <div className="relative w-full h-32 bg-[#00ff88]/5 overflow-hidden flex items-center justify-center">
          <ExerciseImage name={exercise.name} />
          <span className="absolute top-2 left-2 text-[9px] font-bold bg-black/60 text-white/60 px-2 py-0.5 rounded uppercase tracking-wider">
            #{index + 1}
          </span>
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">{exercise.name}</h3>
            <p className="text-sm text-white/50 capitalize mt-1">
              {t(exercise.target || exercise.body_part)} · {t(exercise.equipment)}
            </p>
          </div>

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

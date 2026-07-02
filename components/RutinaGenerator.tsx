"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Dumbbell, Check, ChevronLeft, ChevronRight } from "lucide-react"
import EjercicioCard from "./EjercicioCard"
import { RutinaEjercicio, RutinaGeneratorForm } from "@/types"

interface Props {
  onGenerate: (data: RutinaGeneratorForm) => Promise<{
    nombre: string
    duracion_minutos: number
    ejercicios: RutinaEjercicio[]
  } | null>
}

const defaultForm: RutinaGeneratorForm = {
  objetivo: "ganar_muscular",
  nivel: "principiante",
  experiencia: "ninguna",
  conocimiento: "poco",
  edad: 25,
  peso: 70,
  altura: 170,
  genero: "masculino",
  condicion_fisica: "regular",
  lesiones: "",
  condiciones_medicas: "",
  frecuencia_semanal: 3,
  duracion_minutos: 30,
  horario_preferido: "mañana",
  equipo_disponible: [],
  grupos_musculares: [],
  prioridad_muscular: "",
}

const EQUIPO_OPTIONS = [
  { value: "body weight", label: "Peso corporal" },
  { value: "dumbbell", label: "Mancuernas" },
  { value: "barbell", label: "Barra" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "machine", label: "Máquinas" },
  { value: "cable", label: "Cables" },
  { value: "band", label: "Bandas elásticas" },
  { value: "medicine ball", label: "Balón medicinal" },
  { value: "rope", label: "Cuerda" },
]

const MUSCULOS_OPTIONS = [
  { value: "chest", label: "Pecho" },
  { value: "back", label: "Espalda" },
  { value: "shoulders", label: "Hombros" },
  { value: "upper arms", label: "Bíceps/Tríceps" },
  { value: "lower arms", label: "Antebrazos" },
  { value: "upper legs", label: "Cuádriceps/Isquios" },
  { value: "lower legs", label: "Gemelos" },
  { value: "waist", label: "Core/Abdominales" },
  { value: "cardio", label: "Cardio" },
  { value: "full body", label: "Cuerpo completo" },
]

const sections = [
  { step: 0, title: "Objetivos", subtitle: "¿Qué quieres lograr?" },
  { step: 1, title: "Nivel y experiencia", subtitle: "Cuéntanos tu experiencia" },
  { step: 2, title: "Datos personales", subtitle: "Información básica" },
  { step: 3, title: "Condición física", subtitle: "Salud y lesiones" },
  { step: 4, title: "Preferencias", subtitle: "Disponibilidad y equipo" },
  { step: 5, title: "Musculatura", subtitle: "Grupos a trabajar" },
]

function OptionGroup({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (value: string[]) => void
}) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = selected.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
              isActive
                ? "bg-[#00ff88]/10 border-[#00ff88] text-[#00ff88]"
                : "border-white/10 text-white/60 hover:border-white/20 hover:text-white/80"
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm border transition-all ${
              isActive
                ? "bg-[#00ff88]/10 border-[#00ff88] text-[#00ff88]"
                : "border-white/10 text-white/60 hover:border-white/20 hover:text-white/80"
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default function RutinaGenerator({ onGenerate }: Props) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<RutinaGeneratorForm>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [rutina, setRutina] = useState<{
    nombre: string
    duracion_minutos: number
    ejercicios: RutinaEjercicio[]
  } | null>(null)
  const [error, setError] = useState("")

  const update = <K extends keyof RutinaGeneratorForm>(
    key: K,
    value: RutinaGeneratorForm[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    setRutina(null)
    try {
      const result = await onGenerate(form)
      if (result) setRutina(result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al generar rutina")
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 0: return !!form.objetivo
      case 1: return !!form.nivel && !!form.experiencia && !!form.conocimiento
      case 2: return form.edad > 0 && form.peso > 0 && form.altura > 0 && !!form.genero
      case 3: return !!form.condicion_fisica
      case 4: return form.frecuencia_semanal > 0 && form.duracion_minutos > 0 && !!form.horario_preferido
      case 5: return form.grupos_musculares.length > 0
      default: return false
    }
  }

  const nextStep = () => {
    if (step < 5) setStep((s) => s + 1)
    else handleSubmit()
  }

  const prevStep = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <RadioGroup
              options={[
                { value: "perder_peso", label: "🔥 Perder peso" },
                { value: "mejorar_condicion", label: "💪 Mejorar condición" },
                { value: "ganar_muscular", label: "🏋️ Ganar masa muscular" },
                { value: "mantener", label: "🧘 Mantenerme en forma" },
              ]}
              value={form.objetivo}
              onChange={(v) => update("objetivo", v as RutinaGeneratorForm["objetivo"])}
            />
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Nivel actual</Label>
              <RadioGroup
                options={[
                  { value: "principiante", label: "Principiante" },
                  { value: "intermedio", label: "Intermedio" },
                  { value: "avanzado", label: "Avanzado" },
                ]}
                value={form.nivel}
                onChange={(v) => update("nivel", v as RutinaGeneratorForm["nivel"])}
              />
            </div>
            <div className="space-y-2">
              <Label>Experiencia entrenando</Label>
              <RadioGroup
                options={[
                  { value: "ninguna", label: "Ninguna" },
                  { value: "basica", label: "Básica (1-6 meses)" },
                  { value: "intermedia", label: "Intermedia (6-24 meses)" },
                  { value: "avanzada", label: "Avanzada (+2 años)" },
                ]}
                value={form.experiencia}
                onChange={(v) => update("experiencia", v as RutinaGeneratorForm["experiencia"])}
              />
            </div>
            <div className="space-y-2">
              <Label>Conocimiento de técnica</Label>
              <RadioGroup
                options={[
                  { value: "poco", label: "Poco" },
                  { value: "bueno", label: "Bueno" },
                  { value: "muy_bueno", label: "Muy bueno" },
                ]}
                value={form.conocimiento}
                onChange={(v) => update("conocimiento", v as RutinaGeneratorForm["conocimiento"])}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Edad</Label>
                <input
                  type="number"
                  value={form.edad || ""}
                  onChange={(e) => update("edad", Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff88]"
                  min={1}
                  max={120}
                />
              </div>
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <input
                  type="number"
                  value={form.peso || ""}
                  onChange={(e) => update("peso", Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff88]"
                  min={1}
                  max={500}
                />
              </div>
              <div className="space-y-2">
                <Label>Altura (cm)</Label>
                <input
                  type="number"
                  value={form.altura || ""}
                  onChange={(e) => update("altura", Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00ff88]"
                  min={1}
                  max={300}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Género</Label>
              <RadioGroup
                options={[
                  { value: "masculino", label: "Masculino" },
                  { value: "femenino", label: "Femenino" },
                  { value: "otro", label: "Otro" },
                ]}
                value={form.genero}
                onChange={(v) => update("genero", v as RutinaGeneratorForm["genero"])}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Condición física actual</Label>
              <RadioGroup
                options={[
                  { value: "mala", label: "Mala" },
                  { value: "regular", label: "Regular" },
                  { value: "buena", label: "Buena" },
                  { value: "excelente", label: "Excelente" },
                ]}
                value={form.condicion_fisica}
                onChange={(v) => update("condicion_fisica", v as RutinaGeneratorForm["condicion_fisica"])}
              />
            </div>
            <div className="space-y-2">
              <Label>Lesiones previas (opcional)</Label>
              <textarea
                value={form.lesiones}
                onChange={(e) => update("lesiones", e.target.value)}
                placeholder="Ej: Lesión en hombro derecho, esguince de tobillo..."
                className="w-full h-20 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#00ff88] resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Condiciones médicas (opcional)</Label>
              <textarea
                value={form.condiciones_medicas}
                onChange={(e) => update("condiciones_medicas", e.target.value)}
                placeholder="Ej: Hipertensión, diabetes, asma..."
                className="w-full h-20 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#00ff88] resize-none"
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frecuencia semanal</Label>
                <Select
                  value={String(form.frecuencia_semanal)}
                  onValueChange={(v) => update("frecuencia_semanal", parseInt(v) as RutinaGeneratorForm["frecuencia_semanal"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? "día" : "días"} / semana
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duración por sesión</Label>
                <Select
                  value={String(form.duracion_minutos)}
                  onValueChange={(v) => update("duracion_minutos", parseInt(v) as RutinaGeneratorForm["duracion_minutos"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[15, 30, 45, 60, 90].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} minutos
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Horario preferido</Label>
              <RadioGroup
                options={[
                  { value: "mañana", label: "🌅 Mañana" },
                  { value: "tarde", label: "☀️ Tarde" },
                  { value: "noche", label: "🌙 Noche" },
                ]}
                value={form.horario_preferido}
                onChange={(v) => update("horario_preferido", v as RutinaGeneratorForm["horario_preferido"])}
              />
            </div>
            <div className="space-y-2">
              <Label>Equipo disponible</Label>
              <OptionGroup
                options={EQUIPO_OPTIONS}
                selected={form.equipo_disponible}
                onChange={(v) => update("equipo_disponible", v)}
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Grupos musculares a trabajar</Label>
              <OptionGroup
                options={MUSCULOS_OPTIONS}
                selected={form.grupos_musculares}
                onChange={(v) => update("grupos_musculares", v)}
              />
            </div>
            <div className="space-y-2">
              <Label>Prioridad muscular (opcional)</Label>
              <textarea
                value={form.prioridad_muscular}
                onChange={(e) => update("prioridad_muscular", e.target.value)}
                placeholder="Ej: Quiero enfocarme más en pecho y hombros..."
                className="w-full h-20 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#00ff88] resize-none"
              />
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8">
            {sections.map((s, i) => (
              <div key={s.step} className="flex items-center">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step
                      ? "bg-[#00ff88] text-[#0a0f1e] cursor-pointer"
                      : i === step
                      ? "bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]"
                      : "bg-white/5 text-white/30"
                  }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : s.step + 1}
                </button>
                {i < sections.length - 1 && (
                  <div
                    className={`h-0.5 w-full min-w-[12px] mx-1 ${
                      i < step ? "bg-[#00ff88]" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00ff88] to-[#0066ff] transition-all duration-500 rounded-full"
              style={{ width: `${((step + 1) / sections.length) * 100}%` }}
            />
          </div>

          {/* Section title */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">
              {sections[step].title}
            </h2>
            <p className="text-sm text-white/50 mt-1">
              {sections[step].subtitle}
            </p>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="text-sm text-red-400 mt-4">{error}</p>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>

            <Button
              onClick={nextStep}
              disabled={loading || !canProceed()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : step === sections.length - 1 ? (
                <>
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Generar rutina con IA
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {rutina && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{rutina.nombre}</h2>
              <p className="text-white/50 text-sm">
                Duración: {rutina.duracion_minutos} min &middot;{" "}
                {rutina.ejercicios.length} ejercicios
              </p>
            </div>
            <Button variant="outline">Guardar rutina</Button>
          </div>

          <div className="space-y-3">
            {rutina.ejercicios.map((ej, i) => (
              <EjercicioCard key={ej.exercise.id} ejercicio={ej} index={i} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

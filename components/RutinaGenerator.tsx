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
  lugar: "gimnasio",
  objetivo: "ganar_muscular",
  nivel: "principiante",
  experiencia: "ninguna",
  conocimiento: "poco",
  edad: "18_25",
  peso: "60_75",
  altura: "medio",
  genero: "masculino",
  condicion_fisica: "regular",
  lesiones: "ninguna",
  condiciones_medicas: "ninguna",
  frecuencia_semanal: "3_4",
  duracion_minutos: "25_30",
  horario_preferido: "mañana",
  equipo_disponible: [],
  grupos_musculares: [],
  prioridad_muscular: "ninguna",
}

const sections = [
  { step: 0, title: "Lugar de entrenamiento", subtitle: "¿Dónde vas a entrenar?" },
  { step: 1, title: "Objetivos", subtitle: "¿Qué quieres lograr?" },
  { step: 2, title: "Nivel y experiencia", subtitle: "Cuéntanos tu experiencia" },
  { step: 3, title: "Datos personales", subtitle: "Información básica" },
  { step: 4, title: "Condición física", subtitle: "Salud y lesiones" },
  { step: 5, title: "Preferencias", subtitle: "Disponibilidad y equipo" },
  { step: 6, title: "Musculatura", subtitle: "Grupos a trabajar" },
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
      case 0: return !!form.lugar
      case 1: return !!form.objetivo
      case 2: return !!form.nivel && !!form.experiencia && !!form.conocimiento
      case 3: return !!form.edad && !!form.peso && !!form.altura && !!form.genero
      case 4: return !!form.condicion_fisica && !!form.lesiones && !!form.condiciones_medicas
      case 5: return !!form.frecuencia_semanal && !!form.duracion_minutos && !!form.horario_preferido
      case 6: return form.grupos_musculares.length > 0 && !!form.prioridad_muscular
      default: return false
    }
  }

  const nextStep = () => {
    if (step < 6) setStep((s) => s + 1)
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
                { value: "gimnasio", label: "🏋️ Gimnasio" },
                { value: "casa", label: "🏠 Casa" },
                { value: "ambos", label: "🔄 Ambos" },
              ]}
              value={form.lugar}
              onChange={(v) => update("lugar", v as RutinaGeneratorForm["lugar"])}
            />
          </div>
        )

      case 1:
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

      case 2:
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

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Edad</Label>
              <RadioGroup
                options={[
                  { value: "menor_18", label: "Menor de 18" },
                  { value: "18_25", label: "18 - 25 años" },
                  { value: "26_35", label: "26 - 35 años" },
                  { value: "36_45", label: "36 - 45 años" },
                  { value: "46_55", label: "46 - 55 años" },
                  { value: "mayor_55", label: "Mayor de 55" },
                ]}
                value={form.edad}
                onChange={(v) => update("edad", v as RutinaGeneratorForm["edad"])}
              />
            </div>
            <div className="space-y-2">
              <Label>Peso</Label>
              <RadioGroup
                options={[
                  { value: "menos_60", label: "Menos de 60 kg" },
                  { value: "60_75", label: "60 - 75 kg" },
                  { value: "76_90", label: "76 - 90 kg" },
                  { value: "91_110", label: "91 - 110 kg" },
                  { value: "mas_110", label: "Más de 110 kg" },
                ]}
                value={form.peso}
                onChange={(v) => update("peso", v as RutinaGeneratorForm["peso"])}
              />
            </div>
            <div className="space-y-2">
              <Label>Altura</Label>
              <RadioGroup
                options={[
                  { value: "bajo", label: "Bajo (-160 cm)" },
                  { value: "medio", label: "Medio (160-175 cm)" },
                  { value: "alto", label: "Alto (176-190 cm)" },
                  { value: "muy_alto", label: "Muy alto (+190 cm)" },
                ]}
                value={form.altura}
                onChange={(v) => update("altura", v as RutinaGeneratorForm["altura"])}
              />
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

      case 4:
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
              <Label>Lesiones previas</Label>
              <RadioGroup
                options={[
                  { value: "ninguna", label: "Ninguna" },
                  { value: "espalda", label: "Espalda" },
                  { value: "rodillas", label: "Rodillas" },
                  { value: "hombros", label: "Hombros" },
                  { value: "muñecas", label: "Muñecas" },
                  { value: "tobillos", label: "Tobillos" },
                  { value: "multiple", label: "Múltiples" },
                ]}
                value={form.lesiones}
                onChange={(v) => update("lesiones", v as RutinaGeneratorForm["lesiones"])}
              />
            </div>
            <div className="space-y-2">
              <Label>Condiciones médicas</Label>
              <RadioGroup
                options={[
                  { value: "ninguna", label: "Ninguna" },
                  { value: "hipertension", label: "Hipertensión" },
                  { value: "diabetes", label: "Diabetes" },
                  { value: "corazon", label: "Problemas cardíacos" },
                  { value: "asthma", label: "Asma" },
                  { value: "multiple", label: "Múltiples" },
                ]}
                value={form.condiciones_medicas}
                onChange={(v) => update("condiciones_medicas", v as RutinaGeneratorForm["condiciones_medicas"])}
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frecuencia semanal</Label>
                <Select
                  value={form.frecuencia_semanal}
                  onValueChange={(v) => update("frecuencia_semanal", v as RutinaGeneratorForm["frecuencia_semanal"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1_2">1 - 2 días / semana</SelectItem>
                    <SelectItem value="3_4">3 - 4 días / semana</SelectItem>
                    <SelectItem value="5_6">5 - 6 días / semana</SelectItem>
                    <SelectItem value="7">Todos los días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duración por sesión</Label>
                <Select
                  value={form.duracion_minutos}
                  onValueChange={(v) => update("duracion_minutos", v as RutinaGeneratorForm["duracion_minutos"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15_20">15 - 20 minutos</SelectItem>
                    <SelectItem value="25_30">25 - 30 minutos</SelectItem>
                    <SelectItem value="35_45">35 - 45 minutos</SelectItem>
                    <SelectItem value="45_60">45 - 60 minutos</SelectItem>
                    <SelectItem value="60_90">60 - 90 minutos</SelectItem>
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
                options={[
                  { value: "peso_corporal", label: "Peso corporal" },
                  { value: "mancuernas", label: "Mancuernas" },
                  { value: "barra", label: "Barra" },
                  { value: "bandas", label: "Bandas elásticas" },
                  { value: "maquina", label: "Máquinas" },
                ]}
                selected={form.equipo_disponible}
                onChange={(v) => update("equipo_disponible", v as RutinaGeneratorForm["equipo_disponible"])}
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Grupos musculares a trabajar</Label>
              <OptionGroup
                options={[
                  { value: "todo", label: "Cuerpo completo" },
                  { value: "pecho", label: "Pecho" },
                  { value: "espalda", label: "Espalda" },
                  { value: "piernas", label: "Piernas" },
                  { value: "hombros", label: "Hombros" },
                  { value: "brazos", label: "Brazos" },
                  { value: "core", label: "Core" },
                ]}
                selected={form.grupos_musculares}
                onChange={(v) => update("grupos_musculares", v as RutinaGeneratorForm["grupos_musculares"])}
              />
            </div>
            <div className="space-y-2">
              <Label>Prioridad muscular</Label>
              <RadioGroup
                options={[
                  { value: "ninguna", label: "Sin prioridad" },
                  { value: "pecho", label: "Pecho" },
                  { value: "espalda", label: "Espalda" },
                  { value: "piernas", label: "Piernas" },
                  { value: "hombros", label: "Hombros" },
                  { value: "brazos", label: "Brazos" },
                  { value: "core", label: "Core" },
                ]}
                value={form.prioridad_muscular}
                onChange={(v) => update("prioridad_muscular", v as RutinaGeneratorForm["prioridad_muscular"])}
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

          <div className="w-full h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00ff88] to-[#0066ff] transition-all duration-500 rounded-full"
              style={{ width: `${((step + 1) / sections.length) * 100}%` }}
            />
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">
              {sections[step].title}
            </h2>
            <p className="text-sm text-white/50 mt-1">
              {sections[step].subtitle}
            </p>
          </div>

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

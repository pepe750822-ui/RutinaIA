"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Dumbbell, Home, Shuffle, ChevronLeft, ChevronRight } from "lucide-react"
import EjercicioCard from "./EjercicioCard"
import { RutinaDia, RutinaEjercicio, RutinaGeneratorForm } from "@/types"

interface RutinaResult {
  id?: string
  nombre: string
  duracion_minutos: number
  ejercicios: RutinaEjercicio[]
  dias?: RutinaDia[]
}

interface Props {
  onGenerate: (data: RutinaGeneratorForm) => Promise<RutinaResult | null>
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
  { step: 0, title: "¿Dónde vas a entrenar?", subtitle: "Configuración Inicial", desc: "Selecciona tu entorno de entrenamiento principal para que la IA adapte los ejercicios a tu equipamiento disponible." },
  { step: 1, title: "¿Qué quieres lograr?", subtitle: "Objetivos", desc: "Define tu meta principal para que la IA diseñe el programa ideal." },
  { step: 2, title: "Nivel y experiencia", subtitle: "Tu historial", desc: "Cuéntanos tu experiencia para adaptar la intensidad." },
  { step: 3, title: "Datos personales", subtitle: "Información básica", desc: "Datos que la IA necesita para personalizar tu rutina." },
  { step: 4, title: "Condición física", subtitle: "Salud y lesiones", desc: "Importante para evitar lesiones y respetar tus límites." },
  { step: 5, title: "Preferencias", subtitle: "Disponibilidad y equipo", desc: "Cuándo y cuánto tiempo puedes entrenar." },
  { step: 6, title: "Musculatura", subtitle: "Grupos a trabajar", desc: "¿Qué partes del cuerpo quieres priorizar?" },
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
            className={`px-3 py-2 rounded-xl text-sm border transition-all min-h-[40px] ${
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
            className={`px-4 py-2 rounded-xl text-sm border transition-all min-h-[40px] ${
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
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<RutinaGeneratorForm>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [rutina, setRutina] = useState<RutinaResult | null>(null)
  const [selectedDay, setSelectedDay] = useState(0)
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

  const nextStep = () => { if (step < 6) setStep((s) => s + 1); else handleSubmit() }
  const prevStep = () => { if (step > 0) setStep((s) => s - 1) }

  const renderStep = () => {
    switch (step) {
      case 0: {
        const lugarOpts = [
          { value: "gimnasio", icon: <Dumbbell className="w-7 h-7 text-[#00ff88]" />, label: "Gimnasio", desc: "Acceso a máquinas y pesas" },
          { value: "casa", icon: <Home className="w-7 h-7 text-[#00ff88]" />, label: "Casa", desc: "Sin equipo o limitado" },
          { value: "ambos", icon: <Shuffle className="w-7 h-7 text-[#00ff88]" />, label: "Ambos", desc: "Combinación flexible" },
        ]
        return (
          <div className="space-y-3">
            {lugarOpts.map((opt) => {
              const isActive = form.lugar === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("lugar", opt.value as RutinaGeneratorForm["lugar"])}
                  className={`w-full p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center ${
                    isActive ? "border-[#00ff88] bg-[#00ff88]/10" : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isActive ? "bg-[#00ff88]/20" : "bg-white/5"}`}>
                    {opt.icon}
                  </div>
                  <div>
                    <p className={`font-bold text-lg transition-colors ${isActive ? "text-[#00ff88]" : "text-white"}`}>{opt.label}</p>
                    <p className="text-white/50 text-sm mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )
      }

      case 1: {
        const objetivoOpts = [
          { value: "perder_peso", emoji: "🔥", label: "Perder peso" },
          { value: "mejorar_condicion", emoji: "💪", label: "Mejorar condición" },
          { value: "ganar_muscular", emoji: "🏋️", label: "Ganar masa muscular" },
          { value: "mantener", emoji: "🧘", label: "Mantenerme" },
        ]
        return (
          <div className="grid grid-cols-2 gap-3">
            {objetivoOpts.map((opt) => {
              const isActive = form.objetivo === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("objetivo", opt.value as RutinaGeneratorForm["objetivo"])}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center min-h-[110px] justify-center ${
                    isActive ? "border-[#00ff88] bg-[#00ff88]/10" : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <p className={`text-sm font-semibold transition-colors ${isActive ? "text-[#00ff88]" : "text-white"}`}>{opt.label}</p>
                </button>
              )
            })}
          </div>
        )
      }

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          {/* Step header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-[#00ff88] uppercase tracking-wider">
                Paso {step + 1} de {sections.length}
              </span>
              <span className="text-xs text-white/40">{sections[step].subtitle}</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00ff88] transition-all duration-500 rounded-full"
                style={{ width: `${((step + 1) / sections.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">{sections[step].title}</h2>
            <p className="text-sm text-white/50 mt-2 max-w-xs mx-auto">{sections[step].desc}</p>
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
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5 mt-4">
              {error}
            </p>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/5">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 0}
              className="flex-1 h-12 rounded-full gap-2 text-white/60"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <Button
              onClick={nextStep}
              disabled={loading || !canProceed()}
              className="flex-1 h-12 rounded-full bg-[#00ff88] text-[#0a0f1e] hover:bg-[#00ff88]/90 font-bold gap-2 disabled:opacity-40"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Generando...</>
              ) : step === sections.length - 1 ? (
                <><Dumbbell className="w-4 h-4" />Generar rutina</>
              ) : (
                <>Siguiente<ChevronRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {rutina && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 uppercase tracking-wider">
                  AI-GENERATED
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{rutina.nombre}</h2>
              <p className="text-white/50 text-sm mt-0.5">
                {rutina.dias?.length || 1} días · {rutina.ejercicios.length} ejercicios totales
              </p>
            </div>
            <Button
              className="w-full sm:w-auto rounded-xl bg-[#00ff88] text-[#0a0f1e] hover:bg-[#00ff88]/90 font-bold"
              onClick={() => rutina?.id && router.push(`/rutina/${rutina.id}`)}
            >
              {rutina?.id ? "Ver rutina guardada" : "Guardar rutina"}
            </Button>
          </div>

          {(rutina.dias && rutina.dias.length > 1) && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {rutina.dias.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedDay(i)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border whitespace-nowrap transition-all ${
                    selectedDay === i
                      ? "bg-[#00ff88]/10 border-[#00ff88] text-[#00ff88]"
                      : "border-white/10 text-white/60 hover:border-white/20"
                  }`}
                >
                  {d.nombre}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {(rutina.dias && rutina.dias[selectedDay]
              ? rutina.dias[selectedDay].ejercicios
              : rutina.ejercicios
            ).map((ej, i) => (
              <EjercicioCard key={`${ej.exercise.id}-${i}`} ejercicio={ej} index={i} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

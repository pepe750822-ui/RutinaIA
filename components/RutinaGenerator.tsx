"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Dumbbell } from "lucide-react"
import EjercicioCard from "./EjercicioCard"
import { RutinaEjercicio, Exercise } from "@/types"

interface Props {
  ejercicios: Exercise[]
  onGenerate: (data: FormData) => Promise<{
    nombre: string
    duracion_minutos: number
    ejercicios: RutinaEjercicio[]
  } | null>
}

interface FormData {
  objetivo: string
  nivel: string
  tiempo: string
  equipo: string
  musculos: string
}

export default function RutinaGenerator({ ejercicios, onGenerate }: Props) {
  const [form, setForm] = useState<FormData>({
    objetivo: "",
    nivel: "principiante",
    tiempo: "30",
    equipo: "body weight",
    musculos: "full body",
  })
  const [loading, setLoading] = useState(false)
  const [rutina, setRutina] = useState<{
    nombre: string
    duracion_minutos: number
    ejercicios: RutinaEjercicio[]
  } | null>(null)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!form.objetivo.trim()) {
      setError("Describe tu objetivo físico")
      return
    }
    setLoading(true)
    setError("")
    setRutina(null)

    try {
      const result = await onGenerate(form)
      if (result) setRutina(result)
    } catch (e: any) {
      setError(e.message || "Error al generar rutina")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-[#00ff88]" />
            Genera tu rutina con IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>¿Cuál es tu objetivo?</Label>
            <textarea
              value={form.objetivo}
              onChange={(e) => setForm({ ...form, objetivo: e.target.value })}
              placeholder="Ej: Quiero ganar masa muscular en pecho y brazos..."
              className="w-full min-h-[100px] rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#00ff88] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nivel</Label>
              <Select value={form.nivel} onValueChange={(v) => setForm({ ...form, nivel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="principiante">Principiante</SelectItem>
                  <SelectItem value="intermedio">Intermedio</SelectItem>
                  <SelectItem value="avanzado">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tiempo disponible</Label>
              <Select value={form.tiempo} onValueChange={(v) => setForm({ ...form, tiempo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Equipo disponible</Label>
              <Select value={form.equipo} onValueChange={(v) => setForm({ ...form, equipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="body weight">Solo peso corporal</SelectItem>
                  <SelectItem value="dumbbell">Mancuernas</SelectItem>
                  <SelectItem value="barbell">Barra</SelectItem>
                  <SelectItem value="kettlebell">Kettlebell</SelectItem>
                  <SelectItem value="machine">Máquinas</SelectItem>
                  <SelectItem value="band">Bandas elásticas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Grupo muscular</Label>
              <Select value={form.musculos} onValueChange={(v) => setForm({ ...form, musculos: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full body">Cuerpo completo</SelectItem>
                  <SelectItem value="chest">Pecho</SelectItem>
                  <SelectItem value="back">Espalda</SelectItem>
                  <SelectItem value="upper arms">Brazos</SelectItem>
                  <SelectItem value="legs">Piernas</SelectItem>
                  <SelectItem value="shoulders">Hombros</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generando rutina con IA...
              </>
            ) : (
              "Generar rutina con IA"
            )}
          </Button>
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
                Duración estimada: {rutina.duracion_minutos} min &middot;{" "}
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

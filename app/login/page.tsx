"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setError("Error de configuración del servidor.")
      setLoading(false)
      return
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError("Email o contraseña incorrectos.")
      setLoading(false)
      return
    }

    router.push("/app")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Dumbbell className="w-7 h-7 text-[#00ff88]" />
          <span className="text-white font-bold text-2xl">RutinaIA</span>
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-6">Iniciar sesión</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/30 transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          <Link href="/" className="hover:text-white/70 transition-colors">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}

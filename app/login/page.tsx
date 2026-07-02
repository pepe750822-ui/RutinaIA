"use client"

import { useState } from "react"
import Link from "next/link"
import { Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleGoogleLogin() {
    setError("")
    setLoading(true)

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setError("Error de configuración del servidor.")
      setLoading(false)
      return
    }

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError("No se pudo iniciar sesión con Google. Intenta de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Dumbbell className="w-7 h-7 text-[#00ff88]" />
          <span className="text-white font-bold text-2xl">RutinaIA</span>
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-2">Iniciar sesión</h1>
          <p className="text-sm text-white/40 mb-8">
            Continúa con tu cuenta de Google para acceder a tus rutinas.
          </p>

          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            variant="outline"
            className="w-full gap-3 h-11 text-sm font-medium"
          >
            <GoogleIcon />
            {loading ? "Redirigiendo..." : "Continuar con Google"}
          </Button>

          {error && (
            <p className="mt-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}
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

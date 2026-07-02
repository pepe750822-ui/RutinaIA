"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Dumbbell, LayoutDashboard, LogIn } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setAuthReady(true)
      return
    }

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setUser(data.session?.user ?? null)
      setAuthReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0f1e]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-[#00ff88]" />
            <span className="text-white font-bold text-lg">RutinaIA</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-white/50 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#precios" className="text-sm text-white/50 hover:text-white transition-colors">
              Precios
            </Link>

            {authReady && (
              user ? (
                <Link href="/app">
                  <Button size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Mi dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="sm" variant="outline" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Iniciar sesión
                  </Button>
                </Link>
              )
            )}
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-[#0a0f1e]"
          >
            <div className="px-4 py-4 space-y-3">
              <Link href="#features" className="block text-white/50 hover:text-white py-2">
                Features
              </Link>
              <Link href="#precios" className="block text-white/50 hover:text-white py-2">
                Precios
              </Link>

              {authReady && (
                user ? (
                  <Link href="/app">
                    <Button className="w-full gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Mi dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button variant="outline" className="w-full gap-2">
                      <LogIn className="w-4 h-4" />
                      Iniciar sesión
                    </Button>
                  </Link>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

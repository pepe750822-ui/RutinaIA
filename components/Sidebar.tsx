"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Dumbbell, Sparkles, History, User, Home, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase"

const links = [
  { href: "/app", label: "Dashboard", icon: Home },
  { href: "/rutina/nueva", label: "Nueva rutina", icon: Sparkles },
  { href: "/app?tab=historial", label: "Historial", icon: History },
  { href: "/perfil", label: "Perfil", icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient()
    if (supabase) await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-white/5 bg-[#0a0f1e] hidden lg:flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-[#00ff88]" />
            <span className="text-white font-bold text-lg">RutinaIA</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  isActive
                    ? "bg-[#00ff88]/10 text-[#00ff88]"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <Button
            variant="ghost"
            className="w-full justify-start text-white/50"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Mobile / tablet bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#0a0f1e]/95 backdrop-blur-xl safe-area-bottom">
        <div className="flex items-center justify-around py-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-h-[52px] justify-center",
                  isActive
                    ? "text-[#00ff88]"
                    : "text-white/40 active:text-white/70"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-none">
                  {link.label === "Nueva rutina" ? "Nueva" : link.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

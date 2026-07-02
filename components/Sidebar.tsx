"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Dumbbell, Sparkles, History, User, Home, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const links = [
  { href: "/app", label: "Dashboard", icon: Home },
  { href: "/rutina/nueva", label: "Nueva rutina", icon: Sparkles },
  { href: "/app?tab=historial", label: "Historial", icon: History },
  { href: "/perfil", label: "Perfil", icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
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
        <Button variant="ghost" className="w-full justify-start text-white/50" size="sm">
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}

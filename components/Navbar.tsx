"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Dumbbell } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

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
            <Link href="/app">
              <Button size="sm">Comenzar</Button>
            </Link>
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
              <Link href="/app">
                <Button className="w-full">Comenzar</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

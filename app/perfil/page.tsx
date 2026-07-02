"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Dumbbell, Flame, Crown, Zap } from "lucide-react";
import Link from "next/link";

export default function PerfilPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-white">Perfil</h1>
        <p className="text-white/50 mt-1">Tus estadísticas y configuración.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#00ff88]/10 flex items-center justify-center">
                <User className="w-8 h-8 text-[#00ff88]" />
              </div>
              <div>
                <CardTitle>Usuario</CardTitle>
                <CardDescription>usuario@email.com</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Rutinas", value: "0", icon: Dumbbell },
                { label: "Racha", value: "0 días", icon: Flame },
                { label: "Plan", value: "Gratis", icon: Crown },
              ].map((s) => (
                <div key={s.label} className="text-center p-4 rounded-lg bg-white/5">
                  <s.icon className="w-5 h-5 text-[#00ff88] mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-white/40">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#00ff88]" />
              Plan actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">Gratis</p>
              <p className="text-sm text-white/50 mt-1">3 rutinas por semana</p>
            </div>
            <Link href="/#precios">
              <Button variant="outline" className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                Mejorar plan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

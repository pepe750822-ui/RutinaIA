"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Sparkles, Flame, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/50">Bienvenido a tu centro de entrenamiento.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Rutinas esta semana", value: "0", icon: Dumbbell },
          { label: "Racha actual", value: "0 días", icon: Flame },
          { label: "Total completadas", value: "0", icon: Calendar },
          { label: "Plan actual", value: "Gratis", icon: Sparkles },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-[#00ff88]" />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/40 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="hoy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hoy">Rutina de hoy</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="hoy">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sin rutina para hoy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/50 text-sm">
                Aún no has generado ninguna rutina para hoy. ¡Crea una ahora!
              </p>
              <Link href="/rutina/nueva">
                <Button>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generar rutina con IA
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial">
          <Card>
            <CardContent className="p-6 text-center text-white/50">
              <p>Aún no tienes rutinas completadas.</p>
              <p className="text-sm mt-1">¡Empieza tu primera rutina hoy!</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

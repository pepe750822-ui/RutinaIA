"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Sparkles, Flame, Calendar } from "lucide-react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";

interface ProfileRow {
  plan: string;
  rutinas_semana: number;
}

interface RutinaRow {
  id: string;
  nombre: string;
  duracion_minutos: number;
  ejercicios: unknown[];
  created_at: string;
  user_id: string;
  objetivo: string;
  nivel: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    rutinas: 0,
    racha: "0 días",
    completadas: 0,
    plan: "Gratis",
  });

  const [rutinas, setRutinas] = useState<RutinaRow[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("plan, rutinas_semana")
        .eq("id", user.id)
        .single() as unknown as { data: ProfileRow | null };

      const { data: rutinasData } = await supabase
        .from("rutinas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10) as unknown as { data: RutinaRow[] | null };

      if (profile) {
        setStats({
          rutinas: profile.rutinas_semana ?? 0,
          racha: "0 días",
          completadas: 0,
          plan: profile.plan === "premium" ? "Premium" : "Gratis",
        });
      }

      if (rutinasData) setRutinas(rutinasData);
      setLoading(false);
    }
    load();
  }, []);

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
          { label: "Rutinas esta semana", value: String(stats.rutinas), icon: Dumbbell },
          { label: "Racha actual", value: stats.racha, icon: Flame },
          { label: "Total completadas", value: String(stats.completadas), icon: Calendar },
          { label: "Plan actual", value: stats.plan, icon: Sparkles },
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
              <CardTitle className="text-lg">
                {rutinas.length > 0 ? "Última rutina" : "Sin rutina para hoy"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rutinas.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-white font-medium">{rutinas[0].nombre}</p>
                  <p className="text-sm text-white/50">
                    {rutinas[0].duracion_minutos} min &middot;{" "}
                    {rutinas[0].ejercicios?.length ?? 0} ejercicios
                  </p>
                  <Link href={`/rutina/${rutinas[0].id}`}>
                    <Button>
                      <Dumbbell className="w-4 h-4 mr-2" />
                      Ver rutina
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-white/50 text-sm">
                    Aún no has generado ninguna rutina. ¡Crea una ahora!
                  </p>
                  <Link href="/rutina/nueva">
                    <Button>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generar rutina con IA
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial">
          <Card>
            <CardContent className="p-6">
              {rutinas.length > 0 ? (
                <div className="space-y-3">
                  {rutinas.map((r) => (
                    <Link
                      key={r.id}
                      href={`/rutina/${r.id}`}
                      className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <p className="text-white font-medium">{r.nombre}</p>
                      <p className="text-sm text-white/50 mt-1">
                        {new Date(r.created_at).toLocaleDateString("es-MX")} &middot;{" "}
                        {r.duracion_minutos} min
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center text-white/50">
                  <p>Aún no tienes rutinas guardadas.</p>
                  <p className="text-sm mt-1">¡Genera tu primera rutina!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

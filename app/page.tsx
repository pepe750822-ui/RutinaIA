"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dumbbell, Sparkles, BarChart3, Zap, Check } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const features = [
  {
    icon: Sparkles,
    title: "Rutinas personalizadas",
    desc: "La IA analiza tu objetivo y genera la rutina perfecta para ti.",
  },
  {
    icon: Dumbbell,
    title: "1,324 ejercicios",
    desc: "Extenso dataset con ejercicios animados y explicaciones detalladas.",
  },
  {
    icon: BarChart3,
    title: "Seguimiento de progreso",
    desc: "Lleva el control de tus entrenamientos y mejora cada día.",
  },
];

const plans = [
  {
    name: "Gratis",
    price: "$0",
    desc: "Para empezar tu transformación",
    features: [
      "3 rutinas por semana",
      "Ejercicios básicos",
      "Acceso al gimnasio virtual",
      "Soporte por email",
    ],
    cta: "Empezar gratis",
    href: "/app",
    featured: false,
  },
  {
    name: "Premium",
    price: "$99",
    period: "/mes",
    desc: "Para los que van en serio",
    features: [
      "Rutinas ilimitadas",
      "Personalización avanzada",
      "Seguimiento de progreso",
      "Timer de entrenamiento",
      "Estadísticas detalladas",
      "Soporte prioritario",
    ],
    cta: "Ir a Premium",
    href: "/app",
    featured: true,
  },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00ff88]/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#00ff88]/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0066ff]/10 rounded-full blur-[128px]" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00ff88]/20 bg-[#00ff88]/5 text-[#00ff88] text-sm mb-8"
          >
            <Zap className="w-4 h-4" />
            Potenciado por IA
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Tu entrenador IA{" "}
            <span className="text-gradient">personal</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10">
            Describe tu objetivo y deja que la inteligencia artificial genere la
            rutina de ejercicios perfecta para ti.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                Comenzar gratis
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8">
                Conocer más
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Todo lo que necesitas
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Una plataforma completa para transformar tu cuerpo con el poder de la IA.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <f.icon className="w-10 h-10 text-[#00ff88] mb-2" />
                    <CardTitle>{f.title}</CardTitle>
                    <CardDescription>{f.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Planes simples, sin sorpresas
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Elige el plan que mejor se adapte a tus objetivos.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                <Card
                  className={`h-full relative ${
                    plan.featured
                      ? "border-[#00ff88]/30 ring-1 ring-[#00ff88]/20"
                      : ""
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#00ff88] text-[#0a0f1e] text-xs font-bold rounded-full">
                      MÁS POPULAR
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="text-4xl font-bold text-white">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-white/40 text-sm">{plan.period}</span>
                      )}
                    </div>
                    <CardDescription className="mt-2">{plan.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3 text-sm text-white/70">
                          <Check className="w-4 h-4 text-[#00ff88] mt-0.5 shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <Link href={plan.href}>
                      <Button
                        variant={plan.featured ? "default" : "outline"}
                        className="w-full"
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[#00ff88]" />
            <span className="text-white font-semibold">RutinaIA</span>
          </div>
          <p className="text-sm text-white/30">
            &copy; {new Date().getFullYear()} RutinaIA. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </>
  );
}

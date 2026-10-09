"use client";

import { motion } from "framer-motion";
import RutinaGenerator from "@/components/RutinaGenerator";
import { RutinaGeneratorForm } from "@/types";

export default function NuevaRutinaPage() {
  const handleGenerate = async (form: RutinaGeneratorForm) => {
    const res = await fetch("/api/generar-rutina", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al generar rutina");
    }

    return res.json();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-white">Nueva rutina</h1>
        <p className="text-white/50 mt-1">
          Responde las siguientes preguntas y la IA generará una rutina
          personalizada para ti.
        </p>
      </div>

      <RutinaGenerator onGenerate={handleGenerate} />
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import FoodCamera from "@/components/food/FoodCamera";
import FoodAnalysisCard from "@/components/food/FoodAnalysisCard";
import type { FoodAnalysis } from "@/types/food";

type Phase =
  | { kind: "capture" }
  | { kind: "review"; photoJobId: string; photoUrl: string; analysis: FoodAnalysis }
  | { kind: "done"; foodLogId: string };

export default function LogFoodPage() {
  const [phase, setPhase] = useState<Phase>({ kind: "capture" });

  if (phase.kind === "capture") {
    return (
      <main className="flex flex-col items-center px-4 pt-8 pb-24 min-h-screen">
        <h1 className="text-lg font-bold mb-6">Registrar comida</h1>
        <FoodCamera
          onAnalysis={({ photo_job_id, photo_url, analysis }) =>
            setPhase({ kind: "review", photoJobId: photo_job_id, photoUrl: photo_url, analysis })
          }
        />
      </main>
    );
  }

  if (phase.kind === "review") {
    return (
      <main className="flex flex-col items-center px-4 pt-8 pb-24 min-h-screen">
        <h1 className="text-lg font-bold mb-6">Confirmar análisis</h1>
        <FoodAnalysisCard
          photoJobId={phase.photoJobId}
          photoUrl={phase.photoUrl}
          analysis={phase.analysis}
          onConfirmed={(foodLogId) => setPhase({ kind: "done", foodLogId })}
          onRetake={() => setPhase({ kind: "capture" })}
        />
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 gap-4">
      <p className="text-2xl">✓</p>
      <p className="text-lg font-semibold">¡Comida registrada!</p>
      <button
        onClick={() => setPhase({ kind: "capture" })}
        className="mt-4 py-3 px-8 rounded-xl bg-[--accent] text-white font-semibold"
      >
        Registrar otra
      </button>
    </main>
  );
}

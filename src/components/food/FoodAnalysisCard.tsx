"use client";

import { useState } from "react";
import type { FoodAnalysis } from "@/types/food";
import { confirmFoodLog } from "@/app/(student)/log/food/actions";

interface Props {
  photoJobId: string;
  photoUrl: string;
  analysis: FoodAnalysis;
  onConfirmed: (foodLogId: string) => void;
  onRetake: () => void;
}

const CONFIDENCE_LABEL: Record<FoodAnalysis["confidence"], string> = {
  high: "Alta confianza",
  medium: "Confianza media",
  low: "Baja confianza",
};

const CONFIDENCE_COLOR: Record<FoodAnalysis["confidence"], string> = {
  high: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-red-100 text-red-700",
};

export default function FoodAnalysisCard({
  photoJobId,
  photoUrl,
  analysis,
  onConfirmed,
  onRetake,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSaving(true);
    setError(null);
    try {
      const result = await confirmFoodLog({ photoJobId, photoUrl, analysis });
      if ("error" in result) {
        setError(result.error);
      } else {
        onConfirmed(result.foodLogId);
      }
    } catch {
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <img
        src={photoUrl}
        alt="Foto del alimento"
        className="w-full aspect-square object-cover rounded-2xl"
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-[--fg-muted]">{analysis.description}</p>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${CONFIDENCE_COLOR[analysis.confidence]}`}
        >
          {CONFIDENCE_LABEL[analysis.confidence]}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: "Cal", value: Math.round(analysis.total_calories) },
          { label: "Prot", value: `${Math.round(analysis.total_protein_g)}g` },
          { label: "Carbs", value: `${Math.round(analysis.total_carbs_g)}g` },
          { label: "Grasa", value: `${Math.round(analysis.total_fat_g)}g` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-neutral-100 dark:bg-neutral-800 rounded-xl py-2">
            <p className="text-base font-bold">{value}</p>
            <p className="text-xs text-[--fg-muted]">{label}</p>
          </div>
        ))}
      </div>

      {analysis.items.length > 0 && (
        <ul className="text-sm space-y-1">
          {analysis.items.map((item, i) => (
            <li key={i} className="flex justify-between text-[--fg-muted]">
              <span>{item.name}</span>
              <span>{Math.round(item.calories)} kcal</span>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-red-500 text-sm text-center">
          {error}
        </p>
      )}

      <button
        onClick={handleConfirm}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-[--accent] text-white font-semibold disabled:opacity-50 active:scale-95 transition-transform"
      >
        {saving ? "Guardando…" : "Confirmar"}
      </button>

      <button
        onClick={onRetake}
        disabled={saving}
        className="w-full py-2 rounded-xl text-[--fg-muted] text-sm disabled:opacity-50"
      >
        Tomar otra foto
      </button>
    </div>
  );
}

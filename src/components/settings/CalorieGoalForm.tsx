"use client";

import { useState } from "react";

interface Props {
  currentLimit?: number;
}

export default function CalorieGoalForm({ currentLimit }: Props) {
  const [value, setValue] = useState(String(currentLimit ?? 2000));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const kcal = parseInt(value, 10);
    if (!kcal || kcal < 500 || kcal > 10000) {
      setError("Ingresa entre 500 y 10 000 kcal.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/goals/calories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daily_limit_kcal: kcal }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message ?? "Error al guardar.");
        return;
      }
      setSaved(true);
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-sm">
      <label className="text-sm font-medium" htmlFor="calorie-limit">
        Límite calórico diario (kcal)
      </label>
      <input
        id="calorie-limit"
        type="number"
        min={500}
        max={10000}
        value={value}
        onChange={(e) => { setValue(e.target.value); setSaved(false); }}
        className="rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 bg-transparent text-sm"
        aria-label="Límite calórico diario"
      />
      {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
      {saved && <p className="text-emerald-600 text-sm">¡Meta guardada!</p>}
      <button
        type="submit"
        disabled={saving}
        className="py-3 rounded-xl bg-[--accent] text-white font-semibold disabled:opacity-50 active:scale-95 transition-transform"
      >
        {saving ? "Guardando…" : "Guardar meta"}
      </button>
    </form>
  );
}

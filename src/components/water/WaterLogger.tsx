"use client";

import { useState } from "react";

const PRESETS = [200, 350, 500];

interface Props {
  onLogged: (amountMl: number) => void;
}

export default function WaterLogger({ onLogged }: Props) {
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function logWater(amountMl: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_ml: amountMl }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message ?? "Error al registrar agua.");
        return;
      }
      setCustom("");
      onLogged(amountMl);
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ml = parseInt(custom, 10);
    if (!ml || ml < 1 || ml > 2000) {
      setError("Ingresa entre 1 y 2000 ml.");
      return;
    }
    logWater(ml);
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((ml) => (
          <button
            key={ml}
            onClick={() => logWater(ml)}
            disabled={loading}
            className="py-3 rounded-xl bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-200 font-semibold disabled:opacity-50 active:scale-95 transition-transform"
          >
            {ml} ml
          </button>
        ))}
      </div>

      <form onSubmit={handleCustomSubmit} className="flex gap-2">
        <input
          type="number"
          min={1}
          max={2000}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="ml personalizado"
          className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm bg-transparent"
          aria-label="Cantidad personalizada en ml"
        />
        <button
          type="submit"
          disabled={loading || !custom}
          className="px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-semibold disabled:opacity-50 active:scale-95 transition-transform"
        >
          {loading ? "…" : "+"}
        </button>
      </form>

      {error && (
        <p role="alert" className="text-red-500 text-sm text-center">
          {error}
        </p>
      )}
    </div>
  );
}

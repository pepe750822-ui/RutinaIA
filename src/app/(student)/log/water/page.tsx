"use client";

import { useState } from "react";
import WaterLogger from "@/components/water/WaterLogger";

export default function LogWaterPage() {
  const [lastLogged, setLastLogged] = useState<number | null>(null);

  return (
    <main className="flex flex-col items-center px-4 pt-8 pb-24 min-h-screen gap-6">
      <h1 className="text-lg font-bold self-start">Registrar agua</h1>

      {lastLogged !== null && (
        <div className="w-full max-w-sm rounded-xl bg-sky-50 dark:bg-sky-900/30 px-4 py-3 text-sky-700 dark:text-sky-300 text-sm text-center">
          +{lastLogged} ml registrados
        </div>
      )}

      <WaterLogger onLogged={(ml) => setLastLogged(ml)} />
    </main>
  );
}

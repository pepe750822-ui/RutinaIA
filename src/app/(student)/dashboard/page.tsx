import Link from "next/link";
import { Suspense } from "react";
import DailySummary from "@/components/DailySummary";
import FoodLogList from "@/components/food/FoodLogList";

export default function DashboardPage() {
  return (
    <main className="flex flex-col items-center gap-6 px-4 pt-8 pb-24 min-h-screen">
      <h1 className="text-xl font-bold self-start">Mi día</h1>

      <Suspense fallback={<div className="w-full max-w-sm h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />}>
        <DailySummary />
      </Suspense>

      <div className="flex gap-3 w-full max-w-sm">
        <Link
          href="/log/food"
          className="flex-1 py-4 rounded-2xl bg-[--accent] text-white font-semibold text-center active:scale-95 transition-transform"
        >
          + Comida
        </Link>
        <Link
          href="/log/water"
          className="flex-1 py-4 rounded-2xl bg-sky-500 text-white font-semibold text-center active:scale-95 transition-transform"
        >
          + Agua
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-sm text-center text-[--fg-muted] text-sm">Cargando…</div>
        }
      >
        <FoodLogList />
      </Suspense>
    </main>
  );
}

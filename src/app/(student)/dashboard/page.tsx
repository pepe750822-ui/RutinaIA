import Link from "next/link";
import { Suspense } from "react";
import FoodLogList from "@/components/food/FoodLogList";

export default function DashboardPage() {
  return (
    <main className="flex flex-col items-center gap-6 px-4 pt-8 pb-24 min-h-screen">
      <h1 className="text-xl font-bold self-start">Mi día</h1>

      <Link
        href="/log/food"
        className="w-full max-w-sm py-4 rounded-2xl bg-[--accent] text-white font-semibold text-center active:scale-95 transition-transform"
      >
        + Registrar comida
      </Link>

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

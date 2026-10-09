"use server";

import type { FoodAnalysis } from "@/types/food";

interface ConfirmInput {
  photoJobId: string;
  photoUrl: string;
  analysis: FoodAnalysis;
}

type ConfirmResult =
  | { foodLogId: string }
  | { error: string };

export async function confirmFoodLog(input: ConfirmInput): Promise<ConfirmResult> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/food/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      photo_job_id: input.photoJobId,
      photo_url: input.photoUrl,
      analysis: input.analysis,
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    const code = json?.error?.code as string | undefined;
    if (code === "job_already_processed") return { error: "Este análisis ya fue confirmado." };
    if (code === "job_not_found") return { error: "Análisis no encontrado." };
    return { error: "No se pudo guardar el registro." };
  }

  return { foodLogId: json.data.food_log_id };
}

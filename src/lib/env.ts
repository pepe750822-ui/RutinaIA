import { z } from "zod";

// Each variable is required only from the step that first uses it.
// Variables for later steps stay optional so earlier gates don't fail.
const schema = z.object({
  // Step 1
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Step 2
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),

  // Step 4
  CRON_SECRET: z.string().min(1),

  // Step 5
  GEMINI_API_KEY: z.string().min(1),

  // Step 6 — Mercado Pago
  MERCADOPAGO_ACCESS_TOKEN: z.string().min(1),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().min(1),
  NEXT_PUBLIC_MP_PUBLIC_KEY: z.string().min(1),
  MP_PLAN_ID: z.string().min(1),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;

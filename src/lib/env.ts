import { z } from "zod";

// Each variable is required only from the step that first uses it.
// Variables for later steps are optional here so early gates don't fail.
const schema = z.object({
  // Step 1
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Step 2 — optional until data-layer step
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),

  // Step 4
  CRON_SECRET: z.string().optional(),

  // Step 5
  GEMINI_API_KEY: z.string().optional(),

  // Step 6
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_PRICE_ID: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;

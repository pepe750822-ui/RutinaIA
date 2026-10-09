import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    env: {
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
      DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
      CRON_SECRET: "test-cron-secret",
      GEMINI_API_KEY: "test-gemini-key",
      STRIPE_SECRET_KEY: "sk_test_fake",
      STRIPE_WEBHOOK_SECRET: "whsec_fake",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_fake",
      STRIPE_PRICE_ID: "price_fake",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

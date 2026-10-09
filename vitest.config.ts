import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["e2e/**"],
    setupFiles: ["./tests/setup.ts"],
    env: {
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
      DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
      CRON_SECRET: "test-cron-secret",
      GEMINI_API_KEY: "test-gemini-key",
      MERCADOPAGO_ACCESS_TOKEN: "TEST-fake-access-token",
      MERCADOPAGO_WEBHOOK_SECRET: "a".repeat(32),
      NEXT_PUBLIC_MP_PUBLIC_KEY: "TEST-fake-public-key",
      MP_PLAN_ID: "fake-plan-id",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

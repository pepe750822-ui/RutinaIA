import { test, expect } from "@playwright/test";

test.describe("Water logging flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        const url = typeof input === "string" ? input : (input as Request).url;

        if (url.includes("/api/water")) {
          const body = init?.body ? JSON.parse(init.body as string) : {};
          return new Response(
            JSON.stringify({ data: { water_log_id: "wlog-e2e-001", amount_ml: body.amount_ml } }),
            { status: 201, headers: { "Content-Type": "application/json" } }
          );
        }

        if (url.includes("/api/goals/calories")) {
          const body = init?.body ? JSON.parse(init.body as string) : {};
          return new Response(
            JSON.stringify({ data: { goal_id: "goal-e2e-001", daily_limit_kcal: body.daily_limit_kcal } }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        return originalFetch(input, init);
      };
    });
  });

  test("shows preset buttons on /log/water", async ({ page }) => {
    await page.goto("/log/water");
    await expect(page.getByRole("button", { name: "200 ml" })).toBeVisible();
    await expect(page.getByRole("button", { name: "350 ml" })).toBeVisible();
    await expect(page.getByRole("button", { name: "500 ml" })).toBeVisible();
  });

  test("logs water via preset and shows confirmation", async ({ page }) => {
    await page.goto("/log/water");
    await page.getByRole("button", { name: "350 ml" }).click();
    await expect(page.getByText("+350 ml registrados")).toBeVisible({ timeout: 3000 });
  });

  test("logs water via custom input", async ({ page }) => {
    await page.goto("/log/water");
    await page.getByLabel("Cantidad personalizada en ml").fill("450");
    await page.getByRole("button", { name: "+" }).click();
    await expect(page.getByText("+450 ml registrados")).toBeVisible({ timeout: 3000 });
  });

  test("shows validation error for invalid custom amount", async ({ page }) => {
    await page.goto("/log/water");
    await page.getByLabel("Cantidad personalizada en ml").fill("0");
    await page.getByRole("button", { name: "+" }).click();
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 2000 });
  });

  test("settings page shows calorie goal form", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByLabel("Límite calórico diario")).toBeVisible();
    await expect(page.getByRole("button", { name: "Guardar meta" })).toBeVisible();
  });

  test("saves calorie goal from settings", async ({ page }) => {
    await page.goto("/settings");
    await page.getByLabel("Límite calórico diario").fill("1800");
    await page.getByRole("button", { name: "Guardar meta" }).click();
    await expect(page.getByText("¡Meta guardada!")).toBeVisible({ timeout: 3000 });
  });
});

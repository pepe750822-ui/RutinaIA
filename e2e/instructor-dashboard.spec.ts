import { test, expect } from "@playwright/test";

const STUDENT_ID = "student-e2e-001";

test.describe("Instructor dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        const url = typeof input === "string" ? input : (input as Request).url;

        if (url.includes("/api/instructor/students") && !url.includes("summary")) {
          return new Response(
            JSON.stringify({
              data: [
                {
                  student_id: "student-e2e-001",
                  status: "active",
                  profiles: { id: "student-e2e-001", display_name: "María García", avatar_url: null },
                },
              ],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        if (url.includes("/api/instructor/students") && url.includes("summary")) {
          return new Response(
            JSON.stringify({
              data: {
                profile: { id: "student-e2e-001", display_name: "María García", avatar_url: null },
                food_logs: [
                  {
                    id: "f1",
                    photo_url: "https://placehold.co/100x100/png",
                    total_calories: 450,
                    total_protein_g: 35,
                    total_carbs_g: 40,
                    total_fat_g: 12,
                    analysis_json: { description: "Pollo con arroz", items: [], total_calories: 450, total_protein_g: 35, total_carbs_g: 40, total_fat_g: 12, confidence: "high" },
                    created_at: new Date().toISOString(),
                  },
                ],
                water_logs: [{ id: "w1", amount_ml: 500, logged_at: new Date().toISOString() }],
                total_calories: 450,
                total_water_ml: 500,
                daily_limit_kcal: 2000,
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        if (url.includes("/api/instructor/invites")) {
          return new Response(
            JSON.stringify({ data: { invited: true, email: "test@test.com" } }),
            { status: 201, headers: { "Content-Type": "application/json" } }
          );
        }

        return originalFetch(input, init);
      };
    });
  });

  test("instructor page shows invite form", async ({ page }) => {
    await page.goto("/instructor");
    await expect(page.getByRole("button", { name: "Invitar alumno" })).toBeVisible();
  });

  test("invite form shows confirmation after submit", async ({ page }) => {
    await page.goto("/instructor");
    await page.getByLabel("Invitar alumno por correo").fill("nuevo@alumno.com");
    await page.getByRole("button", { name: "Invitar alumno" }).click();
    await expect(page.getByText("Invitación enviada")).toBeVisible({ timeout: 3000 });
  });

  test("student detail page shows nutrition summary", async ({ page }) => {
    await page.goto(`/instructor/students/${STUDENT_ID}`);
    await expect(page.getByText("Calorías hoy")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Agua")).toBeVisible();
  });

  test("student detail page shows food logs", async ({ page }) => {
    await page.goto(`/instructor/students/${STUDENT_ID}`);
    await expect(page.getByText("Pollo con arroz")).toBeVisible({ timeout: 5000 });
  });
});

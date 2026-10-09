import { test, expect } from "@playwright/test";

test.describe("Food logging flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth cookie so the student layout passes
    await page.addInitScript(() => {
      // Intercept fetch to /api/food/analyze and return a canned analysis
      const originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        const url = typeof input === "string" ? input : (input as Request).url;

        if (url.includes("/api/food/analyze")) {
          return new Response(
            JSON.stringify({
              data: {
                photo_job_id: "11111111-1111-1111-1111-111111111111",
                photo_url: "https://placehold.co/400x400/png",
                analysis: {
                  items: [
                    {
                      name: "Taco de pollo",
                      calories: 250,
                      protein_g: 20,
                      carbs_g: 22,
                      fat_g: 8,
                      portion_description: "1 taco mediano",
                    },
                  ],
                  total_calories: 250,
                  total_protein_g: 20,
                  total_carbs_g: 22,
                  total_fat_g: 8,
                  description: "Taco de pollo a la plancha",
                  confidence: "high",
                },
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        if (url.includes("/api/food/confirm")) {
          return new Response(
            JSON.stringify({ data: { food_log_id: "log-e2e-001" } }),
            { status: 201, headers: { "Content-Type": "application/json" } }
          );
        }

        return originalFetch(input, init);
      };
    });
  });

  test("shows camera button on /log/food", async ({ page }) => {
    await page.goto("/log/food");
    await expect(page.getByText("Abrir cámara")).toBeVisible();
  });

  test("opens camera and shows capture button", async ({ page, context }) => {
    await context.grantPermissions(["camera"]);

    // Mock getUserMedia to return a blank stream
    await page.addInitScript(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const stream = (canvas as HTMLCanvasElement & { captureStream: (fps: number) => MediaStream }).captureStream(10);
      Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
        value: () => Promise.resolve(stream),
      });
    });

    await page.goto("/log/food");
    await page.getByText("Abrir cámara").click();
    await expect(page.getByRole("button", { name: "Capturar foto" })).toBeVisible({ timeout: 5000 });
  });

  test("shows analysis card after capture and confirms", async ({ page, context }) => {
    await context.grantPermissions(["camera"]);

    await page.addInitScript(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#888";
      ctx.fillRect(0, 0, 320, 240);
      const stream = (canvas as HTMLCanvasElement & { captureStream: (fps: number) => MediaStream }).captureStream(10);
      Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
        value: () => Promise.resolve(stream),
      });
    });

    await page.goto("/log/food");
    await page.getByText("Abrir cámara").click();
    await page.getByRole("button", { name: "Capturar foto" }).click({ timeout: 5000 });

    await expect(page.getByText("250")).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("Taco de pollo a la plancha")).toBeVisible();

    await page.getByRole("button", { name: "Confirmar" }).click();
    await expect(page.getByText("¡Comida registrada!")).toBeVisible({ timeout: 5000 });
  });

  test("retake resets to camera view", async ({ page, context }) => {
    await context.grantPermissions(["camera"]);

    await page.addInitScript(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      const stream = (canvas as HTMLCanvasElement & { captureStream: (fps: number) => MediaStream }).captureStream(10);
      Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
        value: () => Promise.resolve(stream),
      });
    });

    await page.goto("/log/food");
    await page.getByText("Abrir cámara").click();
    await page.getByRole("button", { name: "Capturar foto" }).click({ timeout: 5000 });

    await expect(page.getByText("Taco de pollo a la plancha")).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "Tomar otra foto" }).click();
    await expect(page.getByText("Abrir cámara")).toBeVisible();
  });
});

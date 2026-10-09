import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FoodAnalysis } from "@/types/food";

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(),
  SchemaType: {
    OBJECT: "OBJECT",
    ARRAY: "ARRAY",
    STRING: "STRING",
    NUMBER: "NUMBER",
    INTEGER: "INTEGER",
  },
}));

import { GoogleGenerativeAI } from "@google/generative-ai";
import { analyzeFood } from "@/lib/gemini/client";

const VALID_ANALYSIS: FoodAnalysis = {
  items: [
    {
      name: "Arroz con pollo",
      calories: 420,
      protein_g: 28,
      carbs_g: 55,
      fat_g: 8,
      portion_description: "1 plato mediano",
    },
  ],
  total_calories: 420,
  total_protein_g: 28,
  total_carbs_g: 55,
  total_fat_g: 8,
  description: "Arroz con pollo casero",
  confidence: "high",
};

const mockGenerateContent = vi.fn();

beforeEach(() => {
  mockGenerateContent.mockReset();
  // Use a regular function so `new GoogleGenerativeAI()` works
  vi.mocked(GoogleGenerativeAI).mockImplementation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function (this: any) {
      this.getGenerativeModel = () => ({ generateContent: mockGenerateContent });
    } as unknown as typeof GoogleGenerativeAI
  );
});

describe("analyzeFood", () => {
  it("returns a FoodAnalysis with positive total_calories on success", async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(VALID_ANALYSIS) },
    });

    const result = await analyzeFood("base64imagedata");

    expect(result.total_calories).toBeGreaterThan(0);
    expect(result.confidence).toBe("high");
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe("Arroz con pollo");
  });

  it("throws with message gemini_timeout on timeout", async () => {
    vi.useFakeTimers();

    mockGenerateContent.mockImplementation(
      () => new Promise<never>(() => {}) // never resolves
    );

    const promise = analyzeFood("base64imagedata");

    // Pre-attach assertion BEFORE advancing timers so the rejection is
    // never seen as unhandled by Node.js
    const assertion = expect(promise).rejects.toMatchObject({
      message: "gemini_timeout",
      code: "gemini_timeout",
    });

    await vi.advanceTimersByTimeAsync(31_000);
    await assertion;

    vi.useRealTimers();
  });

  it("retries once on 5xx error and succeeds on second attempt", async () => {
    vi.useFakeTimers();

    const serverError = Object.assign(new Error("Internal Server Error"), {
      status: 500,
    });

    mockGenerateContent
      .mockRejectedValueOnce(serverError)
      .mockResolvedValueOnce({
        response: { text: () => JSON.stringify(VALID_ANALYSIS) },
      });

    const promise = analyzeFood("base64imagedata");

    // Advance past 1s backoff
    await vi.advanceTimersByTimeAsync(1_500);

    const result = await promise;
    expect(result.total_calories).toBeGreaterThan(0);
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});

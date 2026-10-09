import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import type { FoodAnalysis } from "@/types/food";

const FOOD_ANALYSIS_SYSTEM_PROMPT =
  "You are a nutrition analysis expert. Analyze the food visible in this image and return structured nutritional data. For each identifiable food item, estimate calories, protein, carbohydrates, and fat based on standard portion sizes visible. If the image is unclear, not food, or you cannot make a reasonable estimate, set confidence to 'low'. Respond only in valid JSON matching the provided schema.";

// Cast via unknown to satisfy the SDK's discriminated-union Schema type
const FOOD_ANALYSIS_RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    items: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          calories: { type: SchemaType.NUMBER },
          protein_g: { type: SchemaType.NUMBER },
          carbs_g: { type: SchemaType.NUMBER },
          fat_g: { type: SchemaType.NUMBER },
          portion_description: { type: SchemaType.STRING },
        },
        required: ["name", "calories", "protein_g", "carbs_g", "fat_g", "portion_description"],
      },
    },
    total_calories: { type: SchemaType.NUMBER },
    total_protein_g: { type: SchemaType.NUMBER },
    total_carbs_g: { type: SchemaType.NUMBER },
    total_fat_g: { type: SchemaType.NUMBER },
    description: { type: SchemaType.STRING },
    confidence: { type: SchemaType.STRING },
  },
  required: [
    "items",
    "total_calories",
    "total_protein_g",
    "total_carbs_g",
    "total_fat_g",
    "description",
    "confidence",
  ],
} as unknown as Schema;

function is5xxError(error: unknown): boolean {
  if (error instanceof Error) {
    const status = (error as Error & { status?: number }).status;
    if (typeof status === "number" && status >= 500) return true;
    if (/\b5\d{2}\b/.test(error.message)) return true;
  }
  return false;
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.message === "gemini_timeout";
}

async function callGemini(imageBase64: string): Promise<FoodAnalysis> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: FOOD_ANALYSIS_RESPONSE_SCHEMA,
    },
    systemInstruction: FOOD_ANALYSIS_SYSTEM_PROMPT,
  });

  const contentRequest = {
    contents: [
      {
        role: "user" as const,
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
          { text: "Analyze this food image." },
        ],
      },
    ],
  };

  return new Promise<FoodAnalysis>((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error("gemini_timeout") as Error & { code: string };
      err.code = "gemini_timeout";
      reject(err);
    }, 30_000);

    model
      .generateContent(contentRequest)
      .then((result) => {
        clearTimeout(timer);
        try {
          resolve(JSON.parse(result.response.text()) as FoodAnalysis);
        } catch {
          reject(new Error("gemini_invalid_response"));
        }
      })
      .catch((error: unknown) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export async function analyzeFood(imageBase64: string): Promise<FoodAnalysis> {
  try {
    return await callGemini(imageBase64);
  } catch (error) {
    if (isTimeoutError(error)) throw error;

    if (is5xxError(error)) {
      await new Promise((resolve) => setTimeout(resolve, 1_000));
      return await callGemini(imageBase64);
    }

    throw error;
  }
}

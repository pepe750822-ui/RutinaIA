import { vi } from "vitest";

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(),
  HarmCategory: {},
  HarmBlockThreshold: {},
}));

vi.mock("stripe", () => ({
  default: vi.fn(),
  Stripe: vi.fn(),
}));

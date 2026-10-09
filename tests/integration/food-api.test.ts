import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FoodAnalysis } from "@/types/food";

// ── Supabase SSR (auth) ──────────────────────────────────────────────────────
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// ── Supabase service-role (storage + food_logs + photo_jobs) ─────────────────
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

// ── Credit helpers ────────────────────────────────────────────────────────────
vi.mock("@/lib/credits", () => ({
  reservePhotoCredit: vi.fn(),
  settlePhotoCredit: vi.fn().mockResolvedValue(undefined),
}));

// ── Gemini ────────────────────────────────────────────────────────────────────
vi.mock("@/lib/gemini/client", () => ({
  analyzeFood: vi.fn(),
}));

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { reservePhotoCredit, settlePhotoCredit } from "@/lib/credits";
import { analyzeFood } from "@/lib/gemini/client";

import { POST as analyzeRoute } from "@/app/api/food/analyze/route";
import { POST as confirmRoute } from "@/app/api/food/confirm/route";

const USER_ID = "user-abc";
const JOB_ID = "11111111-1111-1111-1111-111111111111";
const PHOTO_URL = "https://example.com/photo.jpg";

const MOCK_ANALYSIS: FoodAnalysis = {
  items: [{ name: "Pollo", calories: 200, protein_g: 30, carbs_g: 0, fat_g: 8, portion_description: "150g" }],
  total_calories: 200,
  total_protein_g: 30,
  total_carbs_g: 0,
  total_fat_g: 8,
  description: "Pollo a la plancha",
  confidence: "high",
};

function makeAuthMock(userId: string | null) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null } }) },
    from: vi.fn(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// /api/food/analyze
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/food/analyze", () => {
  function makeUploadMock() {
    return {
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: PHOTO_URL } }),
        }),
      },
    };
  }

  function makeRequest(fileSize = 1024, mime = "image/jpeg") {
    const file = new File([new Uint8Array(fileSize)], "test.jpg", { type: mime });
    const form = new FormData();
    form.append("image", file);
    return new Request("http://localhost/api/food/analyze", { method: "POST", body: form });
  }

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(null) as never);
    const res = await analyzeRoute(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 400 for oversized image", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(USER_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(makeUploadMock() as never);
    const res = await analyzeRoute(makeRequest(6 * 1024 * 1024));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("image_too_large");
  });

  it("returns 402 when no credits", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(USER_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(makeUploadMock() as never);
    const err = Object.assign(new Error("insufficient_credits"), { code: "insufficient_credits" });
    vi.mocked(reservePhotoCredit).mockRejectedValue(err);

    const res = await analyzeRoute(makeRequest());
    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body.error.code).toBe("insufficient_credits");
  });

  it("returns 200 with analysis on success", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(USER_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(makeUploadMock() as never);
    vi.mocked(reservePhotoCredit).mockResolvedValue(JOB_ID);
    vi.mocked(analyzeFood).mockResolvedValue(MOCK_ANALYSIS);

    const res = await analyzeRoute(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.photo_job_id).toBe(JOB_ID);
    expect(body.data.analysis.total_calories).toBe(200);
  });

  it("returns 504 on gemini timeout", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(USER_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(makeUploadMock() as never);
    vi.mocked(reservePhotoCredit).mockResolvedValue(JOB_ID);
    vi.mocked(analyzeFood).mockRejectedValue(new Error("gemini_timeout"));

    const res = await analyzeRoute(makeRequest());
    expect(res.status).toBe(504);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// /api/food/confirm
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/food/confirm", () => {
  function makeConfirmRequest(body: object) {
    return new Request("http://localhost/api/food/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  function makeServiceMock(jobStatus: string | null, insertError: unknown = null) {
    const selectSingle = vi.fn().mockResolvedValue({
      data: jobStatus ? { id: JOB_ID, status: jobStatus, student_id: USER_ID } : null,
    });
    const insertSelect = vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: insertError ? null : { id: "log-001" },
        error: insertError,
      }),
    });
    return {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ single: selectSingle }),
        }),
        insert: vi.fn().mockReturnValue({
          select: insertSelect,
        }),
      }),
    };
  }

  const validBody = {
    photo_job_id: JOB_ID,
    photo_url: PHOTO_URL,
    analysis: MOCK_ANALYSIS,
  };

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(null) as never);
    const res = await confirmRoute(makeConfirmRequest(validBody));
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid body", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(USER_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(makeServiceMock("pending") as never);
    const res = await confirmRoute(makeConfirmRequest({ bad: true }));
    expect(res.status).toBe(400);
  });

  it("returns 409 when job already processed", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(USER_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(makeServiceMock("settled") as never);
    const res = await confirmRoute(makeConfirmRequest(validBody));
    expect(res.status).toBe(409);
  });

  it("returns 201 with food_log_id on success", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(USER_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(makeServiceMock("pending") as never);
    vi.mocked(settlePhotoCredit).mockResolvedValue(undefined);

    const res = await confirmRoute(makeConfirmRequest(validBody));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.food_log_id).toBe("log-001");
  });

  it("still returns 201 when settlePhotoCredit throws", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(USER_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(makeServiceMock("pending") as never);
    vi.mocked(settlePhotoCredit).mockRejectedValue(new Error("rpc error"));

    const res = await confirmRoute(makeConfirmRequest(validBody));
    expect(res.status).toBe(201);
  });
});

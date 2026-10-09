import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

import { POST as waterRoute } from "@/app/api/water/route";
import { POST as caloriesRoute } from "@/app/api/goals/calories/route";

const USER_ID = "user-water-test";

function makeAuthMock(userId: string | null) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null } }) },
    from: vi.fn(),
  };
}

function makeServiceMock(insertResult: { data: unknown; error: unknown }) {
  return {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(insertResult),
        }),
      }),
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(insertResult),
        }),
      }),
    }),
  };
}

function makeRequest(body: object, path = "/api/water") {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => vi.clearAllMocks());

// ─── POST /api/water ──────────────────────────────────────────────────────────

describe("POST /api/water", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(null) as never);
    const res = await waterRoute(makeRequest({ amount_ml: 300 }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for missing amount_ml", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(USER_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(makeServiceMock({ data: null, error: null }) as never);
    const res = await waterRoute(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("validation_error");
  });

  it("returns 400 when amount_ml exceeds 2000", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(USER_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(makeServiceMock({ data: null, error: null }) as never);
    const res = await waterRoute(makeRequest({ amount_ml: 2001 }));
    expect(res.status).toBe(400);
  });

  it("returns 201 with water_log_id on success", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(USER_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(
      makeServiceMock({ data: { id: "wlog-001", amount_ml: 350 }, error: null }) as never
    );
    const res = await waterRoute(makeRequest({ amount_ml: 350 }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.water_log_id).toBe("wlog-001");
    expect(body.data.amount_ml).toBe(350);
  });

  it("returns 500 on insert error", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(USER_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(
      makeServiceMock({ data: null, error: { message: "db error" } }) as never
    );
    const res = await waterRoute(makeRequest({ amount_ml: 200 }));
    expect(res.status).toBe(500);
  });
});

// ─── POST /api/goals/calories ─────────────────────────────────────────────────

describe("POST /api/goals/calories", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(null) as never);
    const res = await caloriesRoute(makeRequest({ daily_limit_kcal: 2000 }, "/api/goals/calories"));
    expect(res.status).toBe(401);
  });

  it("returns 400 for limit below 500", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(USER_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(makeServiceMock({ data: null, error: null }) as never);
    const res = await caloriesRoute(makeRequest({ daily_limit_kcal: 400 }, "/api/goals/calories"));
    expect(res.status).toBe(400);
  });

  it("returns 400 for limit above 10000", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(USER_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(makeServiceMock({ data: null, error: null }) as never);
    const res = await caloriesRoute(makeRequest({ daily_limit_kcal: 10001 }, "/api/goals/calories"));
    expect(res.status).toBe(400);
  });

  it("returns 200 with goal_id on success (upsert)", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(USER_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(
      makeServiceMock({ data: { id: "goal-001", daily_limit_kcal: 1800 }, error: null }) as never
    );
    const res = await caloriesRoute(makeRequest({ daily_limit_kcal: 1800 }, "/api/goals/calories"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.goal_id).toBe("goal-001");
    expect(body.data.daily_limit_kcal).toBe(1800);
  });

  it("returns 500 on upsert error", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(USER_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(
      makeServiceMock({ data: null, error: { message: "constraint error" } }) as never
    );
    const res = await caloriesRoute(makeRequest({ daily_limit_kcal: 2000 }, "/api/goals/calories"));
    expect(res.status).toBe(500);
  });
});

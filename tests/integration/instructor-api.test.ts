import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { createClient as createServerClient } from "@/lib/supabase/server";
import { GET as studentsRoute } from "@/app/api/instructor/students/route";
import { GET as summaryRoute } from "@/app/api/instructor/students/[id]/summary/route";

const INSTRUCTOR_A = "instructor-aaa";
const INSTRUCTOR_B = "instructor-bbb";
const STUDENT_A1 = "student-a01";
const STUDENT_A2 = "student-a02";
const STUDENT_B1 = "student-b01";

function makeAuthMock(userId: string | null, fromImpl?: (table: string) => unknown) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null } }),
    },
    from: vi.fn().mockImplementation(fromImpl ?? (() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
    }))),
  };
}

// Builds a chainable query mock that resolves with `result` at the terminal call
function chain(result: unknown) {
  const obj: Record<string, unknown> = {};
  const self = () => obj;
  ["select", "eq", "gte", "lte", "order", "limit"].forEach((m) => { obj[m] = vi.fn().mockReturnValue(obj); });
  obj["single"] = vi.fn().mockResolvedValue(result);
  obj[Symbol.iterator as unknown as string] = undefined;
  // make it also resolve as a promise (for non-.single() calls)
  obj["then"] = vi.fn().mockImplementation((cb: (v: unknown) => unknown) => Promise.resolve(result).then(cb));
  return obj;
}

beforeEach(() => vi.clearAllMocks());

// ─── GET /api/instructor/students ────────────────────────────────────────────

describe("GET /api/instructor/students", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(null) as never);
    const res = await studentsRoute();
    expect(res.status).toBe(401);
  });

  it("returns only active students for instructor A (not B's students)", async () => {
    const instructorAStudents = [
      { student_id: STUDENT_A1, status: "active", accepted_at: "2026-01-01", profiles: { id: STUDENT_A1, display_name: "Alice", avatar_url: null } },
      { student_id: STUDENT_A2, status: "active", accepted_at: "2026-01-02", profiles: { id: STUDENT_A2, display_name: "Ana", avatar_url: null } },
    ];

    const fromImpl = (table: string) => {
      if (table === "student_instructor") {
        const q: Record<string, unknown> = {};
        q["select"] = vi.fn().mockReturnValue(q);
        q["eq"] = vi.fn().mockReturnValue(q);
        // Resolves as a promise
        q["then"] = vi.fn().mockImplementation((cb: (v: unknown) => unknown) =>
          Promise.resolve({ data: instructorAStudents, error: null }).then(cb)
        );
        return q;
      }
      return chain({ data: null, error: null });
    };

    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(INSTRUCTOR_A, fromImpl) as never);

    const res = await studentsRoute();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.data.map((s: { student_id: string }) => s.student_id)).not.toContain(STUDENT_B1);
  });

  it("returns empty array when instructor has no active students", async () => {
    const fromImpl = (table: string) => {
      if (table === "student_instructor") {
        const q: Record<string, unknown> = {};
        q["select"] = vi.fn().mockReturnValue(q);
        q["eq"] = vi.fn().mockReturnValue(q);
        q["then"] = vi.fn().mockImplementation((cb: (v: unknown) => unknown) =>
          Promise.resolve({ data: [], error: null }).then(cb)
        );
        return q;
      }
      return chain({ data: null, error: null });
    };

    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(INSTRUCTOR_B, fromImpl) as never);

    const res = await studentsRoute();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(0);
  });
});

// ─── GET /api/instructor/students/[id]/summary ───────────────────────────────

describe("GET /api/instructor/students/[id]/summary", () => {
  const params = Promise.resolve({ id: STUDENT_A1 });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(null) as never);
    const res = await summaryRoute(new Request("http://localhost"), { params });
    expect(res.status).toBe(401);
  });

  it("returns 403 when instructor B tries to access instructor A student", async () => {
    // instructor B has no active relation with STUDENT_A1
    const fromImpl = (table: string) => {
      if (table === "student_instructor") {
        const q: Record<string, unknown> = {};
        ["select", "eq"].forEach((m) => { q[m] = vi.fn().mockReturnValue(q); });
        q["single"] = vi.fn().mockResolvedValue({ data: null }); // no relation found
        return q;
      }
      return chain({ data: null, error: null });
    };

    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(INSTRUCTOR_B, fromImpl) as never);
    const res = await summaryRoute(new Request("http://localhost"), { params });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe("forbidden");
  });

  it("returns summary with food/water totals for linked student", async () => {
    const fromImpl = (table: string) => {
      if (table === "student_instructor") {
        const q: Record<string, unknown> = {};
        ["select", "eq"].forEach((m) => { q[m] = vi.fn().mockReturnValue(q); });
        q["single"] = vi.fn().mockResolvedValue({ data: { id: "si-001" } }); // active relation
        return q;
      }
      if (table === "food_logs") {
        const q: Record<string, unknown> = {};
        ["select", "eq", "gte", "order"].forEach((m) => { q[m] = vi.fn().mockReturnValue(q); });
        q["then"] = vi.fn().mockImplementation((cb: (v: unknown) => unknown) =>
          Promise.resolve({ data: [
            { id: "f1", photo_url: "https://x.com/a.jpg", total_calories: 400, total_protein_g: 30, total_carbs_g: 40, total_fat_g: 10, analysis_json: { description: "Pollo", items: [], total_calories: 400, total_protein_g: 30, total_carbs_g: 40, total_fat_g: 10, confidence: "high" }, created_at: new Date().toISOString() },
          ], error: null }).then(cb)
        );
        return q;
      }
      if (table === "water_logs") {
        const q: Record<string, unknown> = {};
        ["select", "eq", "gte", "order"].forEach((m) => { q[m] = vi.fn().mockReturnValue(q); });
        q["then"] = vi.fn().mockImplementation((cb: (v: unknown) => unknown) =>
          Promise.resolve({ data: [{ id: "w1", amount_ml: 500, logged_at: new Date().toISOString() }], error: null }).then(cb)
        );
        return q;
      }
      if (table === "calorie_goals") {
        const q: Record<string, unknown> = {};
        ["select", "eq", "lte", "order", "limit"].forEach((m) => { q[m] = vi.fn().mockReturnValue(q); });
        q["single"] = vi.fn().mockResolvedValue({ data: { daily_limit_kcal: 2000 } });
        return q;
      }
      if (table === "profiles") {
        const q: Record<string, unknown> = {};
        ["select", "eq"].forEach((m) => { q[m] = vi.fn().mockReturnValue(q); });
        q["single"] = vi.fn().mockResolvedValue({ data: { id: STUDENT_A1, display_name: "Alice", avatar_url: null } });
        return q;
      }
      return chain({ data: null, error: null });
    };

    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(INSTRUCTOR_A, fromImpl) as never);

    const res = await summaryRoute(new Request("http://localhost"), { params });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.total_calories).toBe(400);
    expect(body.data.total_water_ml).toBe(500);
    expect(body.data.daily_limit_kcal).toBe(2000);
    expect(body.data.food_logs).toHaveLength(1);
    expect(body.data.profile?.display_name).toBe("Alice");
  });
});

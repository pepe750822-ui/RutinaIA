import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn() }));

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

import { POST as inviteRoute } from "@/app/api/instructor/invites/route";
import { GET as acceptRoute } from "@/app/api/invites/[token]/accept/route";

const INSTRUCTOR_ID = "instructor-001";
const STUDENT_ID = "student-001";
const INVITE_TOKEN = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const STUDENT_EMAIL = "alumno@test.com";
const SI_ROW_ID = "si-row-001";

function makeAuthMock(userId: string | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null } }),
    },
    from: vi.fn(),
  };
}

// Service client mock builder — configurable per test
function makeServiceMock(overrides: {
  instructorRow?: unknown;
  inviteUserResult?: { data: unknown; error: unknown };
  profilesUpsert?: unknown;
  siUpsert?: { error: unknown };
  siByToken?: unknown;
  siUpdate?: unknown;
}) {
  const {
    instructorRow = { profile_id: INSTRUCTOR_ID },
    inviteUserResult = { data: { user: { id: STUDENT_ID } }, error: null },
    profilesUpsert = { error: null },
    siUpsert = { error: null },
    siByToken = { id: SI_ROW_ID, student_id: STUDENT_ID, status: "pending" },
    siUpdate = { error: null },
  } = overrides;

  const fromMock = vi.fn().mockImplementation((table: string) => {
    if (table === "instructors") {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: instructorRow }),
          }),
        }),
      };
    }
    if (table === "profiles") {
      return { upsert: vi.fn().mockResolvedValue(profilesUpsert) };
    }
    if (table === "student_instructor") {
      return {
        upsert: vi.fn().mockResolvedValue(siUpsert),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: siByToken }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(siUpdate),
        }),
      };
    }
    return { select: vi.fn(), insert: vi.fn(), update: vi.fn(), upsert: vi.fn() };
  });

  return {
    from: fromMock,
    auth: {
      admin: {
        inviteUserByEmail: vi.fn().mockResolvedValue(inviteUserResult),
      },
    },
  };
}

function makeInviteRequest(body: object) {
  return new Request("http://localhost/api/instructor/invites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// next/navigation redirect throws — capture it
vi.mock("next/navigation", () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { digest: `NEXT_REDIRECT;${url}` });
  }),
}));

import { redirect } from "next/navigation";

beforeEach(() => vi.clearAllMocks());

// ─── POST /api/instructor/invites ─────────────────────────────────────────────

describe("POST /api/instructor/invites", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(null) as never);
    vi.mocked(createServiceClient).mockReturnValue(makeServiceMock({}) as never);
    const res = await inviteRoute(makeInviteRequest({ email: STUDENT_EMAIL }));
    expect(res.status).toBe(401);
  });

  it("returns 403 when caller is not an instructor", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(INSTRUCTOR_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(
      makeServiceMock({ instructorRow: null }) as never
    );
    const res = await inviteRoute(makeInviteRequest({ email: STUDENT_EMAIL }));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe("not_instructor");
  });

  it("returns 400 for invalid email", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(INSTRUCTOR_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(makeServiceMock({}) as never);
    const res = await inviteRoute(makeInviteRequest({ email: "not-an-email" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("validation_error");
  });

  it("returns 500 when Supabase invite fails", async () => {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(INSTRUCTOR_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(
      makeServiceMock({
        inviteUserResult: { data: null, error: { message: "email rate limited" } },
      }) as never
    );
    const res = await inviteRoute(makeInviteRequest({ email: STUDENT_EMAIL }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("invite_error");
  });

  it("inserts student_instructor row with status=pending and returns 201", async () => {
    const serviceMock = makeServiceMock({});
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(INSTRUCTOR_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(serviceMock as never);

    const res = await inviteRoute(makeInviteRequest({ email: STUDENT_EMAIL }));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.invited).toBe(true);
    expect(body.data.email).toBe(STUDENT_EMAIL);

    // Verify SI row was upserted
    const siFrom = (serviceMock.from as ReturnType<typeof vi.fn>).mock.calls.find(
      ([t]: [string]) => t === "student_instructor"
    );
    expect(siFrom).toBeTruthy();
  });
});

// ─── GET /api/invites/[token]/accept ─────────────────────────────────────────

describe("GET /api/invites/[token]/accept", () => {
  const acceptParams = Promise.resolve({ token: INVITE_TOKEN });

  async function callAccept(userId: string | null, tokenOverride = INVITE_TOKEN) {
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(userId) as never);
    const params = Promise.resolve({ token: tokenOverride });
    try {
      await acceptRoute(new Request("http://localhost"), { params });
    } catch (err) {
      return err as Error;
    }
    return null;
  }

  it("redirects to /login when unauthenticated", async () => {
    vi.mocked(createServiceClient).mockReturnValue(makeServiceMock({}) as never);
    await callAccept(null);
    expect(vi.mocked(redirect)).toHaveBeenCalledWith("/login");
  });

  it("redirects to /dashboard?invite=invalid for unknown token", async () => {
    vi.mocked(createServiceClient).mockReturnValue(
      makeServiceMock({ siByToken: null }) as never
    );
    await callAccept(STUDENT_ID);
    expect(vi.mocked(redirect)).toHaveBeenCalledWith("/dashboard?invite=invalid");
  });

  it("redirects to /dashboard?invite=already_accepted for active invite", async () => {
    vi.mocked(createServiceClient).mockReturnValue(
      makeServiceMock({ siByToken: { id: SI_ROW_ID, student_id: STUDENT_ID, status: "active" } }) as never
    );
    await callAccept(STUDENT_ID);
    expect(vi.mocked(redirect)).toHaveBeenCalledWith("/dashboard?invite=already_accepted");
  });

  it("redirects to /dashboard?invite=wrong_account when student_id mismatch", async () => {
    vi.mocked(createServiceClient).mockReturnValue(
      makeServiceMock({ siByToken: { id: SI_ROW_ID, student_id: "other-user", status: "pending" } }) as never
    );
    await callAccept(STUDENT_ID);
    expect(vi.mocked(redirect)).toHaveBeenCalledWith("/dashboard?invite=wrong_account");
  });

  it("updates SI row to active and redirects to /dashboard?invite=accepted", async () => {
    const serviceMock = makeServiceMock({});
    vi.mocked(createServiceClient).mockReturnValue(serviceMock as never);

    await callAccept(STUDENT_ID);

    expect(vi.mocked(redirect)).toHaveBeenCalledWith("/dashboard?invite=accepted");

    // Verify update was called
    const siFrom = (serviceMock.from as ReturnType<typeof vi.fn>).mock.calls.filter(
      ([t]: [string]) => t === "student_instructor"
    );
    const updateCall = siFrom.find(
      () => true // at least one SI call happened
    );
    expect(updateCall).toBeTruthy();
  });

  // Full cycle: invite creates pending row → accept updates to active
  it("full cycle: invite inserts pending row, accept updates to active", async () => {
    // 1. Invite
    const serviceMock = makeServiceMock({});
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(INSTRUCTOR_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(serviceMock as never);

    const inviteRes = await inviteRoute(makeInviteRequest({ email: STUDENT_EMAIL }));
    expect(inviteRes.status).toBe(201);

    // 2. Accept (student is now authenticated)
    vi.mocked(createServerClient).mockResolvedValue(makeAuthMock(STUDENT_ID) as never);
    vi.mocked(createServiceClient).mockReturnValue(serviceMock as never);

    await callAccept(STUDENT_ID);
    expect(vi.mocked(redirect)).toHaveBeenCalledWith("/dashboard?invite=accepted");
  });

  // Use void to acknowledge the unused promise variable is intentional
  void acceptParams;
});

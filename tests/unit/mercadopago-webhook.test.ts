import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/mercadopago/sync-subscription", () => ({
  syncSubscription: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/mercadopago/client", () => ({
  mpClient: {},
}));

import { createClient } from "@supabase/supabase-js";
import { syncSubscription } from "@/lib/mercadopago/sync-subscription";
import { POST } from "@/app/api/webhooks/mercadopago/route";

const WEBHOOK_SECRET = "a".repeat(32); // matches vitest.config.ts env
const REQUEST_ID = "req-001";
const SUB_ID = "sub-mp-123";

function makeSignature(dataId: string, requestId: string, ts: string): string {
  const message = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const v1 = crypto.createHmac("sha256", WEBHOOK_SECRET).update(message).digest("hex");
  return `ts=${ts},v1=${v1}`;
}

function makeRequest(
  body: object,
  dataId: string,
  options: { requestId?: string; omitSig?: boolean; badSig?: boolean } = {}
) {
  const { requestId = REQUEST_ID, omitSig = false, badSig = false } = options;
  const ts = "1700000000";
  const sig = badSig ? "ts=1,v1=badhex00" : makeSignature(dataId, requestId, ts);
  const url = `http://localhost/api/webhooks/mercadopago?data.id=${dataId}`;

  return new Request(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-request-id": requestId,
      ...(omitSig ? {} : { "x-signature": sig }),
    },
    body: JSON.stringify(body),
  });
}

const mockInsert = vi.fn();

beforeEach(() => {
  vi.mocked(createClient).mockReturnValue({
    from: vi.fn().mockReturnValue({ insert: mockInsert }),
  } as ReturnType<typeof createClient>);
  mockInsert.mockReset();
  vi.mocked(syncSubscription).mockReset();
  vi.mocked(syncSubscription).mockResolvedValue(undefined);
});

describe("POST /api/webhooks/mercadopago", () => {
  it("returns 400 when x-signature header is missing", async () => {
    const res = await POST(
      makeRequest({ type: "subscription_preapproval" }, SUB_ID, { omitSig: true })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("missing_signature");
  });

  it("returns 400 when signature is invalid", async () => {
    const res = await POST(
      makeRequest({ type: "subscription_preapproval" }, SUB_ID, { badSig: true })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("invalid_signature");
  });

  it("processes subscription_preapproval authorized and returns 200", async () => {
    mockInsert.mockResolvedValue({ error: null });

    const res = await POST(
      makeRequest(
        { type: "subscription_preapproval", action: "authorized", data: { id: SUB_ID } },
        SUB_ID
      )
    );

    expect(res.status).toBe(200);
    expect(vi.mocked(syncSubscription)).toHaveBeenCalledWith(SUB_ID, "authorized");
  });

  it("processes subscription_preapproval cancelled and returns 200", async () => {
    mockInsert.mockResolvedValue({ error: null });

    const res = await POST(
      makeRequest(
        { type: "subscription_preapproval", action: "cancelled", data: { id: SUB_ID } },
        SUB_ID
      )
    );

    expect(res.status).toBe(200);
    expect(vi.mocked(syncSubscription)).toHaveBeenCalledWith(SUB_ID, "cancelled");
  });

  it("returns 200 without calling syncSubscription on duplicate notification", async () => {
    // Simulate UNIQUE constraint violation (already processed)
    mockInsert.mockResolvedValue({ error: { code: "23505", message: "unique violation" } });

    const res = await POST(
      makeRequest(
        { type: "subscription_preapproval", action: "authorized", data: { id: SUB_ID } },
        SUB_ID
      )
    );

    expect(res.status).toBe(200);
    expect(vi.mocked(syncSubscription)).not.toHaveBeenCalled();
  });

  it("returns 200 for non-subscription event types without calling syncSubscription", async () => {
    mockInsert.mockResolvedValue({ error: null });

    const res = await POST(
      makeRequest({ type: "payment", action: "payment.created", data: { id: "pay-001" } }, "pay-001")
    );

    expect(res.status).toBe(200);
    expect(vi.mocked(syncSubscription)).not.toHaveBeenCalled();
    const body = await res.json();
    expect(body.data.received).toBe(true);
  });

  it("processes subscription_preapproval paused (past_due) and returns 200", async () => {
    mockInsert.mockResolvedValue({ error: null });

    const res = await POST(
      makeRequest(
        { type: "subscription_preapproval", action: "paused", data: { id: SUB_ID } },
        SUB_ID
      )
    );

    expect(res.status).toBe(200);
    expect(vi.mocked(syncSubscription)).toHaveBeenCalledWith(SUB_ID, "paused");
  });
});

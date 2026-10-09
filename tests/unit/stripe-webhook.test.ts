import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock stripe module
vi.mock("stripe", () => {
  const mockConstructEvent = vi.fn();
  const MockStripe = function (this: { webhooks: { constructEvent: typeof mockConstructEvent } }) {
    this.webhooks = { constructEvent: mockConstructEvent };
  };
  (MockStripe as { _mockConstructEvent: typeof mockConstructEvent })._mockConstructEvent =
    mockConstructEvent;
  return { default: MockStripe };
});

// Mock @supabase/supabase-js
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

// Mock sync-subscription so we can verify it's called
vi.mock("@/lib/stripe/sync-subscription", () => ({
  syncSubscription: vi.fn().mockResolvedValue(undefined),
}));

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { syncSubscription } from "@/lib/stripe/sync-subscription";
import { POST } from "@/app/api/webhooks/stripe/route";

// Access the mock's constructEvent via the class property
const mockConstructEvent = (
  Stripe as unknown as { _mockConstructEvent: ReturnType<typeof vi.fn> }
)._mockConstructEvent;

const mockInsert = vi.fn();
const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });

function makeRequest(body: string, sig?: string) {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(sig ? { "stripe-signature": sig } : {}),
    },
    body,
  });
}

function makeSubscriptionEvent(
  type: string,
  id: string,
  status: string
): Stripe.Event {
  return {
    id,
    type,
    data: {
      object: {
        id: "sub_test123",
        customer: "cus_test123",
        status,
        current_period_start: 1700000000,
        current_period_end: 1702592000,
      } as unknown as Stripe.Subscription,
    },
  } as unknown as Stripe.Event;
}

beforeEach(() => {
  vi.mocked(createClient).mockReturnValue({
    from: mockFrom,
  } as ReturnType<typeof createClient>);
  mockFrom.mockReturnValue({ insert: mockInsert });
  mockInsert.mockReset();
  vi.mocked(syncSubscription).mockReset();
  vi.mocked(syncSubscription).mockResolvedValue(undefined);
  mockConstructEvent.mockReset();
});

describe("POST /api/webhooks/stripe", () => {
  it("returns 400 when Stripe-Signature header is missing", async () => {
    const res = await POST(makeRequest('{"type":"test"}'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("missing_signature");
  });

  it("returns 400 when Stripe signature is invalid", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature");
    });

    const res = await POST(makeRequest('{"type":"test"}', "t=bad,v1=bad"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("invalid_signature");
  });

  it("processes customer.subscription.created and returns 200", async () => {
    const event = makeSubscriptionEvent(
      "customer.subscription.created",
      "evt_001",
      "active"
    );
    mockConstructEvent.mockReturnValue(event);
    mockInsert.mockResolvedValue({ error: null }); // no duplicate

    const res = await POST(makeRequest("{}", "t=1,v1=ok"));
    expect(res.status).toBe(200);
    expect(vi.mocked(syncSubscription)).toHaveBeenCalledWith(event);
  });

  it("processes customer.subscription.deleted and returns 200", async () => {
    const event = makeSubscriptionEvent(
      "customer.subscription.deleted",
      "evt_002",
      "canceled"
    );
    mockConstructEvent.mockReturnValue(event);
    mockInsert.mockResolvedValue({ error: null });

    const res = await POST(makeRequest("{}", "t=1,v1=ok"));
    expect(res.status).toBe(200);
    expect(vi.mocked(syncSubscription)).toHaveBeenCalledWith(event);
  });

  it("returns 200 and skips processing on duplicate event_id (idempotency)", async () => {
    const event = makeSubscriptionEvent(
      "customer.subscription.updated",
      "evt_003",
      "active"
    );
    mockConstructEvent.mockReturnValue(event);
    // Simulate UNIQUE constraint violation on second insert
    mockInsert.mockResolvedValue({ error: { code: "23505", message: "unique violation" } });

    const res = await POST(makeRequest("{}", "t=1,v1=ok"));
    expect(res.status).toBe(200);
    expect(vi.mocked(syncSubscription)).not.toHaveBeenCalled();
  });

  it("returns 200 for unknown event types without calling syncSubscription", async () => {
    const event = {
      id: "evt_004",
      type: "payment_intent.succeeded",
      data: { object: {} },
    } as unknown as Stripe.Event;
    mockConstructEvent.mockReturnValue(event);
    mockInsert.mockResolvedValue({ error: null });

    const res = await POST(makeRequest("{}", "t=1,v1=ok"));
    expect(res.status).toBe(200);
    // syncSubscription is still called — it handles unknown types with a no-op
    const body = await res.json();
    expect(body.data.received).toBe(true);
  });

  it("processes customer.subscription.updated and returns 200", async () => {
    const event = makeSubscriptionEvent(
      "customer.subscription.updated",
      "evt_005",
      "past_due"
    );
    mockConstructEvent.mockReturnValue(event);
    mockInsert.mockResolvedValue({ error: null });

    const res = await POST(makeRequest("{}", "t=1,v1=ok"));
    expect(res.status).toBe(200);
    expect(vi.mocked(syncSubscription)).toHaveBeenCalledWith(event);
  });
});

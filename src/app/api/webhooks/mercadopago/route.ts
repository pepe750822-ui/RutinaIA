import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { syncSubscription } from "@/lib/mercadopago/sync-subscription";
import type { Database } from "@/types/supabase";

function verifySignature(
  rawBody: string,
  xSignature: string,
  xRequestId: string,
  dataId: string
): boolean {
  // MP signature format: ts=<timestamp>,v1=<hmac>
  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => p.split("=") as [string, string])
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];

  if (!ts || !v1) return false;

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET!;
  const message = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expectedBuf = crypto.createHmac("sha256", secret).update(message).digest();
  let receivedBuf: Buffer;
  try {
    receivedBuf = Buffer.from(v1, "hex");
  } catch {
    return false;
  }

  if (receivedBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(receivedBuf, expectedBuf);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id") ?? "";
  const xSignature = request.headers.get("x-signature") ?? "";
  const xRequestId = request.headers.get("x-request-id") ?? "";

  const rawBody = await request.text();

  if (!xSignature) {
    return Response.json(
      { error: { code: "missing_signature", message: "x-signature header required" } },
      { status: 400 }
    );
  }

  if (!verifySignature(rawBody, xSignature, xRequestId, dataId)) {
    return Response.json(
      { error: { code: "invalid_signature", message: "Invalid Mercado Pago signature" } },
      { status: 400 }
    );
  }

  let notification: { type?: string; action?: string; data?: { id?: string } };
  try {
    notification = JSON.parse(rawBody);
  } catch {
    return Response.json(
      { error: { code: "invalid_body", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const { type, action, data } = notification;
  const subscriptionId = data?.id ?? dataId;

  // Only process subscription events
  if (type !== "subscription_preapproval") {
    return Response.json({ data: { received: true } });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Idempotency — deduplicate by event (request-id + subscription id)
  const eventId = `mp_${xRequestId}_${subscriptionId}`;
  const { error: dedupError } = await supabase
    .from("webhook_events")
    .insert({ source: "mercadopago", event_id: eventId });

  if (dedupError) {
    return Response.json({ data: { received: true } });
  }

  await syncSubscription(subscriptionId, action ?? "");

  return Response.json({ data: { received: true } });
}

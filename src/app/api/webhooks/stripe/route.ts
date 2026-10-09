import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe/client";
import { syncSubscription } from "@/lib/stripe/sync-subscription";
import type { Database } from "@/types/supabase";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return Response.json(
      { error: { code: "missing_signature", message: "Stripe-Signature header required" } },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return Response.json(
      { error: { code: "invalid_signature", message: "Invalid Stripe signature" } },
      { status: 400 }
    );
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Idempotency — reject duplicate event IDs
  const { error: dedupError } = await supabase
    .from("webhook_events")
    .insert({ source: "stripe", event_id: event.id });

  if (dedupError) {
    // UNIQUE constraint violation = already processed
    return Response.json({ data: { received: true } });
  }

  await syncSubscription(event);

  return Response.json({ data: { received: true } });
}

import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import type { Database } from "@/types/supabase";

type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "unpaid";
type InstructorStatus = "inactive" | "active" | "trialing" | "past_due" | "canceled";

function toInstructorStatus(stripeStatus: string): InstructorStatus {
  const map: Record<string, InstructorStatus> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "past_due",
  };
  return map[stripeStatus] ?? "inactive";
}

function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function syncSubscription(event: Stripe.Event): Promise<void> {
  const supabase = getServiceClient();

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const customerId =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;

    const { data: instructor } = await supabase
      .from("instructors")
      .select("profile_id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (!instructor) return;

    // Stripe v23 (API 2026-09-30.endive) moved billing periods to subscription items;
    // fall back to anchor/item data if top-level fields are absent.
    const subAny = sub as unknown as Record<string, number>;
    const periodStart = subAny["current_period_start"] ?? sub.billing_cycle_anchor ?? 0;
    const periodEnd =
      subAny["current_period_end"] ??
      (sub.items?.data[0] as unknown as Record<string, number>)?.[
        "current_period_end"
      ] ??
      0;

    await supabase.from("subscriptions").upsert(
      {
        instructor_id: instructor.profile_id,
        stripe_subscription_id: sub.id,
        stripe_customer_id: customerId,
        status: sub.status as SubscriptionStatus,
        current_period_start: new Date(periodStart * 1000).toISOString(),
        current_period_end: new Date(periodEnd * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "instructor_id" }
    );

    await supabase
      .from("instructors")
      .update({
        subscription_status: toInstructorStatus(sub.status),
        updated_at: new Date().toISOString(),
      })
      .eq("profile_id", instructor.profile_id);
  } else if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;

    const { data: instructor } = await supabase
      .from("instructors")
      .select("profile_id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (!instructor) return;

    await supabase
      .from("subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("instructor_id", instructor.profile_id);

    await supabase
      .from("instructors")
      .update({ subscription_status: "canceled", updated_at: new Date().toISOString() })
      .eq("profile_id", instructor.profile_id);
  }
}

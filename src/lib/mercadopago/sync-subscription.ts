import { createClient } from "@supabase/supabase-js";
import { PreApproval } from "mercadopago";
import { mpClient } from "./client";
import type { Database } from "@/types/supabase";

type InstructorStatus = "inactive" | "active" | "trialing" | "past_due" | "canceled" | "premium";

function toInstructorStatus(mpStatus: string | undefined): InstructorStatus {
  switch (mpStatus) {
    case "authorized":
      return "premium";
    case "paused":
    case "pending":
      return "past_due";
    case "cancelled":
      return "canceled";
    default:
      return "inactive";
  }
}

function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function syncSubscription(
  subscriptionId: string,
  action: string
): Promise<void> {
  const supabase = getServiceClient();

  // Fetch full subscription details from MP
  const preApproval = new PreApproval(mpClient);
  const sub = await preApproval.get({ id: subscriptionId });

  const externalRef = sub.external_reference ?? "";
  // external_reference stores the instructor profile_id set during checkout
  const instructorId = externalRef;

  if (!instructorId) {
    // Look up instructor by MP payer email or customer_id
    return;
  }

  const status = sub.status ?? "pending";
  const instructorStatus = toInstructorStatus(status);

  if (action === "cancelled" || status === "cancelled") {
    await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("instructor_id", instructorId);

    await supabase
      .from("instructors")
      .update({ subscription_status: "canceled", updated_at: new Date().toISOString() })
      .eq("profile_id", instructorId);

    return;
  }

  await supabase.from("subscriptions").upsert(
    {
      instructor_id: instructorId,
      stripe_subscription_id: sub.id?.toString() ?? subscriptionId,
      stripe_customer_id: sub.payer_id?.toString() ?? "",
      status: instructorStatus === "premium" ? "active" : "past_due",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "instructor_id" }
  );

  await supabase
    .from("instructors")
    .update({
      subscription_status: instructorStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("profile_id", instructorId);
}

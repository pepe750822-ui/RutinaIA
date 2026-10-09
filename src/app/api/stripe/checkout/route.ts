import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: { code: "unauthorized", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const service = createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get or create Stripe customer
  const { data: instructor } = await service
    .from("instructors")
    .select("profile_id, stripe_customer_id")
    .eq("profile_id", user.id)
    .single();

  if (!instructor) {
    return Response.json(
      { error: { code: "not_instructor", message: "Only instructors can subscribe" } },
      { status: 403 }
    );
  }

  let customerId = instructor.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email });
    customerId = customer.id;
    await service
      .from("instructors")
      .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
      .eq("profile_id", user.id);
  }

  const { origin } = new URL(request.url);
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${origin}/instructor?upgrade=success`,
    cancel_url: `${origin}/instructor?upgrade=canceled`,
  });

  return Response.json({ data: { url: session.url } });
}

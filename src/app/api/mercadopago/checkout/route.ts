import { createClient } from "@/lib/supabase/server";
import { PreApproval } from "mercadopago";
import { mpClient } from "@/lib/mercadopago/client";
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

  const { data: instructor } = await service
    .from("instructors")
    .select("profile_id")
    .eq("profile_id", user.id)
    .single();

  if (!instructor) {
    return Response.json(
      { error: { code: "not_instructor", message: "Solo instructores pueden suscribirse" } },
      { status: 403 }
    );
  }

  const { origin } = new URL(request.url);

  // Create a PreApproval (subscription) directly linked to the plan
  const preApproval = new PreApproval(mpClient);
  const sub = await preApproval.create({
    body: {
      preapproval_plan_id: process.env.MP_PLAN_ID!,
      payer_email: user.email!,
      external_reference: user.id, // used in webhook to identify instructor
      back_url: `${origin}/instructor?upgrade=success`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 110,
        currency_id: "MXN",
      },
      status: "pending",
    },
  });

  return Response.json({ data: { url: sub.init_point } });
}

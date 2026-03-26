import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isServiceRoleConfigured, isStripeConfigured, isSupabaseConfigured, publicEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  if (!isStripeConfigured() || !isServiceRoleConfigured() || !isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Stripe billing portal is not configured." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Login required." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const { data: subscription } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ ok: false, error: "No Stripe customer found for this user." }, { status: 400 });
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${publicEnv.siteUrl}/dashboard`
  });

  return NextResponse.json({ ok: true, url: session.url });
}

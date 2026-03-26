import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isServiceRoleConfigured, isStripeConfigured } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured() || !isServiceRoleConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: "Stripe webhook is not configured." }, { status: 400 });
  }

  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ ok: false, error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Invalid webhook signature." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const plan = session.metadata?.plan;

    if (userId && plan) {
      await supabase
        .from("subscriptions")
        .update({
          plan,
          status: "active",
          stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
          renewal_date: new Date().toISOString().slice(0, 10)
        })
        .eq("user_id", userId);
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId =
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    const currentPeriodEnd = (subscription as Stripe.Subscription & { current_period_end?: number })
      .current_period_end;

    const status = event.type === "customer.subscription.deleted" ? "cancelled" : subscription.status;
    const renewalDate = currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    await supabase
      .from("subscriptions")
      .update({
        status: status === "active" ? "active" : status === "canceled" ? "cancelled" : "inactive",
        renewal_date: renewalDate,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId
      })
      .eq("stripe_customer_id", customerId);
  }

  return NextResponse.json({ received: true });
}

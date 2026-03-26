import { NextResponse } from "next/server";

import { getPriceId, getStripe } from "@/lib/stripe";
import { isStripeConfigured, isSupabaseConfigured, publicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isStripeConfigured() || !isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Stripe is not configured." }, { status: 400 });
  }

  const body = await request.json();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Login required." }, { status: 401 });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: getPriceId(body.plan),
        quantity: 1
      }
    ],
    success_url: `${publicEnv.siteUrl}/dashboard?checkout=success`,
    cancel_url: `${publicEnv.siteUrl}/dashboard?checkout=cancelled`,
    customer_email: user.email,
    metadata: {
      user_id: user.id,
      plan: body.plan
    }
  });

  return NextResponse.json({ ok: true, url: session.url });
}

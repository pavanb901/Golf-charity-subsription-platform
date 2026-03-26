import Stripe from "stripe";

import { isStripeConfigured } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not fully configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  return stripeClient;
}

export function getPriceId(plan: "monthly" | "yearly") {
  return plan === "monthly"
    ? process.env.STRIPE_PRICE_MONTHLY_ID!
    : process.env.STRIPE_PRICE_YEARLY_ID!;
}

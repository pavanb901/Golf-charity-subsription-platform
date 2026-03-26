import { NextResponse } from "next/server";

import {
  addIndependentDonationForUser,
  addScoreForUser,
  createSimulation,
  getPlatformSnapshot,
  markPayoutPaid,
  publishLatestSimulation,
  updateCharitySettings,
  updateSubscriptionForUser,
  verifyWinner
} from "@/lib/platform-store";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DrawLogic, SubscriptionPlan, SubscriptionStatus } from "@/lib/types";

async function getAuthenticatedUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

async function requireAdmin(userId: string) {
  const snapshot = await getPlatformSnapshot(userId);
  return snapshot.users.find((item) => item.id === userId)?.role === "admin";
}

export async function GET() {
  const user = await getAuthenticatedUser();
  const snapshot = await getPlatformSnapshot(user?.id ?? null);
  return NextResponse.json(snapshot);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await getAuthenticatedUser();

  if (isSupabaseConfigured() && !user) {
    return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
  }

  const adminActions = new Set(["run-draw", "publish-draw", "verify-winner", "mark-payout-paid"]);
  if (user && adminActions.has(body.action)) {
    const isAdmin = await requireAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }
  }

  switch (body.action) {
    case "add-score":
      await addScoreForUser(user!.id, body.entry);
      break;
    case "update-charity":
      await updateCharitySettings(user!.id, body.charityId, body.charityPercentage);
      break;
    case "add-donation":
      await addIndependentDonationForUser(user!.id, body.amount);
      break;
    case "update-subscription":
      await updateSubscriptionForUser(
        user!.id,
        body.plan as SubscriptionPlan,
        body.status as SubscriptionStatus
      );
      break;
    case "run-draw":
      await createSimulation(body.logic as DrawLogic);
      break;
    case "publish-draw":
      await publishLatestSimulation();
      break;
    case "verify-winner":
      await verifyWinner(body.userId, body.approved);
      break;
    case "mark-payout-paid":
      await markPayoutPaid(body.userId);
      break;
    default:
      return NextResponse.json({ ok: false, error: "Unsupported action." }, { status: 400 });
  }

  const snapshot = await getPlatformSnapshot(user?.id ?? null);
  return NextResponse.json({ ok: true, snapshot });
}

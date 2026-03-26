import { formatISO } from "date-fns";

import { MONTHLY_PRICE, YEARLY_PRICE, addRollingScore, prizeBreakdown, simulateDraw } from "@/lib/domain";
import { initialSnapshot } from "@/lib/demo-data";
import { adminEmails, isServiceRoleConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  DrawLogic,
  PlatformSnapshot,
  ScoreEntry,
  SubscriberProfile,
  SubscriptionPlan,
  SubscriptionStatus
} from "@/lib/types";

function defaultSubscription(plan: SubscriptionPlan = "monthly") {
  return {
    plan,
    status: "inactive" as SubscriptionStatus,
    renewalDate: formatISO(new Date(), { representation: "date" }),
    amount: plan === "monthly" ? MONTHLY_PRICE : YEARLY_PRICE,
    charityPercentage: 10
  };
}

export async function getPlatformSnapshot(currentUserId: string | null): Promise<PlatformSnapshot> {
  if (!isServiceRoleConfigured()) {
    return {
      ...initialSnapshot,
      currentUserId
    };
  }

  const supabase = createSupabaseAdminClient();

  const [{ data: charities }, { data: profiles }, { data: subscriptions }, { data: scores }, { data: draws }] =
    await Promise.all([
      supabase.from("charities").select("*").order("featured", { ascending: false }).order("name"),
      supabase.from("profiles").select("*").order("created_at"),
      supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("golf_scores").select("*").order("played_on", { ascending: false }),
      supabase.from("draws").select("*").order("draw_month", { ascending: false })
    ]);

  const subscriptionMap = new Map<string, any>();
  subscriptions?.forEach((subscription) => {
    if (!subscriptionMap.has(subscription.user_id)) {
      subscriptionMap.set(subscription.user_id, subscription);
    }
  });

  const scoreMap = new Map<string, ScoreEntry[]>();
  scores?.forEach((score) => {
    const existing = scoreMap.get(score.user_id) ?? [];
    existing.push({
      id: score.id,
      value: score.stableford_score,
      date: score.played_on
    });
    scoreMap.set(score.user_id, existing);
  });

  const users: SubscriberProfile[] =
    profiles?.map((profile) => {
      const subscription = subscriptionMap.get(profile.id);
      return {
        id: profile.id,
        role: profile.role,
        name: profile.name,
        email: profile.email,
        password: "",
        avatar: profile.avatar_url ?? initialSnapshot.users[0]?.avatar ?? "",
        joinedAt: profile.created_at?.slice(0, 10) ?? formatISO(new Date(), { representation: "date" }),
        charityId: profile.charity_id ?? charities?.[0]?.id ?? "",
        independentDonations: Number(profile.independent_donations ?? 0),
        subscription: subscription
          ? {
              plan: subscription.plan,
              status: subscription.status,
              renewalDate: subscription.renewal_date,
              amount: Number(subscription.amount),
              charityPercentage: subscription.charity_percentage
            }
          : defaultSubscription(),
        scores: scoreMap.get(profile.id) ?? [],
        drawsEntered: profile.draws_entered ?? 0,
        upcomingDraws: profile.upcoming_draws ?? 0,
        totalWon: Number(profile.total_won ?? 0),
        proofStatus: profile.proof_status ?? "not_submitted",
        paymentStatus: profile.payment_status ?? "pending",
        verificationNotes: profile.verification_notes ?? undefined
      };
    }) ?? [];

  return {
    charities:
      charities?.map((charity) => ({
        id: charity.id,
        name: charity.name,
        slug: charity.slug,
        description: charity.description,
        category: charity.category,
        location: charity.location,
        image: charity.image_url,
        featured: charity.featured,
        events: [],
        totalRaised: Number(charity.total_raised ?? 0)
      })) ?? [],
    users,
    draws:
      draws?.map((draw) => ({
        id: draw.id,
        month: draw.draw_month,
        logic: draw.logic,
        numbers: draw.numbers,
        status: draw.status,
        totalPool: Number(draw.total_pool ?? 0),
        rolloverPool: Number(draw.rollover_pool ?? 0),
        winners3: [],
        winners4: [],
        winners5: [],
        notes: draw.notes ?? ""
      })) ?? [],
    currentUserId
  };
}

export async function bootstrapProfile(input: {
  id: string;
  name: string;
  email: string;
  charityId: string;
  plan: SubscriptionPlan;
}) {
  if (!isServiceRoleConfigured()) return;

  const supabase = createSupabaseAdminClient();
  const role = adminEmails().includes(input.email.toLowerCase()) ? "admin" : "subscriber";
  const amount = input.plan === "monthly" ? MONTHLY_PRICE : YEARLY_PRICE;

  await supabase.from("profiles").upsert({
    id: input.id,
    role,
    name: input.name,
    email: input.email,
    charity_id: input.charityId,
    draws_entered: 0,
    upcoming_draws: 1,
    independent_donations: 0
  });

  await supabase.from("subscriptions").upsert(
    {
      user_id: input.id,
      plan: input.plan,
      status: "inactive",
      renewal_date: formatISO(new Date(), { representation: "date" }),
      amount,
      charity_percentage: 10
    },
    { onConflict: "user_id" }
  );
}

export async function addScoreForUser(userId: string, entry: ScoreEntry) {
  if (!isServiceRoleConfigured()) return;

  const supabase = createSupabaseAdminClient();

  const { data: existing } = await supabase
    .from("golf_scores")
    .select("*")
    .eq("user_id", userId)
    .order("played_on", { ascending: false });

  const nextScores = addRollingScore(
    (existing ?? []).map((score) => ({
      id: score.id,
      value: score.stableford_score,
      date: score.played_on
    })),
    entry
  );

  await supabase.from("golf_scores").delete().eq("user_id", userId);
  await supabase.from("golf_scores").insert(
    nextScores.map((score) => ({
      id: score.id,
      user_id: userId,
      stableford_score: score.value,
      played_on: score.date
    }))
  );
}

export async function updateCharitySettings(userId: string, charityId: string, charityPercentage: number) {
  if (!isServiceRoleConfigured()) return;
  const supabase = createSupabaseAdminClient();
  await supabase.from("profiles").update({ charity_id: charityId }).eq("id", userId);
  await supabase
    .from("subscriptions")
    .update({ charity_percentage: charityPercentage })
    .eq("user_id", userId);
}

export async function addIndependentDonationForUser(userId: string, amount: number) {
  if (!isServiceRoleConfigured()) return;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("independent_donations")
    .eq("id", userId)
    .single();
  await supabase
    .from("profiles")
    .update({ independent_donations: Number(data?.independent_donations ?? 0) + amount })
    .eq("id", userId);
}

export async function updateSubscriptionForUser(
  userId: string,
  plan: SubscriptionPlan,
  status: SubscriptionStatus
) {
  if (!isServiceRoleConfigured()) return;
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("subscriptions")
    .update({
      plan,
      status,
      amount: plan === "monthly" ? MONTHLY_PRICE : YEARLY_PRICE
    })
    .eq("user_id", userId);
}

export async function createSimulation(logic: DrawLogic) {
  if (!isServiceRoleConfigured()) return;

  const snapshot = await getPlatformSnapshot(null);
  const simulation = simulateDraw(snapshot.users.filter((user) => user.role === "subscriber"), logic);
  const breakdown = prizeBreakdown(simulation);
  const supabase = createSupabaseAdminClient();

  await supabase.from("draws").delete().eq("status", "simulation");
  const { data: inserted } = await supabase
    .from("draws")
    .insert({
      draw_month: simulation.month,
      logic: simulation.logic,
      numbers: simulation.numbers,
      status: "simulation",
      total_pool: simulation.totalPool,
      rollover_pool: simulation.rolloverPool,
      notes: simulation.notes
    })
    .select("*")
    .single();

  if (!inserted) return;

  const winnerRows = [
    ...simulation.winners3.map((userId) => ({
      draw_id: inserted.id,
      user_id: userId,
      match_count: 3,
      payout_amount: breakdown.tier3Each
    })),
    ...simulation.winners4.map((userId) => ({
      draw_id: inserted.id,
      user_id: userId,
      match_count: 4,
      payout_amount: breakdown.tier4Each
    })),
    ...simulation.winners5.map((userId) => ({
      draw_id: inserted.id,
      user_id: userId,
      match_count: 5,
      payout_amount: breakdown.tier5Each
    }))
  ];

  if (winnerRows.length) {
    await supabase.from("draw_winners").insert(winnerRows);
  }
}

export async function publishLatestSimulation() {
  if (!isServiceRoleConfigured()) return;
  const supabase = createSupabaseAdminClient();
  await supabase.from("draws").update({ status: "published" }).eq("status", "simulation");
}

export async function verifyWinner(userId: string, approved: boolean) {
  if (!isServiceRoleConfigured()) return;
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("profiles")
    .update({
      proof_status: approved ? "approved" : "rejected",
      verification_notes: approved ? "Proof approved by admin." : "Proof rejected. Request a clearer score screenshot."
    })
    .eq("id", userId);
}

export async function markPayoutPaid(userId: string) {
  if (!isServiceRoleConfigured()) return;
  const supabase = createSupabaseAdminClient();
  await supabase.from("profiles").update({ payment_status: "paid" }).eq("id", userId);
}

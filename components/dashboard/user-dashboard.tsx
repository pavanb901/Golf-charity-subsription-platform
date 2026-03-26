"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Gift, HeartHandshake, Wallet } from "lucide-react";

import { useDemo } from "@/components/providers/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { charityContributionTotal, monthlyPrizePool, retainLatestScores } from "@/lib/domain";
import { currency, percentage } from "@/lib/utils";

export function UserDashboard() {
  const {
    currentUser,
    snapshot,
    addScore,
    addIndependentDonation,
    changeSubscription,
    updateCharityChoice,
    startCheckout,
    openBillingPortal,
    isLiveMode
  } = useDemo();
  const [feedback, setFeedback] = useState("");

  const selectedCharity = snapshot.charities.find((charity) => charity.id === currentUser?.charityId);

  const leaderboard = useMemo(
    () =>
      retainLatestScores(
        snapshot.users
          .filter((user) => user.role === "subscriber")
          .flatMap((user) => user.scores)
      ),
    [snapshot.users]
  );

  if (!currentUser) {
    return (
      <section className="px-5 py-10 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <h1 className="font-display text-3xl font-bold">Login required</h1>
            <p className="mt-3 text-slate">Use the seeded demo accounts on the access page to open the dashboard.</p>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-10 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="bg-ink text-mist">
            <Badge tone="warning">{currentUser.subscription.status}</Badge>
            <h1 className="mt-4 font-display text-5xl font-bold tracking-tight">Welcome back, {currentUser.name.split(" ")[0]}</h1>
            <p className="mt-4 max-w-2xl text-mist/72">
              Your dashboard combines subscription health, score entry, charity allocation, draw participation,
              and winner verification status in one place.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <MetricCard label="Renewal date" value={currentUser.subscription.renewalDate} icon={CalendarDays} />
              <MetricCard label="Prize pool" value={currency(monthlyPrizePool(snapshot.users))} icon={Wallet} />
              <MetricCard label="Your total won" value={currency(currentUser.totalWon)} icon={Gift} />
              <MetricCard
                label="Charity contribution"
                value={percentage(currentUser.subscription.charityPercentage)}
                icon={HeartHandshake}
              />
            </div>
          </Card>

          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate">Subscription</p>
            <h2 className="mt-2 font-display text-3xl font-bold">
              {currentUser.subscription.plan === "monthly" ? "Monthly plan" : "Yearly plan"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate">
              {isLiveMode
                ? "Use Stripe Checkout to activate or change the subscription. Manual toggles stay available here for testing and review."
                : "Non-subscribers would be restricted from score submission and draws. In this demo, you can toggle the plan state to review lifecycle handling."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {isLiveMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      void (async () => {
                        const result = await startCheckout("monthly");
                        if (!result.ok) setFeedback(result.error ?? "Unable to start checkout.");
                      })()
                    }
                  >
                    Checkout monthly
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      void (async () => {
                        const result = await startCheckout("yearly");
                        if (!result.ok) setFeedback(result.error ?? "Unable to start checkout.");
                      })()
                    }
                  >
                    Checkout yearly
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      void (async () => {
                        const result = await openBillingPortal();
                        if (!result.ok) setFeedback(result.error ?? "Unable to open billing portal.");
                      })()
                    }
                  >
                    Billing portal
                  </Button>
                </>
              ) : null}
              <Button variant="outline" onClick={() => void changeSubscription("monthly")}>
                Switch to monthly
              </Button>
              <Button variant="outline" onClick={() => void changeSubscription("yearly")}>
                Switch to yearly
              </Button>
              <Button
                variant="ghost"
                onClick={() => void changeSubscription(currentUser.subscription.plan, "lapsed")}
              >
                Mark lapsed
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_1fr_0.9fr]">
          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate">Score entry</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Last 5 Stableford scores</h2>
            <form
              className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const formData = new FormData(form);
                void (async () => {
                  const error = await addScore(
                    Number(formData.get("value")),
                    String(formData.get("date"))
                  );
                  setFeedback(error ?? "Score saved. Only the latest 5 scores are retained.");
                  if (!error) {
                    form.reset();
                  }
                })();
              }}
            >
              <input
                name="value"
                type="number"
                min="1"
                max="45"
                placeholder="Stableford score"
                className="rounded-2xl border border-ink/10 px-4 py-3"
              />
              <input name="date" type="date" className="rounded-2xl border border-ink/10 px-4 py-3" />
              <Button type="submit" variant="accent">
                Save
              </Button>
            </form>
            {feedback ? <p className="mt-3 text-sm text-slate">{feedback}</p> : null}
            <div className="mt-5 space-y-3">
              {retainLatestScores(currentUser.scores).map((score) => (
                <div key={score.id} className="flex items-center justify-between rounded-2xl bg-mist px-4 py-3">
                  <p className="font-semibold">{score.value} points</p>
                  <p className="text-sm text-slate">{format(new Date(score.date), "MMM d, yyyy")}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate">Charity allocation</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Chosen cause and donation percentage</h2>
            <form
              className="mt-5 grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                void (async () => {
                  await updateCharityChoice(
                    String(formData.get("charityId")),
                    Number(formData.get("percentage"))
                  );
                  setFeedback("Charity settings updated.");
                })();
              }}
            >
              <select
                name="charityId"
                defaultValue={currentUser.charityId}
                className="rounded-2xl border border-ink/10 px-4 py-3"
              >
                {snapshot.charities.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>
              <input
                name="percentage"
                type="number"
                min="10"
                max="100"
                defaultValue={currentUser.subscription.charityPercentage}
                className="rounded-2xl border border-ink/10 px-4 py-3"
              />
              <Button type="submit" variant="outline">
                Save charity preference
              </Button>
            </form>
            <div className="mt-5 rounded-[28px] bg-pine p-5 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Current recipient</p>
              <h3 className="mt-2 font-display text-2xl font-bold">{selectedCharity?.name}</h3>
              <p className="mt-2 text-sm leading-7 text-white/80">{selectedCharity?.description}</p>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-mist px-4 py-3">
              <div>
                <p className="font-semibold">Independent donation</p>
                <p className="text-sm text-slate">Separate from gameplay entries</p>
              </div>
              <Button
                variant="ghost"
                onClick={() =>
                  void (async () => {
                    await addIndependentDonation(25);
                    setFeedback("Added an independent donation.");
                  })()
                }
              >
                Add $25
              </Button>
            </div>
          </Card>

          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate">Participation</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Draw and verification snapshot</h2>
            <div className="mt-5 space-y-4">
              <InfoRow label="Draws entered" value={String(currentUser.drawsEntered)} />
              <InfoRow label="Upcoming draws" value={String(currentUser.upcomingDraws)} />
              <InfoRow label="Proof status" value={currentUser.proofStatus} />
              <InfoRow label="Payment state" value={currentUser.paymentStatus} />
              <InfoRow label="Charity-wide impact" value={currency(charityContributionTotal(snapshot.users))} />
            </div>
            <div className="mt-6 rounded-[28px] bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate">Recent score pool signals</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {leaderboard.map((score) => (
                  <span key={score.id} className="rounded-full bg-ink px-3 py-2 text-sm font-medium text-mist">
                    {score.value}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[28px] bg-white/8 p-4">
      <Icon className="h-5 w-5 text-gold" />
      <p className="mt-4 text-sm text-mist/60">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-mist px-4 py-3">
      <p className="text-sm text-slate">{label}</p>
      <p className="font-semibold capitalize">{value}</p>
    </div>
  );
}

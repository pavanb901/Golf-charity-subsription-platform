"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useDemo } from "@/components/providers/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { charityContributionTotal, monthlyPrizePool, prizeBreakdown } from "@/lib/domain";
import { currency, formatMonth } from "@/lib/utils";

export function AdminDashboard() {
  const { currentUser, snapshot, markPayoutPaid, publishLatestSimulation, runDraw, verifyWinner, isLiveMode } =
    useDemo();

  const latestDraw = [...snapshot.draws].reverse()[0];
  const breakdown = latestDraw ? prizeBreakdown(latestDraw) : null;

  const analytics = useMemo(
    () =>
      snapshot.charities.map((charity) => ({
        name: charity.name.split(" ")[0],
        raised: charity.totalRaised
      })),
    [snapshot.charities]
  );

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <section className="px-5 py-10 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Card>
            <h1 className="font-display text-3xl font-bold">Admin access required</h1>
            <p className="mt-3 text-slate">Use `admin@golfcharity.demo` / `admin123` to inspect the admin panel.</p>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-10 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total users" value={String(snapshot.users.length)} />
          <StatCard label="Prize pool" value={currency(monthlyPrizePool(snapshot.users))} />
          <StatCard label="Charity contributions" value={currency(charityContributionTotal(snapshot.users))} />
          <StatCard label="Published draws" value={String(snapshot.draws.filter((draw) => draw.status === "published").length)} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate">Draw management</p>
                <h2 className="mt-2 font-display text-3xl font-bold">Simulation and publish controls</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => void runDraw("random")}>
                  Run random draw
                </Button>
                <Button variant="outline" onClick={() => void runDraw("algorithmic")}>
                  Run weighted draw
                </Button>
                <Button variant="accent" onClick={() => void publishLatestSimulation()}>
                  Publish latest result
                </Button>
              </div>
            </div>
            {isLiveMode ? (
              <p className="mt-4 text-sm text-slate">
                In live mode these actions persist into Supabase and are restricted to admin users.
              </p>
            ) : null}
            {latestDraw ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[28px] bg-mist p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Latest draw</p>
                    <Badge tone={latestDraw.status === "published" ? "success" : "warning"}>
                      {latestDraw.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate">{formatMonth(latestDraw.month)}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {latestDraw.numbers.map((number) => (
                      <span key={number} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-mist">
                        {number}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate">{latestDraw.notes}</p>
                </div>
                <div className="rounded-[28px] bg-white p-5 shadow-sm">
                  <p className="font-semibold">Prize breakdown</p>
                  <div className="mt-4 space-y-3">
                    <AdminRow label="5-number jackpot" value={currency(breakdown?.jackpot ?? 0)} />
                    <AdminRow label="4-number pool" value={currency(breakdown?.tier4 ?? 0)} />
                    <AdminRow label="3-number pool" value={currency(breakdown?.tier3 ?? 0)} />
                    <AdminRow label="Rollover next month" value={currency(latestDraw.rolloverPool)} />
                  </div>
                </div>
              </div>
            ) : null}
          </Card>

          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate">Reports and analytics</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Charity contribution totals</h2>
            <div className="mt-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="raised" fill="#1E7A66" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate">Winners management</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Verification and payout states</h2>
            <div className="mt-5 space-y-3">
              {snapshot.users
                .filter((user) => user.role === "subscriber")
                .map((user) => (
                  <div key={user.id} className="rounded-[28px] bg-mist p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-slate">
                          Proof: {user.proofStatus} | Payment: {user.paymentStatus}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" onClick={() => void verifyWinner(user.id, true)}>
                          Approve
                        </Button>
                        <Button variant="ghost" onClick={() => void verifyWinner(user.id, false)}>
                          Reject
                        </Button>
                        <Button variant="outline" onClick={() => void markPayoutPaid(user.id)}>
                          Mark paid
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate">User and charity management</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Profiles, subscriptions, and content</h2>
            <div className="mt-5 space-y-3">
              {snapshot.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-2xl bg-mist px-4 py-3">
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-slate">
                      {user.role} • {user.subscription.status} • {user.email}
                    </p>
                  </div>
                  <Badge tone={user.subscription.status === "active" ? "success" : "warning"}>
                    {user.subscription.plan}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm uppercase tracking-[0.2em] text-slate">{label}</p>
      <p className="mt-3 font-display text-4xl font-bold">{value}</p>
    </Card>
  );
}

function AdminRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-mist px-4 py-3">
      <p className="text-sm text-slate">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

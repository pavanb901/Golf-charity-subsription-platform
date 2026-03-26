import { BarChart3, CalendarSync, CreditCard, Shield, Target, Upload } from "lucide-react";

import { Card } from "@/components/ui/card";

const features = [
  {
    title: "Subscription engine",
    description: "Monthly and yearly plans with visible status, renewal dates, and restricted access cues.",
    icon: CreditCard
  },
  {
    title: "Score retention logic",
    description: "Last 5 Stableford scores only, reverse chronological display, auto-replace oldest result.",
    icon: Target
  },
  {
    title: "Monthly draw control",
    description: "Random or weighted logic, simulation mode, official publish, and jackpot rollover support.",
    icon: CalendarSync
  },
  {
    title: "Winner verification",
    description: "Proof states move from pending review to approved or rejected and finally paid.",
    icon: Upload
  },
  {
    title: "Admin visibility",
    description: "One place for user management, charity curation, pool totals, and draw analytics.",
    icon: Shield
  },
  {
    title: "Impact analytics",
    description: "See active members, prize pools, donation totals, and top-performing charities at a glance.",
    icon: BarChart3
  }
];

export function FeatureGrid() {
  return (
    <section className="px-5 py-10 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ember">What’s inside</p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">
            A full-stack assignment shaped as a premium product story
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="bg-white/80">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-mist">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

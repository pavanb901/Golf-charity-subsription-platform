"use client";

import { useMemo } from "react";

import { Card } from "@/components/ui/card";
import { useDemo } from "@/components/providers/demo-provider";
import { charityContributionTotal, monthlyPrizePool } from "@/lib/domain";
import { currency } from "@/lib/utils";

export function HomeStats() {
  const { snapshot } = useDemo();

  const stats = useMemo(
    () => [
      {
        label: "Active subscribers",
        value: snapshot.users.filter((user) => user.role === "subscriber" && user.subscription.status === "active").length.toString()
      },
      {
        label: "Monthly prize pool",
        value: currency(monthlyPrizePool(snapshot.users))
      },
      {
        label: "Charity contributions",
        value: currency(charityContributionTotal(snapshot.users))
      },
      {
        label: "Featured charities",
        value: snapshot.charities.filter((charity) => charity.featured).length.toString()
      }
    ],
    [snapshot]
  );

  return (
    <section className="px-5 py-4 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label} className="bg-white/70">
            <p className="text-sm uppercase tracking-[0.18em] text-slate">{item.label}</p>
            <p className="mt-3 font-display text-4xl font-bold">{item.value}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

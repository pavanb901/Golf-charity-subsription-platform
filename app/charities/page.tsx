"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";

import { useDemo } from "@/components/providers/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { currency } from "@/lib/utils";

export default function CharitiesPage() {
  const { snapshot } = useDemo();
  const [query, setQuery] = useState("");

  const charities = useMemo(() => {
    const normalized = query.toLowerCase();
    return snapshot.charities.filter((charity) =>
      [charity.name, charity.category, charity.location].some((field) =>
        field.toLowerCase().includes(normalized)
      )
    );
  }, [query, snapshot.charities]);

  return (
    <section className="px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ember">Charity directory</p>
            <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">Choose impact first</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate">
              Search, compare, and spotlight the causes members can back when they subscribe.
            </p>
          </div>
          <label className="flex items-center gap-3 rounded-full border border-ink/10 bg-white px-5 py-3">
            <Search className="h-4 w-4 text-slate" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search charity, category, or city"
              className="w-72 border-none bg-transparent outline-none"
            />
          </label>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {charities.map((charity) => (
            <Card key={charity.id} className="overflow-hidden p-0">
              <div className="relative h-56 w-full">
                <Image src={charity.image} alt={charity.name} fill className="object-cover" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <Badge tone={charity.featured ? "success" : "default"}>
                    {charity.featured ? "Featured" : charity.category}
                  </Badge>
                  <p className="text-sm text-slate">{charity.location}</p>
                </div>
                <h2 className="mt-4 font-display text-3xl font-bold">{charity.name}</h2>
                <p className="mt-3 text-sm leading-7 text-slate">{charity.description}</p>
                <div className="mt-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate">Upcoming events</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {charity.events.map((eventName) => (
                      <span key={eventName} className="rounded-full bg-mist px-3 py-2 text-sm font-medium">
                        {eventName}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mt-5 text-sm font-semibold text-pine">
                  Raised so far: {currency(charity.totalRaised)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";

import { useDemo } from "@/components/providers/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ProfilePage() {
  const { currentUser, snapshot } = useDemo();

  if (!currentUser) {
    return (
      <section className="px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <h1 className="font-display text-3xl font-bold">No active session</h1>
            <p className="mt-3 text-slate">
              Use the access page to sign in as a subscriber or as the admin reviewer.
            </p>
            <div className="mt-6">
              <Link href="/login">
                <Button variant="accent">Go to login</Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  const charity = snapshot.charities.find((item) => item.id === currentUser.charityId);

  return (
    <section className="px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card className="bg-ink text-mist">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge tone="warning">{currentUser.role}</Badge>
              <h1 className="mt-4 font-display text-5xl font-bold tracking-tight">{currentUser.name}</h1>
              <p className="mt-3 text-mist/70">{currentUser.email}</p>
            </div>
            <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-white/10">
              <Image src={currentUser.avatar} alt={currentUser.name} fill className="object-cover" />
            </div>
          </div>
        </Card>

        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate">Profile and settings</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Account overview</h2>
            <div className="mt-5 space-y-3">
              <ProfileRow label="Joined" value={currentUser.joinedAt} />
              <ProfileRow label="Plan" value={currentUser.subscription.plan} />
              <ProfileRow label="Subscription status" value={currentUser.subscription.status} />
              <ProfileRow label="Renewal" value={currentUser.subscription.renewalDate} />
            </div>
          </Card>

          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate">Cause selection</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Supported charity</h2>
            <div className="mt-5 space-y-3">
              <ProfileRow label="Charity" value={charity?.name ?? "Not selected"} />
              <ProfileRow
                label="Contribution percentage"
                value={`${currentUser.subscription.charityPercentage}%`}
              />
              <ProfileRow
                label="Independent donations"
                value={`$${currentUser.independentDonations}`}
              />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-mist px-4 py-3">
      <p className="text-sm text-slate">{label}</p>
      <p className="font-semibold capitalize">{value}</p>
    </div>
  );
}

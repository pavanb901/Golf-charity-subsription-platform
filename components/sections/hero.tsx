import Link from "next/link";
import { ArrowRight, Heart, Sparkles, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { currency } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-10 lg:px-8 lg:pb-24 lg:pt-14">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[40px] bg-ink bg-glow p-8 text-mist lg:p-12">
          <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-mist/80">
            Subscription Golf With Emotional Stakes
          </p>
          <h1 className="max-w-3xl font-display text-5xl font-bold leading-none tracking-tight lg:text-7xl">
            Play your last five scores. Fund real causes. Win the monthly pool.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-mist/72">
            FairChance Club turns ordinary Stableford rounds into a charity-powered subscription
            experience with monthly draws, impact-led storytelling, and a dashboard that keeps
            players engaged.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard">
              <Button variant="accent" className="gap-2">
                Enter scores
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/charities">
              <Button variant="outline" className="border-white/20 bg-white/5 text-mist hover:bg-white/10">
                Explore charities
              </Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-3xl font-bold">5</p>
              <p className="text-sm text-mist/65">Latest scores retained automatically</p>
            </div>
            <div>
              <p className="text-3xl font-bold">40%</p>
              <p className="text-sm text-mist/65">Jackpot share with rollover support</p>
            </div>
            <div>
              <p className="text-3xl font-bold">10%+</p>
              <p className="text-sm text-mist/65">Minimum charity contribution baked in</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          <Card className="bg-white/75">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate">Prize pool model</p>
                <h2 className="mt-2 font-display text-2xl font-bold">Pre-defined automatic tiers</h2>
              </div>
              <Trophy className="h-10 w-10 text-gold" />
            </div>
            <div className="mt-6 space-y-4">
              {[
                { label: "5-number match", share: "40%", note: "Jackpot rolls over" },
                { label: "4-number match", share: "35%", note: "Split equally across winners" },
                { label: "3-number match", share: "25%", note: "Monthly instant allocation" }
              ].map((tier) => (
                <div key={tier.label} className="rounded-3xl border border-ink/8 bg-mist/70 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{tier.label}</p>
                    <p className="font-display text-xl font-bold">{tier.share}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate">{tier.note}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-ember to-gold text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-white/75">Subscription offer</p>
                <h2 className="mt-2 font-display text-3xl font-bold">
                  Monthly {currency(39)} or yearly {currency(399)}
                </h2>
              </div>
              <Sparkles className="h-10 w-10 text-white/80" />
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/85">
              Every active subscriber feeds both community impact and the monthly draw engine,
              while admins stay in control of simulations, publishing, verification, and payouts.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold">
              <Heart className="h-4 w-4" />
              Featured causes receive more than a donation, they receive recurring visibility.
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

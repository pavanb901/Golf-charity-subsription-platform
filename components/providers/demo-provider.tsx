"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { formatISO } from "date-fns";

import { addRollingScore, simulateDraw, validateScoreValue } from "@/lib/domain";
import { initialSnapshot } from "@/lib/demo-data";
import { publicEnv } from "@/lib/env";
import type {
  Charity,
  DrawLogic,
  PlatformSnapshot,
  ScoreEntry,
  SubscriberProfile,
  SubscriptionPlan
} from "@/lib/types";

interface MutationResult {
  ok: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
}

interface DemoContextValue {
  snapshot: PlatformSnapshot;
  currentUser: SubscriberProfile | null;
  isLiveMode: boolean;
  hasStripeBilling: boolean;
  login: (email: string, password: string) => Promise<MutationResult>;
  logout: () => Promise<void>;
  signup: (input: {
    name: string;
    email: string;
    password: string;
    charityId: string;
    plan: SubscriptionPlan;
  }) => Promise<MutationResult>;
  addScore: (value: number, date: string) => Promise<string | null>;
  updateCharityChoice: (charityId: string, charityPercentage: number) => Promise<void>;
  addIndependentDonation: (amount: number) => Promise<void>;
  changeSubscription: (
    plan: SubscriptionPlan,
    status?: SubscriberProfile["subscription"]["status"]
  ) => Promise<void>;
  runDraw: (logic: DrawLogic) => Promise<void>;
  publishLatestSimulation: () => Promise<void>;
  verifyWinner: (userId: string, approved: boolean) => Promise<void>;
  markPayoutPaid: (userId: string) => Promise<void>;
  upsertCharity: (charity: Charity) => Promise<void>;
  removeCharity: (charityId: string) => Promise<void>;
  startCheckout: (plan: SubscriptionPlan) => Promise<MutationResult>;
  openBillingPortal: () => Promise<MutationResult>;
  refreshSnapshot: () => Promise<void>;
}

const STORAGE_KEY = "fairchance-club-demo";
const isLiveMode = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);

const DemoContext = createContext<DemoContextValue | null>(null);

function updateUser(
  snapshot: PlatformSnapshot,
  userId: string,
  transform: (user: SubscriberProfile) => SubscriberProfile
) {
  return {
    ...snapshot,
    users: snapshot.users.map((user) => (user.id === userId ? transform(user) : user))
  };
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<PlatformSnapshot>(initialSnapshot);

  async function refreshSnapshot() {
    if (!isLiveMode) {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSnapshot(JSON.parse(stored));
      }
      return;
    }

    const response = await fetch("/api/platform", { cache: "no-store" });
    const data = await response.json();
    setSnapshot(data);
  }

  useEffect(() => {
    void refreshSnapshot();
  }, []);

  useEffect(() => {
    if (!isLiveMode) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    }
  }, [snapshot]);

  const currentUser = useMemo(
    () => snapshot.users.find((user) => user.id === snapshot.currentUserId) ?? null,
    [snapshot]
  );

  const value: DemoContextValue = {
    snapshot,
    currentUser,
    isLiveMode,
    hasStripeBilling: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    async refreshSnapshot() {
      await refreshSnapshot();
    },
    async login(email, password) {
      if (!isLiveMode) {
        const match = snapshot.users.find((user) => user.email === email && user.password === password);
        if (!match) {
          return { ok: false, error: "Invalid demo credentials." };
        }

        setSnapshot((current) => ({ ...current, currentUserId: match.id }));
        return { ok: true };
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await safeJson(response);
      if (!response.ok) {
        return { ok: false, error: data?.error ?? "Unable to log in." };
      }

      await refreshSnapshot();
      return { ok: true };
    },
    async logout() {
      if (!isLiveMode) {
        setSnapshot((current) => ({ ...current, currentUserId: null }));
        return;
      }

      await fetch("/api/auth/logout", { method: "POST" });
      await refreshSnapshot();
    },
    async signup(input) {
      if (!isLiveMode) {
        const id = `user-${Date.now()}`;
        setSnapshot((current) => ({
          ...current,
          currentUserId: id,
          users: [
            ...current.users,
            {
              id,
              role: "subscriber",
              name: input.name,
              email: input.email,
              password: input.password,
              avatar:
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
              joinedAt: formatISO(new Date(), { representation: "date" }),
              charityId: input.charityId,
              independentDonations: 0,
              subscription: {
                plan: input.plan,
                status: "active",
                renewalDate: formatISO(new Date(), { representation: "date" }),
                amount: input.plan === "monthly" ? 39 : 399,
                charityPercentage: 10
              },
              scores: [],
              drawsEntered: 0,
              upcomingDraws: 1,
              totalWon: 0,
              proofStatus: "not_submitted",
              paymentStatus: "pending"
            }
          ]
        }));
        return { ok: true };
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const data = await safeJson(response);
      if (!response.ok) {
        return { ok: false, error: data?.error ?? "Unable to sign up." };
      }

      await refreshSnapshot();
      return { ok: true, needsEmailConfirmation: data?.needsEmailConfirmation };
    },
    async addScore(value, date) {
      if (!currentUser) return "Please log in first.";
      if (!validateScoreValue(value)) return "Score must be between 1 and 45.";

      const entry: ScoreEntry = {
        id: `score-${Date.now()}`,
        value,
        date
      };

      if (!isLiveMode) {
        setSnapshot((current) =>
          updateUser(current, currentUser.id, (user) => ({
            ...user,
            scores: addRollingScore(user.scores, entry)
          }))
        );
        return null;
      }

      const response = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add-score", entry })
      });
      const data = await safeJson(response);
      if (!response.ok) {
        return data?.error ?? "Unable to save score.";
      }
      setSnapshot(data.snapshot);
      return null;
    },
    async updateCharityChoice(charityId, charityPercentage) {
      if (!currentUser) return;
      if (!isLiveMode) {
        setSnapshot((current) =>
          updateUser(current, currentUser.id, (user) => ({
            ...user,
            charityId,
            subscription: {
              ...user.subscription,
              charityPercentage
            }
          }))
        );
        return;
      }

      const response = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-charity", charityId, charityPercentage })
      });
      const data = await response.json();
      setSnapshot(data.snapshot);
    },
    async addIndependentDonation(amount) {
      if (!currentUser) return;
      if (!isLiveMode) {
        setSnapshot((current) =>
          updateUser(current, currentUser.id, (user) => ({
            ...user,
            independentDonations: user.independentDonations + amount
          }))
        );
        return;
      }

      const response = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add-donation", amount })
      });
      const data = await response.json();
      setSnapshot(data.snapshot);
    },
    async changeSubscription(plan, status = "active") {
      if (!currentUser) return;
      if (!isLiveMode) {
        setSnapshot((current) =>
          updateUser(current, currentUser.id, (user) => ({
            ...user,
            subscription: {
              ...user.subscription,
              plan,
              status,
              amount: plan === "monthly" ? 39 : 399
            }
          }))
        );
        return;
      }

      const response = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-subscription", plan, status })
      });
      const data = await response.json();
      setSnapshot(data.snapshot);
    },
    async runDraw(logic) {
      if (!isLiveMode) {
        setSnapshot((current) => {
          const previousPublished = [...current.draws]
            .reverse()
            .find((draw) => draw.status === "published");
          const simulation = simulateDraw(
            current.users.filter((user) => user.role === "subscriber"),
            logic,
            previousPublished?.rolloverPool ?? 0
          );

          return {
            ...current,
            draws: [...current.draws.filter((draw) => draw.status !== "simulation"), simulation]
          };
        });
        return;
      }

      const response = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run-draw", logic })
      });
      const data = await response.json();
      setSnapshot(data.snapshot);
    },
    async publishLatestSimulation() {
      if (!isLiveMode) {
        setSnapshot((current) => ({
          ...current,
          draws: current.draws.map((draw) =>
            draw.status === "simulation" ? { ...draw, status: "published" } : draw
          )
        }));
        return;
      }

      const response = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish-draw" })
      });
      const data = await response.json();
      setSnapshot(data.snapshot);
    },
    async verifyWinner(userId, approved) {
      if (!isLiveMode) {
        setSnapshot((current) =>
          updateUser(current, userId, (user) => ({
            ...user,
            proofStatus: approved ? "approved" : "rejected",
            verificationNotes: approved
              ? "Proof approved by admin."
              : "Proof rejected. Request a clearer score screenshot."
          }))
        );
        return;
      }

      const response = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-winner", userId, approved })
      });
      const data = await response.json();
      setSnapshot(data.snapshot);
    },
    async markPayoutPaid(userId) {
      if (!isLiveMode) {
        setSnapshot((current) =>
          updateUser(current, userId, (user) => ({
            ...user,
            paymentStatus: "paid"
          }))
        );
        return;
      }

      const response = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-payout-paid", userId })
      });
      const data = await response.json();
      setSnapshot(data.snapshot);
    },
    async upsertCharity() {
      return;
    },
    async removeCharity() {
      return;
    },
    async startCheckout(plan) {
      if (!isLiveMode) {
        return {
          ok: false,
          error: "Stripe checkout only works after Supabase and Stripe env variables are configured."
        };
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      const data = await safeJson(response);
      if (!response.ok) {
        return { ok: false, error: data?.error ?? "Unable to start checkout." };
      }

      if (data?.url) {
        window.location.href = data.url;
      }

      return { ok: true };
    },
    async openBillingPortal() {
      if (!isLiveMode) {
        return {
          ok: false,
          error: "Billing portal only works after Supabase and Stripe env variables are configured."
        };
      }

      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await safeJson(response);
      if (!response.ok) {
        return { ok: false, error: data?.error ?? "Unable to open billing portal." };
      }

      if (data?.url) {
        window.location.href = data.url;
      }

      return { ok: true };
    }
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within DemoProvider");
  }
  return context;
}

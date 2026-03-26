export type SubscriptionPlan = "monthly" | "yearly";

export type SubscriptionStatus = "active" | "inactive" | "lapsed" | "cancelled";

export type DrawLogic = "random" | "algorithmic";

export type WinnerProofStatus = "not_submitted" | "pending" | "approved" | "rejected";

export type PaymentStatus = "pending" | "paid";

export type UserRole = "subscriber" | "admin";

export interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  location: string;
  image: string;
  featured: boolean;
  events: string[];
  totalRaised: number;
}

export interface ScoreEntry {
  id: string;
  value: number;
  date: string;
}

export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  renewalDate: string;
  amount: number;
  charityPercentage: number;
}

export interface SubscriberProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  password: string;
  avatar: string;
  joinedAt: string;
  charityId: string;
  independentDonations: number;
  subscription: Subscription;
  scores: ScoreEntry[];
  drawsEntered: number;
  upcomingDraws: number;
  totalWon: number;
  proofStatus: WinnerProofStatus;
  paymentStatus: PaymentStatus;
  verificationNotes?: string;
}

export interface DrawResult {
  id: string;
  month: string;
  logic: DrawLogic;
  numbers: number[];
  status: "simulation" | "published";
  totalPool: number;
  rolloverPool: number;
  winners3: string[];
  winners4: string[];
  winners5: string[];
  notes: string;
}

export interface PlatformSnapshot {
  charities: Charity[];
  users: SubscriberProfile[];
  draws: DrawResult[];
  currentUserId: string | null;
}

import { addDays, addMonths, formatISO, subDays } from "date-fns";

import { MONTHLY_PRICE, YEARLY_PRICE } from "@/lib/domain";
import type { Charity, DrawResult, PlatformSnapshot, SubscriberProfile } from "@/lib/types";

const charities: Charity[] = [
  {
    id: "charity-rise",
    name: "Rise Forward Foundation",
    slug: "rise-forward-foundation",
    description:
      "Funds adaptive sports rehab and confidence-building coaching for young adults recovering from life-changing injuries.",
    category: "Youth Mobility",
    location: "Austin, Texas",
    image:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    events: ["Spring Golf Day - April 18", "Impact Breakfast - May 6"],
    totalRaised: 18240
  },
  {
    id: "charity-oceans",
    name: "Blue Miles Initiative",
    slug: "blue-miles-initiative",
    description:
      "Supports coastal cleanup programs and career training for communities protecting vulnerable shorelines.",
    category: "Environment",
    location: "San Diego, California",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    events: ["Community Beach Day - April 25", "Junior Ocean League - June 12"],
    totalRaised: 12680
  },
  {
    id: "charity-heart",
    name: "Heartline Community Trust",
    slug: "heartline-community-trust",
    description:
      "Provides emergency grants, grief counseling, and sports access for families navigating critical illness.",
    category: "Family Support",
    location: "Charlotte, North Carolina",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    events: ["Charity Pro-Am - May 14", "Supporter Night - July 2"],
    totalRaised: 21130
  }
];

const users: SubscriberProfile[] = [
  {
    id: "user-mia",
    role: "subscriber",
    name: "Mia Brooks",
    email: "mia@golfcharity.demo",
    password: "demo123",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    joinedAt: formatISO(subDays(new Date(), 94), { representation: "date" }),
    charityId: "charity-rise",
    independentDonations: 120,
    subscription: {
      plan: "monthly",
      status: "active",
      renewalDate: formatISO(addDays(new Date(), 11), { representation: "date" }),
      amount: MONTHLY_PRICE,
      charityPercentage: 18
    },
    scores: [
      { id: "score-1", value: 31, date: formatISO(subDays(new Date(), 2), { representation: "date" }) },
      { id: "score-2", value: 27, date: formatISO(subDays(new Date(), 8), { representation: "date" }) },
      { id: "score-3", value: 24, date: formatISO(subDays(new Date(), 16), { representation: "date" }) },
      { id: "score-4", value: 35, date: formatISO(subDays(new Date(), 24), { representation: "date" }) },
      { id: "score-5", value: 29, date: formatISO(subDays(new Date(), 31), { representation: "date" }) }
    ],
    drawsEntered: 8,
    upcomingDraws: 1,
    totalWon: 640,
    proofStatus: "pending",
    paymentStatus: "pending",
    verificationNotes: "Awaiting screenshot upload review."
  },
  {
    id: "user-noah",
    role: "subscriber",
    name: "Noah Bennett",
    email: "noah@golfcharity.demo",
    password: "demo123",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    joinedAt: formatISO(subDays(new Date(), 121), { representation: "date" }),
    charityId: "charity-oceans",
    independentDonations: 40,
    subscription: {
      plan: "yearly",
      status: "active",
      renewalDate: formatISO(addMonths(new Date(), 7), { representation: "date" }),
      amount: YEARLY_PRICE,
      charityPercentage: 12
    },
    scores: [
      { id: "score-6", value: 12, date: formatISO(subDays(new Date(), 5), { representation: "date" }) },
      { id: "score-7", value: 18, date: formatISO(subDays(new Date(), 12), { representation: "date" }) },
      { id: "score-8", value: 26, date: formatISO(subDays(new Date(), 19), { representation: "date" }) },
      { id: "score-9", value: 31, date: formatISO(subDays(new Date(), 25), { representation: "date" }) },
      { id: "score-10", value: 34, date: formatISO(subDays(new Date(), 39), { representation: "date" }) }
    ],
    drawsEntered: 11,
    upcomingDraws: 1,
    totalWon: 0,
    proofStatus: "not_submitted",
    paymentStatus: "pending"
  },
  {
    id: "user-admin",
    role: "admin",
    name: "Ava Sullivan",
    email: "admin@golfcharity.demo",
    password: "admin123",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80",
    joinedAt: formatISO(subDays(new Date(), 200), { representation: "date" }),
    charityId: "charity-heart",
    independentDonations: 0,
    subscription: {
      plan: "monthly",
      status: "active",
      renewalDate: formatISO(addDays(new Date(), 4), { representation: "date" }),
      amount: MONTHLY_PRICE,
      charityPercentage: 10
    },
    scores: [
      { id: "score-11", value: 19, date: formatISO(subDays(new Date(), 4), { representation: "date" }) },
      { id: "score-12", value: 22, date: formatISO(subDays(new Date(), 11), { representation: "date" }) },
      { id: "score-13", value: 28, date: formatISO(subDays(new Date(), 17), { representation: "date" }) },
      { id: "score-14", value: 30, date: formatISO(subDays(new Date(), 29), { representation: "date" }) },
      { id: "score-15", value: 33, date: formatISO(subDays(new Date(), 43), { representation: "date" }) }
    ],
    drawsEntered: 0,
    upcomingDraws: 0,
    totalWon: 0,
    proofStatus: "not_submitted",
    paymentStatus: "pending"
  }
];

const draws: DrawResult[] = [
  {
    id: "draw-published",
    month: formatISO(subDays(new Date(), 20), { representation: "date" }),
    logic: "algorithmic",
    numbers: [12, 18, 26, 31, 34],
    status: "published",
    totalPool: 8600,
    rolloverPool: 0,
    winners3: ["user-noah"],
    winners4: [],
    winners5: [],
    notes: "Published after admin simulation and verification review."
  }
];

export const initialSnapshot: PlatformSnapshot = {
  charities,
  users,
  draws,
  currentUserId: "user-mia"
};

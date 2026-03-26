import { addMonths, compareDesc, formatISO, startOfMonth } from "date-fns";

import type {
  DrawLogic,
  DrawResult,
  ScoreEntry,
  SubscriberProfile
} from "@/lib/types";

export const MONTHLY_PRICE = 39;
export const YEARLY_PRICE = 399;

export function sortScores(scores: ScoreEntry[]) {
  return [...scores].sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));
}

export function retainLatestScores(scores: ScoreEntry[]) {
  return sortScores(scores).slice(0, 5);
}

export function addRollingScore(scores: ScoreEntry[], entry: ScoreEntry) {
  return retainLatestScores([...scores, entry]);
}

export function validateScoreValue(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 45;
}

export function nextRenewalDate() {
  return formatISO(addMonths(new Date(), 1), { representation: "date" });
}

export function monthlyPrizePool(users: SubscriberProfile[]) {
  return users.reduce((total, user) => {
    if (user.subscription.status !== "active") {
      return total;
    }

    return total + user.subscription.amount * 0.45;
  }, 0);
}

export function charityContributionTotal(users: SubscriberProfile[]) {
  return users.reduce((total, user) => {
    if (user.subscription.status !== "active") {
      return total + user.independentDonations;
    }

    return (
      total +
      user.subscription.amount * (user.subscription.charityPercentage / 100) +
      user.independentDonations
    );
  }, 0);
}

export function buildWeightedNumbers(users: SubscriberProfile[]) {
  const counts = new Map<number, number>();

  users.forEach((user) => {
    user.scores.forEach((score) => {
      counts.set(score.value, (counts.get(score.value) ?? 0) + 1);
    });
  });

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const mostFrequent = ranked.slice(0, 3).map(([value]) => value);
  const leastFrequent = ranked.slice(-2).map(([value]) => value);
  const selection = [...new Set([...mostFrequent, ...leastFrequent])];

  while (selection.length < 5) {
    const randomNumber = Math.floor(Math.random() * 45) + 1;
    if (!selection.includes(randomNumber)) {
      selection.push(randomNumber);
    }
  }

  return selection.sort((a, b) => a - b);
}

export function buildRandomNumbers() {
  const selection = new Set<number>();
  while (selection.size < 5) {
    selection.add(Math.floor(Math.random() * 45) + 1);
  }
  return [...selection].sort((a, b) => a - b);
}

export function scoreMatches(user: SubscriberProfile, drawNumbers: number[]) {
  const latestFive = retainLatestScores(user.scores).map((score) => score.value);
  return drawNumbers.filter((value) => latestFive.includes(value)).length;
}

export function simulateDraw(
  users: SubscriberProfile[],
  logic: DrawLogic,
  rolloverPool = 0
): DrawResult {
  const numbers = logic === "algorithmic" ? buildWeightedNumbers(users) : buildRandomNumbers();
  const month = formatISO(startOfMonth(new Date()), { representation: "date" });
  const totalPool = monthlyPrizePool(users) + rolloverPool;

  const winners3: string[] = [];
  const winners4: string[] = [];
  const winners5: string[] = [];

  users.forEach((user) => {
    const matches = scoreMatches(user, numbers);
    if (matches === 3) winners3.push(user.id);
    if (matches === 4) winners4.push(user.id);
    if (matches >= 5) winners5.push(user.id);
  });

  const jackpotCarry = winners5.length === 0 ? totalPool * 0.4 : 0;

  return {
    id: `draw-${Date.now()}`,
    month,
    logic,
    numbers,
    status: "simulation",
    totalPool,
    rolloverPool: jackpotCarry,
    winners3,
    winners4,
    winners5,
    notes:
      logic === "algorithmic"
        ? "Hybrid weighted draw using frequent and underrepresented score bands."
        : "Standard random 5-number monthly draw."
  };
}

export function prizeBreakdown(draw: DrawResult) {
  const jackpot = draw.totalPool * 0.4;
  const tier4 = draw.totalPool * 0.35;
  const tier3 = draw.totalPool * 0.25;

  return {
    tier5Each: draw.winners5.length ? jackpot / draw.winners5.length : 0,
    tier4Each: draw.winners4.length ? tier4 / draw.winners4.length : 0,
    tier3Each: draw.winners3.length ? tier3 / draw.winners3.length : 0,
    jackpot,
    tier4,
    tier3
  };
}

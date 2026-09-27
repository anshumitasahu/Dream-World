import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { creditSummary } from "@/sharedTypes/credit/credit.model";

export const SIGNUP_CREDITS = 100;

// 100 credits = $0.50, so a single credit is worth $0.005.
const USD_PER_CREDIT = 0.5 / 100;
const INPUT_USD_PER_TOKEN = 0.1 / 1_000_000;
const OUTPUT_USD_PER_TOKEN = 0.2 / 1_000_000;

const HISTORY_LIMIT = 50;

/** Whole credits for one turn, rounded up, with a one-credit minimum. */
export function creditsForTokens(inputTokens: number, outputTokens: number): number {
  const usd = inputTokens * INPUT_USD_PER_TOKEN + outputTokens * OUTPUT_USD_PER_TOKEN;
  return Math.max(1, Math.ceil(usd / USD_PER_CREDIT));
}

/** Returns the user's balance row, creating it with the signup bonus if absent. */
async function getOrCreateBalance(userId: string) {
  const existing = await prisma.userCredits.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  return prisma.$transaction(async (tx) => {
    const created = await tx.userCredits.create({ data: { userId, credits: SIGNUP_CREDITS } });
    await tx.userCreditHistory.create({
      data: { userId, change: SIGNUP_CREDITS, reason: "Signup bonus" },
    });
    return created;
  });
}

/** Grants the signup bonus to a freshly created account (idempotent). */
export async function grantSignupCredits(userId: string): Promise<void> {
  await getOrCreateBalance(userId);
}

export async function getCreditSummary(userId: string): Promise<creditSummary> {
  const balance = await getOrCreateBalance(userId);
  const histories = await prisma.userCreditHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
  });

  return {
    credits: balance.credits,
    histories: histories.map((entry) => ({
      id: entry.id,
      change: entry.change,
      reason: entry.reason,
      createdAt: entry.createdAt.toISOString(),
    })),
  };
}

export async function assertCreditsAvailable(userId: string): Promise<void> {
  const balance = await getOrCreateBalance(userId);
  if (balance.credits <= 0) {
    throw new ApiError(402, "Out of credits");
  }
}

export interface creditCharge {
  creditsUsed: number;
  creditsLeft: number;
}

export async function chargeCredits(
  userId: string,
  inputTokens: number,
  outputTokens: number,
): Promise<creditCharge> {
  const creditsUsed = creditsForTokens(inputTokens, outputTokens);

  const creditsLeft = await prisma.$transaction(async (tx) => {
    const balance = await tx.userCredits.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    if (!balance || balance.credits < creditsUsed) {
      throw new ApiError(402, "Out of credits");
    }

    const updated = await tx.userCredits.update({
      where: { id: balance.id },
      data: { credits: { decrement: creditsUsed } },
    });

    await tx.userCreditHistory.create({
      data: {
        userId,
        change: -creditsUsed,
        reason: `Chat message · ${inputTokens} in / ${outputTokens} out tokens`,
      },
    });

    return updated.credits;
  });

  return { creditsUsed, creditsLeft };
}

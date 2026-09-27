import { generateWorldTurn, type agentTurn } from "@/lib/ai";
import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { assertCreditsAvailable, chargeCredits, type creditCharge } from "@/modules/credit/credit.service";
import type { messageUsage } from "@/sharedTypes/chat/chat.model";
// import { testResponse } from "./testWorld";

export function titleFromPrompt(prompt: string): string {
  const firstLine = prompt.split("\n")[0]?.trim() ?? "";
  const cleaned = firstLine.replace(/^(i dream (of )?(a world )?|a world (where|with) )/i, "").trim();
  const source = cleaned.length > 0 ? cleaned : firstLine;
  return source.length > 60 ? `${source.slice(0, 57)}...` : source || "Untitled dream";
}

/** Drops stored billing metadata so the model only replays the agent's actual reply. */
function responseForModel(response: unknown): unknown {
  if (response && typeof response === "object" && "world" in response) {
    const { message, world } = response as { message?: unknown; world?: unknown };
    return { message, world };
  }
  return response;
}

/** Replays stored exchanges as agent turns so the model sees each prior world. */
function historyToTurns(histories: { message: string; response: unknown }[]): agentTurn[] {
  return histories.flatMap((entry) => [
    { role: "user" as const, content: entry.message },
    { role: "assistant" as const, content: JSON.stringify(responseForModel(entry.response)) },
  ]);
}

function buildUsage(inputTokens: number, outputTokens: number, charge: creditCharge): messageUsage {
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    creditsUsed: charge.creditsUsed,
    creditsLeft: charge.creditsLeft,
  };
}

export async function createChat(userId: string, message: string) {
  await assertCreditsAvailable(userId);

  const title = titleFromPrompt(message);
  const { response, usage: tokens } = await generateWorldTurn([], message);
  const charge = await chargeCredits(userId, tokens.inputTokens, tokens.outputTokens);
  const usage = buildUsage(tokens.inputTokens, tokens.outputTokens, charge);

  const chat = await prisma.userChat.create({
    data: {
      title,
      userId,
      userChatHistories: {
        create: [{ message, response: { ...response, usage } }],
      },
    },
    include: { userChatHistories: { orderBy: { createdAt: "asc" } } },
  });

  return { ...chat, usage };
}

export async function appendMessage(userId: string, chatId: string, message: string) {
  const chat = await prisma.userChat.findFirst({
    where: { id: chatId, userId },
    include: { userChatHistories: { orderBy: { createdAt: "asc" } } },
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  await assertCreditsAvailable(userId);

  const { response, usage: tokens } = await generateWorldTurn(historyToTurns(chat.userChatHistories), message);
  const charge = await chargeCredits(userId, tokens.inputTokens, tokens.outputTokens);
  const usage = buildUsage(tokens.inputTokens, tokens.outputTokens, charge);
  // for testing
  // const response = testResponse;

  const entry = await prisma.userChatHistory.create({
    data: { userChatId: chatId, message, response: { ...response, usage } },
  });

  return { ...entry, usage };
}

export async function getChatForUser(userId: string, chatId: string) {
  const chat = await prisma.userChat.findFirst({
    where: { id: chatId, userId },
    include: {
      userChatHistories: { orderBy: { createdAt: "asc" } },
      dream: true,
    },
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  return chat;
}

export async function listChatsForUser(userId: string) {
  return prisma.userChat.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

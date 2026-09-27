import { generateWorldTurn, type agentTurn } from "@/lib/ai";
import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { testResponse } from "./testWorld";

export function titleFromPrompt(prompt: string): string {
  const firstLine = prompt.split("\n")[0]?.trim() ?? "";
  const cleaned = firstLine.replace(/^(i dream (of )?(a world )?|a world (where|with) )/i, "").trim();
  const source = cleaned.length > 0 ? cleaned : firstLine;
  return source.length > 60 ? `${source.slice(0, 57)}...` : source || "Untitled dream";
}

/** Replays stored exchanges as agent turns so the model sees each prior world. */
function historyToTurns(histories: { message: string; response: unknown }[]): agentTurn[] {
  return histories.flatMap((entry) => [
    { role: "user" as const, content: entry.message },
    { role: "assistant" as const, content: JSON.stringify(entry.response) },
  ]);
}

export async function createChat(userId: string, message: string) {
  const title = titleFromPrompt(message);
  const response = await generateWorldTurn([], message);

  return prisma.userChat.create({
    data: {
      title,
      userId,
      userChatHistories: {
        create: [{ message, response }],
      },
    },
    include: { userChatHistories: { orderBy: { createdAt: "asc" } } },
  });
}

export async function appendMessage(userId: string, chatId: string, message: string) {
  const chat = await prisma.userChat.findFirst({
    where: { id: chatId, userId },
    include: { userChatHistories: { orderBy: { createdAt: "asc" } } },
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  // const response = await generateWorldTurn(historyToTurns(chat.userChatHistories), message);
  // for testing
  const response = testResponse; 

  return prisma.userChatHistory.create({
    data: { userChatId: chatId, message, response },
  });
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

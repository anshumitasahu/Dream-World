import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { publishDreamParams } from "@/sharedTypes/dream/dream.model";

function withTagNames<T extends { dreamTags: { tag: { name: string } }[] }>(dream: T) {
  const { dreamTags, ...rest } = dream;
  return { ...rest, tags: dreamTags.map((dt) => dt.tag.name) };
}

export async function publishDream(userId: string, input: publishDreamParams) {
  const chat = await prisma.userChat.findFirst({
    where: { id: input.userChatId, userId },
    include: {
      userChatHistories: { orderBy: { createdAt: "asc" } },
      dream: true,
    },
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  if (chat.dream) {
    throw new ApiError(409, "Dream already posted for this chat");
  }

  const firstMessage = chat.userChatHistories[0]?.message;
  if (!firstMessage) {
    throw new ApiError(400, "Chat has no messages to publish");
  }

  const tags = [...new Set(input.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];

  const dream = await prisma.$transaction(async (tx) => {
    const created = await tx.dream.create({
      data: { userChatId: chat.id, title: input.title, prompt: firstMessage, authorId: userId },
    });

    for (const name of tags) {
      const tag = await tx.tags.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      await tx.dreamTags.create({
        data: { dreamId: created.id, tagId: tag.id },
      });
    }

    return tx.dream.findUniqueOrThrow({
      where: { id: created.id },
      include: { dreamTags: { include: { tag: true } } },
    });
  });

  return withTagNames(dream);
}

export async function getDreamForUser(userId: string, dreamId: string) {
  const dream = await prisma.dream.findFirst({
    where: { id: dreamId, authorId: userId },
    include: { dreamTags: { include: { tag: true } } },
  });

  if (!dream) {
    throw new ApiError(404, "Dream not found");
  }

  return withTagNames(dream);
}

export async function listDreamsForUser(userId: string) {
  const dreams = await prisma.dream.findMany({
    where: { authorId: userId },
    include: { dreamTags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
  });

  return dreams.map(withTagNames);
}

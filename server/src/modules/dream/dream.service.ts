import { ApiError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type {
  dreamLikeResult,
  dreamWorldSummary,
  publishDreamParams,
} from "@/sharedTypes/dream/dream.model";
import { worldSchema, type worldConfig } from "@/sharedTypes/world/world.model";

function withTagNames<T extends { dreamTags: { tag: { name: string } }[] }>(dream: T) {
  const { dreamTags, ...rest } = dream;
  return { ...rest, tags: dreamTags.map((dt) => dt.tag.name) };
}

interface historyRecord {
  message: string;
  response: unknown;
}

interface dreamRecord {
  id: string;
  userChatId: string;
  title: string;
  prompt: string;
  authorId: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  dreamTags: { tag: { name: string } }[];
  author: { id: string; name: string | null; avatarUrl: string | null };
  userChat: { userChatHistories: historyRecord[] };
}

const dreamRelations = {
  author: { select: { id: true, name: true, avatarUrl: true } },
  dreamTags: { include: { tag: true } },
  userChat: { include: { userChatHistories: { orderBy: { createdAt: "desc" }, take: 1 } } },
} as const;

/** Latest world state of a chat: understands the `{ message, world }` envelope and legacy shapes. */
function latestWorld(histories: historyRecord[]): worldConfig | null {
  const latest = histories[0];
  if (!latest) return null;
  const response = latest.response;
  const raw =
    response && typeof response === "object" && "world" in response
      ? (response as { world?: unknown }).world
      : response;
  const parsed = worldSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function summarizeWorld(world: worldConfig | null): dreamWorldSummary {
  if (!world) {
    return { mode: "open", objectCount: 0, modelNames: [] };
  }
  const modelNames = [...new Set(world.objects.map((object) => object.model))];
  if (world.mode === "preset") {
    return {
      mode: "preset",
      map: world.map,
      weather: world.environment?.weather,
      time: world.environment?.time,
      objectCount: world.objects.length,
      modelNames,
    };
  }
  return {
    mode: "open",
    texture: world.ground?.texture,
    weather: world.environment?.weather,
    time: world.environment?.time,
    objectCount: world.objects.length,
    modelNames,
  };
}

function toExploreDream(dream: dreamRecord, likedByMe: boolean) {
  const world = latestWorld(dream.userChat.userChatHistories);
  return {
    id: dream.id,
    userChatId: dream.userChatId,
    title: dream.title,
    prompt: dream.prompt,
    authorId: dream.authorId,
    likes: dream.likes,
    tags: dream.dreamTags.map((dt) => dt.tag.name),
    author: dream.author,
    likedByMe,
    summary: summarizeWorld(world),
    createdAt: dream.createdAt.toISOString(),
    updatedAt: dream.updatedAt.toISOString(),
  };
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

/** Every published dream, most-liked first — the explore feed. */
export async function listExploreDreams(userId: string) {
  const dreams = await prisma.dream.findMany({
    include: dreamRelations,
    orderBy: [{ likes: "desc" }, { createdAt: "desc" }],
  }) as dreamRecord[];

  const likes = await prisma.userLikes.findMany({
    where: { userId, dreamId: { in: dreams.map((dream) => dream.id) } },
    select: { dreamId: true },
  });
  const likedIds = new Set(likes.map((like) => like.dreamId));

  return dreams.map((dream) => toExploreDream(dream, likedIds.has(dream.id)));
}

/** A single dream plus the latest world state of its chat, for the full-screen viewer. */
export async function getDreamWorld(userId: string, dreamId: string) {
  const dream = (await prisma.dream.findUnique({
    where: { id: dreamId },
    include: dreamRelations,
  })) as dreamRecord | null;

  if (!dream) {
    throw new ApiError(404, "Dream not found");
  }

  const world = latestWorld(dream.userChat.userChatHistories);
  if (!world) {
    throw new ApiError(404, "This dream has no world to explore");
  }

  const like = await prisma.userLikes.findFirst({
    where: { userId, dreamId },
    select: { id: true },
  });

  return { dream: toExploreDream(dream, !!like), world };
}

/** Idempotent like/unlike; keeps the denormalized Dream.likes counter in sync. */
export async function setDreamLike(
  userId: string,
  dreamId: string,
  liked: boolean,
): Promise<dreamLikeResult> {
  const dream = await prisma.dream.findUnique({ where: { id: dreamId }, select: { id: true } });
  if (!dream) {
    throw new ApiError(404, "Dream not found");
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.userLikes.findFirst({ where: { userId, dreamId }, select: { id: true } });

    if (liked && !existing) {
      await tx.userLikes.create({ data: { userId, dreamId } });
      const updated = await tx.dream.update({
        where: { id: dreamId },
        data: { likes: { increment: 1 } },
        select: { likes: true },
      });
      return { likes: updated.likes, likedByMe: true };
    }

    if (!liked && existing) {
      await tx.userLikes.delete({ where: { id: existing.id } });
      const updated = await tx.dream.update({
        where: { id: dreamId },
        data: { likes: { decrement: 1 } },
        select: { likes: true },
      });
      return { likes: Math.max(0, updated.likes), likedByMe: false };
    }

    const current = await tx.dream.findUniqueOrThrow({
      where: { id: dreamId },
      select: { likes: true },
    });
    return { likes: current.likes, likedByMe: !!existing };
  });
}

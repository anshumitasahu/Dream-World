import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import dummyWorld from "@/modules/chat/dummyWorld";
import { worldSchema, type worldConfig } from "@/sharedTypes/world/world.model";

const ADMIN_EMAIL = "admin@dreamworld.app";
const ADMIN_PASSWORD = "dreamworld-admin";
const ADMIN_NAME = "Dreamworld";

interface featuredDream {
  title: string;
  prompt: string;
  message: string;
  likes: number;
  tags: string[];
  world: worldConfig;
}

const featuredDreams: featuredDream[] = [
  {
    title: "Skybound Fortress",
    prompt: "a floating fortress in the sky with a mobile home bridging its mechanical walkways",
    message: "Welcome to the Skybound Fortress — mind the moving walkways up here.",
    likes: 30,
    tags: ["preset", "sky", "fortress", "adventure"],
    world: { mode: "preset", map: "mobileHome", objects: [], environment: { weather: "snow", time: "day" } },
  },
  {
    title: "The Last Stronghold",
    prompt: "a floating shrine in the sky with bridges wobbling in the wind to cross",
    message: "You've reached the Last Stronghold. Cross the wobbling bridges if you dare.",
    likes: 25,
    tags: ["preset", "shrine", "sky", "challenge"],
    world: { mode: "preset", map: "strongHold", objects: [], environment: { weather: "desert", time: "day" } },
  },
  {
    title: "Dragon's Meadow",
    prompt: "an enchanted meadow with a slumbering skeleton dragon and a glowing mushroom forest",
    message: "The Dragon's Meadow awaits — find the dragon and the magic mushroom forest.",
    likes: 20,
    tags: ["open-world", "forest", "dragon", "fantasy"],
    world: worldSchema.parse(dummyWorld),
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { name: ADMIN_NAME },
    create: { email: ADMIN_EMAIL, name: ADMIN_NAME, password: passwordHash },
  });

  for (const dream of featuredDreams) {
    const existing = await prisma.dream.findFirst({
      where: { authorId: admin.id, title: dream.title },
      include: {
        userChat: { include: { userChatHistories: { orderBy: { createdAt: "asc" }, take: 1 } } },
      },
    });

    const response = { message: dream.message, world: dream.world };

    // Re-seeding rewrites the world (e.g. environment tweaks) while leaving
    // accrued likes untouched.
    if (existing) {
      const firstHistory = existing.userChat.userChatHistories[0];
      if (firstHistory) {
        await prisma.userChatHistory.update({
          where: { id: firstHistory.id },
          data: { message: dream.prompt, response },
        });
      }

      await prisma.dream.update({
        where: { id: existing.id },
        data: { prompt: dream.prompt },
      });

      await prisma.dreamTags.deleteMany({ where: { dreamId: existing.id } });
      for (const name of dream.tags) {
        const tag = await prisma.tags.upsert({ where: { name }, update: {}, create: { name } });
        await prisma.dreamTags.create({ data: { dreamId: existing.id, tagId: tag.id } });
      }

      console.log(`updated: ${dream.title}`);
      continue;
    }

    await prisma.$transaction(async (tx) => {
      const chat = await tx.userChat.create({
        data: {
          title: dream.title,
          userId: admin.id,
          userChatHistories: {
            create: [{ message: dream.prompt, response: { message: dream.message, world: dream.world } }],
          },
        },
      });

      const created = await tx.dream.create({
        data: {
          userChatId: chat.id,
          title: dream.title,
          prompt: dream.prompt,
          authorId: admin.id,
          likes: dream.likes,
        },
      });

      for (const name of dream.tags) {
        const tag = await tx.tags.upsert({ where: { name }, update: {}, create: { name } });
        await tx.dreamTags.create({ data: { dreamId: created.id, tagId: tag.id } });
      }
    },
    {
      timeout: 10000, // 5 seconds
    }
  );

    console.log(`seeded: ${dream.title} (${dream.likes} likes)`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

import { prisma } from "../src/lib/prisma"

const authorId = "f01433e5-575d-4645-b7c0-4f9b9f3d6396";

const main = async () => {
    console.log("seeding posts");
    await prisma.post.createMany({
        data: [
            {
                content: "Just launched my new project! Built with React, TypeScript, and TailwindCSS.",
                authorId: authorId,
            },
            {
                content: "Spent the morning refactoring state management. Switching to Zustand simplified everything.",
                authorId: authorId,
            },
            {
                content: "Quick tip for developers: always double-check your database indexes on high-traffic relations!",
                authorId: authorId,
            },
            {
                content: "Day 75 of coding: added full dark mode support and optimized image loading times.",
                authorId: authorId,
            },
        ],
    });
}

console.log("seeding completed");
main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
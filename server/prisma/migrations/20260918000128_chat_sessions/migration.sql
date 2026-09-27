/*
  Warnings:

  - You are about to drop the `UserDream` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authorId` to the `Dream` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userChatId` to the `Dream` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserDream" DROP CONSTRAINT "UserDream_dreamId_fkey";

-- DropForeignKey
ALTER TABLE "UserDream" DROP CONSTRAINT "UserDream_userId_fkey";

-- AlterTable
ALTER TABLE "Dream" ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "userChatId" TEXT NOT NULL;

-- DropTable
DROP TABLE "UserDream";

-- CreateTable
CREATE TABLE "UserChat" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChatHistory" (
    "id" TEXT NOT NULL,
    "userChatId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserChatHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserChatHistory" ADD CONSTRAINT "UserChatHistory_userChatId_fkey" FOREIGN KEY ("userChatId") REFERENCES "UserChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dream" ADD CONSTRAINT "Dream_userChatId_fkey" FOREIGN KEY ("userChatId") REFERENCES "UserChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dream" ADD CONSTRAINT "Dream_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

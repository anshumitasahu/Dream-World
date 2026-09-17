/*
  Warnings:

  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `coverPicture` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profilePicture` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Follow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Like` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followerId_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followingId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_postId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bio",
DROP COLUMN "coverPicture",
DROP COLUMN "profilePicture",
DROP COLUMN "username",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "Follow";

-- DropTable
DROP TABLE "Like";

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "Dream" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDream" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dreamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLikes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dreamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLikes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- AddForeignKey
ALTER TABLE "UserDream" ADD CONSTRAINT "UserDream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDream" ADD CONSTRAINT "UserDream_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLikes" ADD CONSTRAINT "UserLikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLikes" ADD CONSTRAINT "UserLikes_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

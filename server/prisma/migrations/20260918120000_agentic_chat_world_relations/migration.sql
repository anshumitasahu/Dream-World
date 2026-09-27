-- AlterTable
ALTER TABLE "UserChatHistory" DROP COLUMN "response",
ADD COLUMN     "response" JSONB NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Dream_userChatId_key" ON "Dream"("userChatId");

-- AddForeignKey
ALTER TABLE "UserChat" ADD CONSTRAINT "UserChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


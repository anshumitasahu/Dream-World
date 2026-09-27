-- CreateTable
CREATE TABLE "Tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DreamTags" (
    "id" TEXT NOT NULL,
    "dreamId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DreamTags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tags_name_key" ON "Tags"("name");

-- AddForeignKey
ALTER TABLE "DreamTags" ADD CONSTRAINT "DreamTags_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamTags" ADD CONSTRAINT "DreamTags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

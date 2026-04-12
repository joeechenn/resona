-- CreateTable
CREATE TABLE "UserProfilePrompt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "trackId" TEXT,
    "albumId" TEXT,
    "artistId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfilePrompt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserProfilePrompt_userId_idx" ON "UserProfilePrompt"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfilePrompt_userId_prompt_key" ON "UserProfilePrompt"("userId", "prompt");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfilePrompt_userId_position_key" ON "UserProfilePrompt"("userId", "position");

-- AddForeignKey
ALTER TABLE "UserProfilePrompt" ADD CONSTRAINT "UserProfilePrompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfilePrompt" ADD CONSTRAINT "UserProfilePrompt_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfilePrompt" ADD CONSTRAINT "UserProfilePrompt_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfilePrompt" ADD CONSTRAINT "UserProfilePrompt_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

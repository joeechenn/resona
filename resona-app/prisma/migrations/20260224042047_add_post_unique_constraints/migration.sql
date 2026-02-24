/*
  Warnings:

  - A unique constraint covering the columns `[userId,trackId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,albumId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,artistId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Post_userId_trackId_key" ON "Post"("userId", "trackId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_userId_albumId_key" ON "Post"("userId", "albumId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_userId_artistId_key" ON "Post"("userId", "artistId");

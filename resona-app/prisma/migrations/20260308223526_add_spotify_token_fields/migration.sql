/*
  Warnings:

  - A unique constraint covering the columns `[spotifyId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "spotifyAccessToken" TEXT,
ADD COLUMN     "spotifyId" TEXT,
ADD COLUMN     "spotifyRefreshToken" TEXT,
ADD COLUMN     "spotifyTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_spotifyId_key" ON "User"("spotifyId");

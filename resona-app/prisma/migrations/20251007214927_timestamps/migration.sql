/*
  Warnings:

  - You are about to drop the `PlayEvent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `UserAlbumStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserArtistStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserTrackStat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "currentlyPlayingTrackId" TEXT,
ADD COLUMN     "isListening" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastPlaybackUpdate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."UserAlbumStat" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."UserArtistStat" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."UserTrackStat" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."PlayEvent";

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_currentlyPlayingTrackId_fkey" FOREIGN KEY ("currentlyPlayingTrackId") REFERENCES "public"."Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

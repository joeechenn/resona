/*
  Warnings:

  - You are about to drop the `RankItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RankList` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RankItem" DROP CONSTRAINT "RankItem_albumId_fkey";

-- DropForeignKey
ALTER TABLE "RankItem" DROP CONSTRAINT "RankItem_artistId_fkey";

-- DropForeignKey
ALTER TABLE "RankItem" DROP CONSTRAINT "RankItem_listId_fkey";

-- DropForeignKey
ALTER TABLE "RankItem" DROP CONSTRAINT "RankItem_trackId_fkey";

-- DropForeignKey
ALTER TABLE "RankList" DROP CONSTRAINT "RankList_userId_fkey";

-- DropTable
DROP TABLE "RankItem";

-- DropTable
DROP TABLE "RankList";

-- DropEnum
DROP TYPE "RankKind";

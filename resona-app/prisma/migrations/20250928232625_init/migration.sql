-- CreateEnum
CREATE TYPE "public"."RankKind" AS ENUM ('TRACK', 'ALBUM', 'ARTIST');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Artist" (
    "id" TEXT NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "popularity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Album" (
    "id" TEXT NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "releaseDate" TIMESTAMP(3),
    "primaryArtistId" TEXT,
    "popularity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Track" (
    "id" TEXT NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "isrc" TEXT,
    "name" TEXT NOT NULL,
    "albumId" TEXT,
    "durationMs" INTEGER NOT NULL,
    "explicit" BOOLEAN NOT NULL DEFAULT false,
    "popularity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrackArtist" (
    "trackId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,

    CONSTRAINT "TrackArtist_pkey" PRIMARY KEY ("trackId","artistId")
);

-- CreateTable
CREATE TABLE "public"."Genre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ArtistGenre" (
    "artistId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,

    CONSTRAINT "ArtistGenre_pkey" PRIMARY KEY ("artistId","genreId")
);

-- CreateTable
CREATE TABLE "public"."RankList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "public"."RankKind" NOT NULL,
    "title" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RankList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RankItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "note" TEXT,
    "trackId" TEXT,
    "albumId" TEXT,
    "artistId" TEXT,

    CONSTRAINT "RankItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserFollow" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFollow_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "public"."UserTrackStat" (
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "rating" INTEGER,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "lastPlayedAt" TIMESTAMP(3),

    CONSTRAINT "UserTrackStat_pkey" PRIMARY KEY ("userId","trackId")
);

-- CreateTable
CREATE TABLE "public"."UserArtistStat" (
    "userId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "rating" INTEGER,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "follow" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserArtistStat_pkey" PRIMARY KEY ("userId","artistId")
);

-- CreateTable
CREATE TABLE "public"."UserAlbumStat" (
    "userId" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "rating" INTEGER,
    "liked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserAlbumStat_pkey" PRIMARY KEY ("userId","albumId")
);

-- CreateTable
CREATE TABLE "public"."PlayEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "playedMs" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_spotifyId_key" ON "public"."Artist"("spotifyId");

-- CreateIndex
CREATE UNIQUE INDEX "Album_spotifyId_key" ON "public"."Album"("spotifyId");

-- CreateIndex
CREATE INDEX "Album_primaryArtistId_idx" ON "public"."Album"("primaryArtistId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_spotifyId_key" ON "public"."Track"("spotifyId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_isrc_key" ON "public"."Track"("isrc");

-- CreateIndex
CREATE INDEX "Track_albumId_idx" ON "public"."Track"("albumId");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "public"."Genre"("name");

-- CreateIndex
CREATE INDEX "RankList_userId_kind_idx" ON "public"."RankList"("userId", "kind");

-- CreateIndex
CREATE INDEX "RankList_userId_createdAt_idx" ON "public"."RankList"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "RankItem_trackId_idx" ON "public"."RankItem"("trackId");

-- CreateIndex
CREATE INDEX "RankItem_albumId_idx" ON "public"."RankItem"("albumId");

-- CreateIndex
CREATE INDEX "RankItem_artistId_idx" ON "public"."RankItem"("artistId");

-- CreateIndex
CREATE UNIQUE INDEX "RankItem_listId_position_key" ON "public"."RankItem"("listId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "RankItem_listId_trackId_key" ON "public"."RankItem"("listId", "trackId");

-- CreateIndex
CREATE UNIQUE INDEX "RankItem_listId_albumId_key" ON "public"."RankItem"("listId", "albumId");

-- CreateIndex
CREATE UNIQUE INDEX "RankItem_listId_artistId_key" ON "public"."RankItem"("listId", "artistId");

-- CreateIndex
CREATE INDEX "UserTrackStat_trackId_idx" ON "public"."UserTrackStat"("trackId");

-- CreateIndex
CREATE INDEX "UserTrackStat_userId_idx" ON "public"."UserTrackStat"("userId");

-- CreateIndex
CREATE INDEX "UserArtistStat_artistId_idx" ON "public"."UserArtistStat"("artistId");

-- CreateIndex
CREATE INDEX "UserArtistStat_userId_idx" ON "public"."UserArtistStat"("userId");

-- CreateIndex
CREATE INDEX "UserAlbumStat_albumId_idx" ON "public"."UserAlbumStat"("albumId");

-- CreateIndex
CREATE INDEX "UserAlbumStat_userId_idx" ON "public"."UserAlbumStat"("userId");

-- CreateIndex
CREATE INDEX "PlayEvent_userId_startedAt_idx" ON "public"."PlayEvent"("userId", "startedAt");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Album" ADD CONSTRAINT "Album_primaryArtistId_fkey" FOREIGN KEY ("primaryArtistId") REFERENCES "public"."Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Track" ADD CONSTRAINT "Track_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "public"."Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrackArtist" ADD CONSTRAINT "TrackArtist_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "public"."Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrackArtist" ADD CONSTRAINT "TrackArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArtistGenre" ADD CONSTRAINT "ArtistGenre_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArtistGenre" ADD CONSTRAINT "ArtistGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "public"."Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RankList" ADD CONSTRAINT "RankList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RankItem" ADD CONSTRAINT "RankItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "public"."RankList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RankItem" ADD CONSTRAINT "RankItem_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "public"."Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RankItem" ADD CONSTRAINT "RankItem_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "public"."Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RankItem" ADD CONSTRAINT "RankItem_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserFollow" ADD CONSTRAINT "UserFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserFollow" ADD CONSTRAINT "UserFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserTrackStat" ADD CONSTRAINT "UserTrackStat_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "public"."Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserTrackStat" ADD CONSTRAINT "UserTrackStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserArtistStat" ADD CONSTRAINT "UserArtistStat_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserArtistStat" ADD CONSTRAINT "UserArtistStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAlbumStat" ADD CONSTRAINT "UserAlbumStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAlbumStat" ADD CONSTRAINT "UserAlbumStat_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "public"."Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "UserAlbumStat_userId_createdAt_idx" ON "UserAlbumStat"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserArtistStat_userId_createdAt_idx" ON "UserArtistStat"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserTrackStat_userId_createdAt_idx" ON "UserTrackStat"("userId", "createdAt");

ALTER TABLE "User" ADD COLUMN "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false;

-- backfill: any existing user with at least one rating across tracks/albums/artists
-- has already engaged with the rating action and shouldn't be sent through onboarding
UPDATE "User"
SET "hasCompletedOnboarding" = true
WHERE "id" IN (
    SELECT "userId" FROM "UserTrackStat" WHERE "rating" IS NOT NULL
    UNION
    SELECT "userId" FROM "UserAlbumStat" WHERE "rating" IS NOT NULL
    UNION
    SELECT "userId" FROM "UserArtistStat" WHERE "rating" IS NOT NULL
);
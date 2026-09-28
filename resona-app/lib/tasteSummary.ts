import 'server-only';

import { prisma } from '@/lib/prisma';
import type { EntityType } from '@/lib/constants/profilePrompts';

const RECENT_TENS_LIMIT = 5;
const HIGH_SCORE = 8;

export interface RecentTen {
    type: EntityType;
    spotifyId: string;
    name: string;
    subtitle: string;
    imageUrl: string | null;
}

export interface TasteSummary {
    totalRatings: number;
    counts: Record<EntityType, number>;
    // index is the score (0–10), value is how many ratings gave it
    distribution: number[];
    average: number | null;
    // share of ratings at HIGH_SCORE or above, from 0 to 1
    highShare: number;
    lowestScore: number | null;
    topArtist: { name: string; spotifyId: string } | null;
    recentTens: RecentTen[];
}

type ArtistNames = { artists: { artist: { name: string } }[] };

function joinArtistNames({ artists }: ArtistNames): string {
    return artists.map(({ artist }) => artist.name).join(', ') || 'Unknown artist';
}

async function getRatingCounts(userId: string) {
    const where = { userId, rating: { not: null } };
    const [tracks, albums, artists] = await Promise.all([
        prisma.userTrackStat.groupBy({ by: ['rating'], where, _count: { _all: true } }),
        prisma.userAlbumStat.groupBy({ by: ['rating'], where, _count: { _all: true } }),
        prisma.userArtistStat.groupBy({ by: ['rating'], where, _count: { _all: true } }),
    ]);
    return { track: tracks, album: albums, artist: artists };
}

// artist credited on the most rated tracks, ties go to the higher average score
async function getTopArtist(userId: string) {
    const rows = await prisma.$queryRaw<{ name: string; spotifyId: string }[]>`
        SELECT a."name", a."spotifyId"
        FROM "UserTrackStat" s
        JOIN "TrackArtist" ta ON ta."trackId" = s."trackId"
        JOIN "Artist" a ON a."id" = ta."artistId"
        WHERE s."userId" = ${userId} AND s."rating" IS NOT NULL
        GROUP BY a."id", a."name", a."spotifyId"
        ORDER BY COUNT(*) DESC, AVG(s."rating") DESC, a."name" ASC
        LIMIT 1
    `;
    return rows[0] ?? null;
}

// newest 10s across all three types; each table's top few is enough to find the overall top few
async function getRecentTens(userId: string): Promise<RecentTen[]> {
    const where = { userId, rating: 10 };
    const orderBy = { updatedAt: 'desc' } as const;
    const artistNames = { select: { artist: { select: { name: true } } } };

    const [tracks, albums, artists] = await Promise.all([
        prisma.userTrackStat.findMany({
            where, orderBy, take: RECENT_TENS_LIMIT,
            select: { updatedAt: true, track: { select: { spotifyId: true, name: true, album: { select: { imageUrl: true } }, artists: artistNames } } },
        }),
        prisma.userAlbumStat.findMany({
            where, orderBy, take: RECENT_TENS_LIMIT,
            select: { updatedAt: true, album: { select: { spotifyId: true, name: true, imageUrl: true, artists: artistNames } } },
        }),
        prisma.userArtistStat.findMany({
            where, orderBy, take: RECENT_TENS_LIMIT,
            select: { updatedAt: true, artist: { select: { spotifyId: true, name: true, imageUrl: true } } },
        }),
    ]);

    const merged = [
        ...tracks.map(({ updatedAt, track }) => ({
            ratedAt: updatedAt,
            item: { type: 'track' as const, spotifyId: track.spotifyId, name: track.name, subtitle: joinArtistNames(track), imageUrl: track.album?.imageUrl ?? null },
        })),
        ...albums.map(({ updatedAt, album }) => ({
            ratedAt: updatedAt,
            item: { type: 'album' as const, spotifyId: album.spotifyId, name: album.name, subtitle: joinArtistNames(album), imageUrl: album.imageUrl },
        })),
        ...artists.map(({ updatedAt, artist }) => ({
            ratedAt: updatedAt,
            item: { type: 'artist' as const, spotifyId: artist.spotifyId, name: artist.name, subtitle: 'Artist', imageUrl: artist.imageUrl },
        })),
    ];

    return merged
        .sort((a, b) => b.ratedAt.getTime() - a.ratedAt.getTime())
        .slice(0, RECENT_TENS_LIMIT)
        .map(({ item }) => item);
}

// everything the Your Taste panel shows, null when the queries fail
export async function getTasteSummary(userId: string): Promise<TasteSummary | null> {
    try {
        const [ratingCounts, topArtist, recentTens] = await Promise.all([
            getRatingCounts(userId),
            getTopArtist(userId),
            getRecentTens(userId),
        ]);

        const distribution = Array<number>(11).fill(0);
        const counts: Record<EntityType, number> = { track: 0, album: 0, artist: 0 };
        for (const type of ['track', 'album', 'artist'] as const) {
            for (const { rating, _count } of ratingCounts[type]) {
                if (rating === null) continue;
                distribution[rating] += _count._all;
                counts[type] += _count._all;
            }
        }

        const totalRatings = counts.track + counts.album + counts.artist;
        const scoreSum = distribution.reduce((sum, count, score) => sum + count * score, 0);
        const highCount = distribution.slice(HIGH_SCORE).reduce((sum, count) => sum + count, 0);
        const lowestScore = distribution.findIndex((count) => count > 0);

        return {
            totalRatings,
            counts,
            distribution,
            average: totalRatings > 0 ? scoreSum / totalRatings : null,
            highShare: totalRatings > 0 ? highCount / totalRatings : 0,
            lowestScore: lowestScore === -1 ? null : lowestScore,
            topArtist,
            recentTens,
        };
    } catch (error) {
        console.error('Failed to load taste summary:', error);
        return null;
    }
}

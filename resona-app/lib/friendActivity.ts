import 'server-only';

import { prisma } from '@/lib/prisma';
import type { EntityType } from '@/lib/constants/profilePrompts';
import { joinArtistNames } from '@/lib/utils/artists';

const FRIEND_LIMIT = 20;

export interface FriendRating {
    postId: string;
    user: { id: string; name: string | null; image: string | null };
    type: EntityType;
    spotifyId: string;
    title: string;
    subtitle: string;
    rating: number;
}

export interface FriendActivity {
    followsAnyone: boolean;
    ratings: FriendRating[];
}

// newest post from each followed user, most recent first
async function getLatestPostIds(viewerId: string): Promise<string[]> {
    // DISTINCT ON keeps the first row per user, so the inner order picks each user's newest post
    const rows = await prisma.$queryRaw<{ id: string }[]>`
        SELECT latest."id"
        FROM (
            SELECT DISTINCT ON (p."userId") p."id", p."createdAt"
            FROM "Post" p
            JOIN "UserFollow" f ON f."followingId" = p."userId"
            WHERE f."followerId" = ${viewerId} AND p."rating" IS NOT NULL
            ORDER BY p."userId", p."createdAt" DESC, p."id" DESC
        ) latest
        ORDER BY latest."createdAt" DESC
        LIMIT ${FRIEND_LIMIT}
    `;
    return rows.map((row) => row.id);
}

// latest rating from each person the viewer follows, null when the queries fail
export async function getFriendActivity(viewerId: string): Promise<FriendActivity | null> {
    try {
        const postIds = await getLatestPostIds(viewerId);

        if (postIds.length === 0) {
            const followCount = await prisma.userFollow.count({ where: { followerId: viewerId } });
            return { followsAnyone: followCount > 0, ratings: [] };
        }

        const artistNames = { select: { artist: { select: { name: true } } } };
        const posts = await prisma.post.findMany({
            where: { id: { in: postIds } },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            select: {
                id: true,
                rating: true,
                user: { select: { id: true, name: true, image: true } },
                track: { select: { spotifyId: true, name: true, artists: artistNames } },
                album: { select: { spotifyId: true, name: true, artists: artistNames } },
                artist: { select: { spotifyId: true, name: true } },
            },
        });

        const ratings = posts.flatMap(({ id, rating, user, track, album, artist }): FriendRating[] => {
            if (rating === null) return [];
            if (track) return [{ postId: id, user, rating, type: 'track', spotifyId: track.spotifyId, title: track.name, subtitle: joinArtistNames(track) }];
            if (album) return [{ postId: id, user, rating, type: 'album', spotifyId: album.spotifyId, title: album.name, subtitle: joinArtistNames(album) }];
            if (artist) return [{ postId: id, user, rating, type: 'artist', spotifyId: artist.spotifyId, title: artist.name, subtitle: 'Artist' }];
            return [];
        });

        return { followsAnyone: true, ratings };
    } catch (error) {
        console.error('Failed to load friend activity:', error);
        return null;
    }
}

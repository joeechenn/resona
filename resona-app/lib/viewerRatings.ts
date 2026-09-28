import 'server-only';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { EntityType } from '@/lib/constants/profilePrompts';

function findViewerStat(type: EntityType, userId: string, spotifyId: string) {
    const select = { rating: true } as const;

    switch (type) {
        case 'track':
            return prisma.userTrackStat.findFirst({ where: { userId, track: { spotifyId } }, select });
        case 'album':
            return prisma.userAlbumStat.findFirst({ where: { userId, album: { spotifyId } }, select });
        case 'artist':
            return prisma.userArtistStat.findFirst({ where: { userId, artist: { spotifyId } }, select });
    }
}

interface RatablePost {
    userId: string;
    trackId: string | null;
    albumId: string | null;
    artistId: string | null;
}

export interface ViewerRatingFields {
    isOwnPost: boolean;
    viewerRating: number | null;
}

// unique non-null ids of one entity column across the posts
function collectIds(posts: RatablePost[], key: 'trackId' | 'albumId' | 'artistId'): string[] {
    return [...new Set(posts.map((post) => post[key]).filter((id): id is string => id !== null))];
}

// adds the viewer's own rating of each post's item, with at most one query per entity type
export async function withViewerRatings<T extends RatablePost>(viewerId: string, posts: T[]): Promise<(T & ViewerRatingFields)[]> {
    // the viewer's own posts already show their rating, so only look up everyone else's items
    const otherPosts = posts.filter((post) => post.userId !== viewerId);
    const trackIds = collectIds(otherPosts, 'trackId');
    const albumIds = collectIds(otherPosts, 'albumId');
    const artistIds = collectIds(otherPosts, 'artistId');

    const [trackStats, albumStats, artistStats] = await Promise.all([
        trackIds.length > 0
            ? prisma.userTrackStat.findMany({ where: { userId: viewerId, trackId: { in: trackIds } }, select: { trackId: true, rating: true } })
            : [],
        albumIds.length > 0
            ? prisma.userAlbumStat.findMany({ where: { userId: viewerId, albumId: { in: albumIds } }, select: { albumId: true, rating: true } })
            : [],
        artistIds.length > 0
            ? prisma.userArtistStat.findMany({ where: { userId: viewerId, artistId: { in: artistIds } }, select: { artistId: true, rating: true } })
            : [],
    ]);

    // keyed by type too, so a track and an album can never collide
    const ratings = new Map<string, number | null>([
        ...trackStats.map((stat) => [`track:${stat.trackId}`, stat.rating] as const),
        ...albumStats.map((stat) => [`album:${stat.albumId}`, stat.rating] as const),
        ...artistStats.map((stat) => [`artist:${stat.artistId}`, stat.rating] as const),
    ]);

    return posts.map((post) => {
        const key = post.trackId ? `track:${post.trackId}` : post.albumId ? `album:${post.albumId}` : `artist:${post.artistId}`;
        return {
            ...post,
            isOwnPost: post.userId === viewerId,
            viewerRating: ratings.get(key) ?? null,
        };
    });
}

// signed-in viewer's saved rating for one catalog item, null when unrated or signed out
export async function getViewerRating(type: EntityType, spotifyId: string): Promise<number | null> {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return null;

    try {
        const stat = await findViewerStat(type, userId, spotifyId);
        // 0 is a real rating, so only a missing row or null rating counts as unrated
        return stat?.rating ?? null;
    } catch (error) {
        console.error('Failed to load viewer rating:', error);
        return null;
    }
}

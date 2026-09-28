import 'server-only';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

const POST_SCAN_LIMIT = 80;
const COVER_LIMIT = 40;
const CACHE_SECONDS = 600;

export interface LoginCover {
    imageUrl: string;
    rating: number;
}

async function fetchRecentCovers(): Promise<LoginCover[]> {
    // login page is public, so select artwork + score only, never user fields
    const posts = await prisma.post.findMany({
        where: {
            rating: { not: null },
            OR: [
                { track: { album: { imageUrl: { not: null } } } },
                { album: { imageUrl: { not: null } } },
            ],
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: POST_SCAN_LIMIT,
        select: {
            rating: true,
            track: { select: { album: { select: { imageUrl: true } } } },
            album: { select: { imageUrl: true } },
        },
    });

    // one tile per artwork, keeping the most recent rating
    const covers = new Map<string, LoginCover>();
    for (const post of posts) {
        const imageUrl = post.track?.album?.imageUrl ?? post.album?.imageUrl;
        if (!imageUrl || post.rating === null || covers.has(imageUrl)) continue;

        covers.set(imageUrl, { imageUrl, rating: post.rating });
        if (covers.size === COVER_LIMIT) break;
    }

    return [...covers.values()];
}

const getCachedCovers = unstable_cache(fetchRecentCovers, ['login-covers'], {
    revalidate: CACHE_SECONDS,
    tags: ['login-covers'],
});

export async function getLoginCovers(): Promise<LoginCover[]> {
    // failures aren't cached, and the login page should still render without a background
    try {
        return await getCachedCovers();
    } catch (error) {
        console.error('Failed to load login covers:', error);
        return [];
    }
}

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

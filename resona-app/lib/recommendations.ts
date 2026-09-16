import 'server-only';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Keep aligned with MIN_RATINGS in the Python service. Real zeros are currently
// excluded from training/eligibility, but always excluded from recommendations.
export const MIN_RECOMMENDATION_RATINGS = 15;
const CANDIDATE_LIMIT = 30;
const DISPLAY_LIMIT = 10;
const SERVICE_TIMEOUT_MS = 3000;

type ItemType = 'track' | 'album' | 'artist';
interface ServiceItem {
    item_type: ItemType;
    item_id: string;
    score: number;
}
interface ServiceResponse {
    user_id: string;
    recommendations: ServiceItem[];
    reason: 'insufficient_ratings' | 'no_candidates' | null;
}
export interface RecommendedItem {
    id: string;
    itemType: ItemType;
    name: string;
    imageUrl: string | null;
    subtitle: string;
    href: string;
}
export interface RecommendationResult {
    status: 'ready' | 'insufficient_ratings' | 'awaiting_training' | 'empty' | 'unavailable' | 'signed_out';
    items: RecommendedItem[];
    qualifyingRatings?: number;
}

function isServiceResponse(value: unknown, userId: string): value is ServiceResponse {
    if (!value || typeof value !== 'object') return false;
    const response = value as Partial<ServiceResponse>;
    if (response.user_id !== userId || !Array.isArray(response.recommendations)
        || response.recommendations.length > CANDIDATE_LIMIT
        || (response.reason !== null && response.reason !== 'insufficient_ratings' && response.reason !== 'no_candidates')) return false;
    if (response.reason !== null && response.recommendations.length !== 0) return false;
    return response.recommendations.every((item: unknown) => {
        if (!item || typeof item !== 'object') return false;
        const candidate = item as Partial<ServiceItem>;
        return ['track', 'album', 'artist'].includes(candidate.item_type ?? '')
            && typeof candidate.item_id === 'string' && candidate.item_id.trim().length > 0
            && typeof candidate.score === 'number' && Number.isFinite(candidate.score)
            && candidate.score >= 0 && candidate.score <= 10;
    });
}

async function fetchCandidates(userId: string): Promise<ServiceResponse | 'unknown_user'> {
    const baseUrl = process.env.RECOMMENDATION_SERVICE_URL?.trim();
    const token = process.env.RECOMMENDATION_SERVICE_TOKEN?.trim();
    if (!baseUrl || !token) throw new Error('Recommendation service is not configured');
    const url = new URL(`${baseUrl.replace(/\/+$/, '')}/recommendations/${encodeURIComponent(userId)}`);
    url.searchParams.set('top_n', String(CANDIDATE_LIMIT));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SERVICE_TIMEOUT_MS);
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
            redirect: 'error',
            signal: controller.signal,
        });
        if (response.status === 404) return 'unknown_user';
        if (!response.ok) throw new Error('Recommendation service request failed');
        const body: unknown = await response.json();
        if (!isServiceResponse(body, userId)) throw new Error('Invalid recommendation response');
        return body;
    } finally {
        clearTimeout(timeout);
    }
}

export async function getRecommendations(): Promise<RecommendationResult> {
    try {
        // no caller-supplied user ID: identity always comes from the server session
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) return { status: 'signed_out', items: [] };

        const where = { userId, rating: { gt: 0 } };
        const counts = await Promise.all([
            prisma.userTrackStat.count({ where }),
            prisma.userAlbumStat.count({ where }),
            prisma.userArtistStat.count({ where }),
        ]);
        const qualifyingRatings = counts.reduce((sum, count) => sum + count, 0);
        if (qualifyingRatings < MIN_RECOMMENDATION_RATINGS) {
            return { status: 'insufficient_ratings', items: [], qualifyingRatings };
        }

        const response = await fetchCandidates(userId);
        if (response === 'unknown_user' || response.reason === 'insufficient_ratings') {
            return { status: 'awaiting_training', items: [] };
        }
        if (response.recommendations.length === 0) return { status: 'empty', items: [] };

        // types namespace internal IDs; retain service ranking and drop duplicates
        const unique = new Map<string, ServiceItem>();
        for (const item of response.recommendations) {
            const key = `${item.item_type}:${item.item_id}`;
            if (!unique.has(key)) unique.set(key, item);
        }
        const candidates = [...unique.values()];
        const ids = (type: ItemType) => candidates.filter(item => item.item_type === type).map(item => item.item_id);
        const trackIds = ids('track');
        const albumIds = ids('album');
        const artistIds = ids('artist');
        // these relation filters consult CURRENT ratings after the service call
        // a genuine 0/10 is rated; a null stat (e.g. listening activity) is not
        const ratedByViewer = { userId, rating: { not: null } };
        const [tracks, albums, artists] = await Promise.all([
            trackIds.length ? prisma.track.findMany({
                where: { id: { in: trackIds }, userTrackStats: { none: ratedByViewer } },
                select: {
                    id: true, spotifyId: true, name: true,
                    album: { select: { imageUrl: true } },
                    artists: { select: { artist: { select: { name: true } } } },
                },
            }) : [],
            albumIds.length ? prisma.album.findMany({
                where: { id: { in: albumIds }, userAlbumStats: { none: ratedByViewer } },
                select: {
                    id: true, spotifyId: true, name: true, imageUrl: true,
                    artists: { select: { artist: { select: { name: true } } } },
                },
            }) : [],
            artistIds.length ? prisma.artist.findMany({
                where: { id: { in: artistIds }, userArtistStats: { none: ratedByViewer } },
                select: { id: true, spotifyId: true, name: true, imageUrl: true },
            }) : [],
        ]);

        const catalog = new Map<string, RecommendedItem>();
        for (const track of tracks) {
            catalog.set(`track:${track.id}`, {
                id: track.id, itemType: 'track', name: track.name,
                imageUrl: track.album?.imageUrl ?? null,
                subtitle: ['Track', ...track.artists.map(link => link.artist.name)].join(' · '),
                href: `/track/${encodeURIComponent(track.spotifyId)}`,
            });
        }
        for (const album of albums) {
            catalog.set(`album:${album.id}`, {
                id: album.id, itemType: 'album', name: album.name, imageUrl: album.imageUrl,
                subtitle: ['Album', ...album.artists.map(link => link.artist.name)].join(' · '),
                href: `/album/${encodeURIComponent(album.spotifyId)}`,
            });
        }
        for (const artist of artists) {
            catalog.set(`artist:${artist.id}`, {
                id: artist.id, itemType: 'artist', name: artist.name, imageUrl: artist.imageUrl,
                subtitle: 'Artist', href: `/artist/${encodeURIComponent(artist.spotifyId)}`,
            });
        }
        const items = candidates.flatMap(candidate => {
            const item = catalog.get(`${candidate.item_type}:${candidate.item_id}`);
            return item ? [item] : [];
        }).slice(0, DISPLAY_LIMIT);
        return { status: items.length ? 'ready' : 'empty', items };
    } catch {
        // do not log URLs, tokens, rating history, or raw upstream errors
        console.error('Recommendations could not be loaded.');
        return { status: 'unavailable', items: [] };
    }
}

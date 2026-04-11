import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { auth } from '@/auth';
import { getTopTracks, getTopArtists, getRecentlyPlayed } from "@/lib/spotify";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        // fetch all three Spotify sources in parallel
        const [topTracks, topArtists, recentlyPlayed] = await Promise.all([
            getTopTracks(userId),
            getTopArtists(userId),
            getRecentlyPlayed(userId)
        ]);

        // all null means Spotify isn't connected
        if (!topTracks && !topArtists && !recentlyPlayed) {
            return NextResponse.json({ error: 'Spotify not connected' }, { status: 400 });
        }

        // collect all spotifyIds, tracks + recently played share the same shape
        const trackIds = topTracks?.map(track => track.id) ?? [];
        const recentIds = recentlyPlayed?.map(track => track.id) ?? [];
        const allTrackIds = [...trackIds, ...recentIds];
        const allArtistIds = topArtists?.map(artist => artist.id) ?? [];

        // find which items the user already rated, one query per entity type
        const [ratedTracks, ratedArtists] = await Promise.all([
            prisma.userTrackStat.findMany({
                where: {
                    userId,
                    track: { spotifyId: { in: allTrackIds } }
                },
                select: { track: { select: { spotifyId: true } } }
            }),
            prisma.userArtistStat.findMany({
                where: {
                    userId,
                    artist: { spotifyId: { in: allArtistIds } }
                },
                select: { artist: { select: { spotifyId: true } } }
            })
        ]);

        // build sets for O(1) lookup, filter out already-rated items
        const ratedTrackIds = new Set(ratedTracks.map(s => s.track.spotifyId));
        const ratedArtistIds = new Set(ratedArtists.map(s => s.artist.spotifyId));

        const filteredTracks = topTracks?.filter(t => !ratedTrackIds.has(t.id)) ?? [];
        const filteredArtists = topArtists?.filter(a => !ratedArtistIds.has(a.id)) ?? [];
        const filteredRecent = recentlyPlayed?.filter(t => !ratedTrackIds.has(t.id)) ?? [];

        return NextResponse.json({
            topTracks: filteredTracks,
            topArtists: filteredArtists,
            recentlyPlayed: filteredRecent
        });
    } catch (error) {
        console.error('Error fetching discover data:', error);
        return NextResponse.json({ error: 'Failed to fetch discover data' }, { status: 500 });
    }
}
'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import DiscoverSection from './DiscoverSection';
import DiscoverCard from './DiscoverCard';

interface SpotifyTrack {
    id: string;
    name: string;
    artists: Array<{ id: string; name: string }>;
    album: {
        id: string;
        name: string;
        images: Array<{ url: string }>;
    };
}

interface SpotifyArtist {
    id: string;
    name: string;
    images: Array<{ url: string }>;
}

interface DiscoverData {
    topTracks: SpotifyTrack[];
    topArtists: SpotifyArtist[];
    recentlyPlayed: SpotifyTrack[];
}

export default function Discover({ recommendations }: { recommendations: React.ReactNode }) {
    const [data, setData] = useState<DiscoverData | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchDiscover = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch('/api/discover', { signal });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));

                // Spotify not connected, distinct from a real error
                if (response.status === 400 && body.error === 'Spotify not connected') {
                    setErrorMessage('spotify_not_connected');
                    return;
                }

                setErrorMessage('Failed to load discover data. Please try again.');
                return;
            }

            const result = await response.json();
            setData(result);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            setErrorMessage('Network error while loading discover data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchDiscover(controller.signal);
        return () => controller.abort();
    }, [fetchDiscover]);

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-lg bg-card p-4 xl:p-5 2xl:p-6">
            <div className="mb-5 2xl:mb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-white 2xl:text-4xl">Discover</h1>
                <p className="mt-1 max-w-5xl text-sm leading-relaxed text-muted-foreground 2xl:text-base">
                    Discover music through your Resona ratings and your listening history.
                </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {recommendations}

            {/* loading skeleton */}
            {loading && (
                <div className="space-y-0">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="mb-2 rounded-2xl border border-border bg-surface px-4 py-4 2xl:px-6">
                            <div className="h-5 w-32 bg-muted rounded animate-pulse mb-3" />
                            <div className="discover-grid">
                                {Array.from({ length: i === 2 ? 10 : 6 }).map((_, j) => (
                                    <div key={j} className="min-w-0">
                                        <div className="w-full aspect-square bg-muted rounded-lg animate-pulse" />
                                        <div className="h-4 w-3/4 bg-muted rounded animate-pulse mt-2" />
                                        <div className="h-3 w-1/2 bg-muted rounded animate-pulse mt-1" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Spotify not connected prompt */}
            {!loading && errorMessage === 'spotify_not_connected' && (
                <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
                    <h2 className="text-2xl font-bold text-white">
                        Connect Spotify to see your top tracks, artists, and recent listening.
                    </h2>
                    <a
                        href="/api/spotify/connect"
                        className="mt-6 inline-flex items-center gap-3 rounded-md border border-border bg-background px-5 py-3 text-sm font-medium text-white hover:bg-card transition-colors"
                    >
                        <Image
                            src="/spotify.svg"
                            alt="Spotify"
                            width={20}
                            height={20}
                        />
                        Connect with Spotify
                    </a>
                </div>
            )}

            {/* generic error */}
            {!loading && errorMessage && errorMessage !== 'spotify_not_connected' && (
                <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                    <p className="text-red-400 font-semibold">{errorMessage}</p>
                    <button
                        onClick={() => fetchDiscover()}
                        className="px-5 py-2 rounded-md border border-border bg-background text-white hover:bg-muted transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* discover sections */}
            {!loading && !errorMessage && data && (
                <div className="space-y-0">
                    <DiscoverSection
                        title="Top Tracks"
                        isEmpty={data.topTracks.length === 0}
                        emptyMessage="You've rated all your top tracks. Picky listener — we respect it."
                    >
                        {data.topTracks.map((track) => (
                            <DiscoverCard
                                key={track.id}
                                id={track.id}
                                name={track.name}
                                imageUrl={track.album?.images?.[0]?.url ?? null}
                                subtitle={track.artists.map(a => a.name).join(', ')}
                                href={`/track/${track.id}`}
                            />
                        ))}
                    </DiscoverSection>

                    <DiscoverSection
                        title="Top Artists"
                        isEmpty={data.topArtists.length === 0}
                        emptyMessage="All your top artists have been judged. No one is safe."
                    >
                        {data.topArtists.map((artist) => (
                            <DiscoverCard
                                key={artist.id}
                                id={artist.id}
                                name={artist.name}
                                imageUrl={artist.images?.[0]?.url ?? null}
                                href={`/artist/${artist.id}`}
                                rounded
                            />
                        ))}
                    </DiscoverSection>

                    <DiscoverSection
                        title="Recently Played"
                        isEmpty={data.recentlyPlayed.length === 0}
                        emptyMessage="Already rated your recent plays. Go listen to something new... we'll wait."
                    >
                        {data.recentlyPlayed.map((track, index) => (
                            <DiscoverCard
                                key={`${track.id}-${index}`}
                                id={track.id}
                                name={track.name}
                                imageUrl={track.album?.images?.[0]?.url ?? null}
                                subtitle={track.artists.map(a => a.name).join(', ')}
                                href={`/track/${track.id}`}
                            />
                        ))}
                    </DiscoverSection>
                </div>
            )}
            </div>
        </div>
    );
}

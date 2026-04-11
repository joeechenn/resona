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

export default function Discover() {
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
        <div className="flex-1 bg-neutral-800 rounded-lg p-6 flex flex-col min-h-0">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Discover</h1>
                <p className="text-neutral-400 text-sm mt-1">
                    Tracks and artists you&apos;ve been listening to but haven&apos;t rated yet. Show the world what you truly think!
                </p>
            </div>

            {/* loading skeleton */}
            {loading && (
                <div className="overflow-y-auto flex-1 pr-1">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="mb-4 rounded-2xl border border-neutral-700/60 bg-neutral-800/35 px-6 py-4">
                            <div className="h-5 w-32 bg-neutral-700 rounded animate-pulse mb-3" />
                            <div className="flex flex-wrap gap-4">
                                {Array.from({ length: i === 2 ? 10 : 5 }).map((_, j) => (
                                    <div key={j} className="w-[164px]">
                                        <div className="w-full aspect-square bg-neutral-700/50 rounded-lg animate-pulse" />
                                        <div className="h-4 w-3/4 bg-neutral-700/50 rounded animate-pulse mt-2" />
                                        <div className="h-3 w-1/2 bg-neutral-700/50 rounded animate-pulse mt-1" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Spotify not connected prompt */}
            {!loading && errorMessage === 'spotify_not_connected' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                    <h2 className="text-2xl font-bold text-white">
                        Connect your Spotify account to get more features like this one!
                    </h2>
                    <a
                        href="/api/spotify/connect"
                        className="mt-6 inline-flex items-center gap-3 rounded-md border border-neutral-700 bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
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
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                    <p className="text-red-400 font-semibold">{errorMessage}</p>
                    <button
                        onClick={() => fetchDiscover()}
                        className="px-5 py-2 rounded-md border border-neutral-600 bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* discover sections */}
            {!loading && !errorMessage && data && (
                <div className="overflow-y-auto flex-1 pr-1 space-y-0">
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
    );
}

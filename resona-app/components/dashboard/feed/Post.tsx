'use client';

import { Heart, MessageCircle, Share2 } from 'lucide-react';

export interface PostProps {
    id: string;
    userId: string;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };

    track: {
        id: string;
        name: string;
        spotifyId: string;
        durationMs: number;
        album: {
            imageUrl: string;
            name: string;
            _count: {
                tracks: number;
            }
        } | null;
        artists: Array<{
            artist: {
                id: string;
                name: string;
            };
        }>;
    } | null;

    album: {
        id: string;
        name: string;
        spotifyId: string;
        imageUrl: string | null;
        releaseDate: string | null;
        totalTracks: number | null;
        artists: Array<{
            artist: {
                id: string;
                name: string;
            };
        }>;
    } | null;

    artist: {
        id: string;
        name: string;
        spotifyId: string;
        imageUrl: string | null;
    } | null;

    rating: number | null;
    createdAt: string;
}

function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getYear(dateString: string | null): string | null {
    if (!dateString) return null;
    return new Date(dateString).getFullYear().toString();
}

function formatRelativeTime(dateString: string): string {
    const now = Date.now();
    const created = new Date(dateString).getTime();
    const diffMinutes = Math.floor((now - created) / (1000 * 60));

    if (diffMinutes < 60) return `${Math.max(1, diffMinutes)}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

function ratingColorClass(rating: number | null): string {
    if (rating === null) return 'text-neutral-300';
    if (rating <= 4) return 'text-red-400';
    if (rating <= 7) return 'text-yellow-300';
    return 'text-green-400';
}

export default function PostCard({ user, track, album, artist, rating, createdAt }: PostProps) {
    const entityName = track?.name || album?.name || artist?.name || 'Unknown';
    const userDisplayName = user.name || 'Anonymous';
    const userInitial = userDisplayName.charAt(0).toUpperCase();
    const relativeTime = formatRelativeTime(createdAt);
    const ratingDisplay = rating === null ? '-' : `${rating}`;

    const trackArtistNames = track?.artists.map((ta) => ta.artist.name).join(', ') || null;
    const albumYear = album ? getYear(album.releaseDate) : null;

    return (
        <article className="rounded-2xl border border-neutral-700/60 bg-neutral-800/35 px-4 py-3">
            {/* top section */}
            <div className="mb-3 flex items-center gap-3">
                {/* user avatar */}
                {user.image ? (
                    <img
                        src={user.image}
                        alt={userDisplayName}
                        className="h-9 w-9 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-700 text-sm font-semibold text-white">
                        {userInitial}
                    </div>
                )}

                <div className="text-sm text-neutral-300">
                    <span className="font-bold text-white">{userDisplayName}</span>
                    <span className="mx-1 text-neutral-400">ranked</span>
                    <span className="font-bold text-white">{entityName}</span>
                    <span className="mx-2 text-neutral-500">•</span>
                    <span className="text-neutral-400">{relativeTime}</span>
                </div>
            </div>

            {/* middle section (varies by entity type) */}
            <div className="mb-3 flex items-center justify-between rounded-xl bg-neutral-700/65 px-3 py-3 ml-10">
                <div className="min-w-0 flex items-center gap-3">
                    {/* artwork */}
                    {(track?.album?.imageUrl || album?.imageUrl || artist?.imageUrl) ? (
                        <img
                            src={track?.album?.imageUrl || album?.imageUrl || artist?.imageUrl || ''}
                            alt={entityName}
                            className={`h-15 w-15 object-cover ${artist ? 'rounded-full' : 'rounded-md'}`}
                        />
                    ) : (
                        <div className={`h-15 w-15 bg-neutral-700 ${artist ? 'rounded-full' : 'rounded-md'}`} />
                    )}

                    {/* details */}
                    <div className="min-w-0">
                        {track && (
                            <>
                                <p className="truncate text-l font-extrabold text-white leading-tight">{track.name}</p>
                                <p className="truncate text-sm text-neutral-400">{trackArtistNames || 'Unknown artist'}</p>
                                {/* tags */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="rounded-md bg-black px-2 py-1 text-xs font-semibold text-white">
                                        {formatDuration(track.durationMs)}
                                    </span>
                                </div>
                            </>
                        )}

                        {album && (
                            <>
                                <p className="truncate text-l font-extrabold text-white leading-tight">{album.name}</p>
                                <p className="truncate text-sm text-neutral-400">{album.artists.map((a) => a.artist.name).join(', ') || 'Unknown artist'}</p>
                                {/* tags */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {albumYear && (
                                        <span className="rounded-md bg-black px-2 py-1 text-xs font-semibold text-white">
                                            {albumYear}
                                        </span>
                                    )}
                                    <span className="rounded-md bg-black px-2 py-1 text-xs font-semibold text-white">
                                        {album.totalTracks} songs
                                    </span>
                                </div>
                            </>
                        )}

                        {artist && (
                            <>
                                <p className="truncate text-l font-extrabold text-white leading-tight">{artist.name}</p>
                                <p className="truncate text-sm text-neutral-400">Artist</p>
                            </>
                        )}
                    </div>
                </div>

                {/* rating circle */}
                <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-400">
                    <span className={`text-2xl font-bold ${ratingColorClass(rating)}`}>{ratingDisplay}</span>
                </div>
            </div>

            {/* bottom section */}
            <div className="flex items-center gap-7 pl-12 text-sm">
                {/* TODO: wire up like/comment counts and actions */}
                <div className="flex items-center gap-2 text-pink-400">
                    <Heart size={18} />
                    <span className="font-semibold text-white">0</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                    <MessageCircle size={18} />
                    <span className="font-semibold text-white">0</span>
                </div>
                <button className="text-neutral-300 hover:text-white">
                    <Share2 size={18} />
                </button>
            </div>
        </article>
    );
}

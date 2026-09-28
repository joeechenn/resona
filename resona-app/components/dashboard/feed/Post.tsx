'use client';

import { Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { formatTimestamp, formatDuration, getYear } from '@/lib/utils/timeUtils';
import CommentSection from './CommentSection';
import ScoreBadge from '@/components/ScoreBadge';
import RatingModal from '@/components/RatingModal';
import type { EntityType } from '@/lib/constants/profilePrompts';

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
                spotifyId: string;
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
                spotifyId: string;
            };
        }>;
    } | null;

    artist: {
        id: string;
        name: string;
        spotifyId: string;
        imageUrl: string | null;
    } | null;

    _count: {
        likes: number;
        comments: number;
    };

    likes: Array<{
        userId: string;
        postId: string;
    }>;

    rating: number | null;
    createdAt: string;

    // only sent by the feed; cards without them skip the Rate It control
    isOwnPost?: boolean;
    viewerRating?: number | null;
}

type ArtistCredit = NonNullable<PostProps['track']>['artists'][number];

interface PostEntity {
    spotifyId: string;
    href: string;
    name: string;
    imageUrl: string | null;
    meta: string;
    type: EntityType;
    artists: ArtistCredit[] | null;
}

// normalize whichever entity the post rates into one display shape
function getPostEntity({ track, album, artist }: Pick<PostProps, 'track' | 'album' | 'artist'>): PostEntity | null {
    if (track) {
        return {
            spotifyId: track.spotifyId,
            href: `/track/${track.spotifyId}`,
            name: track.name,
            imageUrl: track.album?.imageUrl ?? null,
            meta: `Track · ${formatDuration(track.durationMs)}`,
            type: 'track',
            artists: track.artists,
        };
    }

    if (album) {
        const year = getYear(album.releaseDate);
        const songs = album.totalTracks ? `${album.totalTracks} ${album.totalTracks === 1 ? 'song' : 'songs'}` : null;
        return {
            spotifyId: album.spotifyId,
            href: `/album/${album.spotifyId}`,
            name: album.name,
            imageUrl: album.imageUrl,
            meta: ['Album', year, songs].filter(Boolean).join(' · '),
            type: 'album',
            artists: album.artists,
        };
    }

    if (artist) {
        return {
            spotifyId: artist.spotifyId,
            href: `/artist/${artist.spotifyId}`,
            name: artist.name,
            imageUrl: artist.imageUrl,
            meta: 'Artist',
            type: 'artist',
            artists: null,
        };
    }

    return null;
}

export default function PostCard({ id, user, track, album, artist, _count, likes, rating, createdAt, isOwnPost, viewerRating }: PostProps) {
    const userDisplayName = user.name || 'Anonymous';
    const userInitial = userDisplayName.charAt(0).toUpperCase();
    const timestamp = formatTimestamp(createdAt);
    const entity = getPostEntity({ track, album, artist });

    const [isLiked, setIsLiked] = useState(likes.length > 0);
    const [likeCount, setLikeCount] = useState(_count.likes);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [commentCount, setCommentCount] = useState(_count.comments);
    const [savedRating, setSavedRating] = useState(viewerRating);
    const [isRatingOpen, setIsRatingOpen] = useState(false);

    const handleLikeToggle = async () => {
        if (isLikeLoading) return;

        const previousIsLiked = isLiked;
        const previousLikeCount = likeCount;
        const nextIsLiked = !isLiked;
        const nextLikeCount = Math.max(0, likeCount + (nextIsLiked ? 1 : -1));

        setIsLiked(nextIsLiked);
        setLikeCount(nextLikeCount);
        setIsLikeLoading(true);

        try {
            const response = await fetch(`/api/post/${id}/like`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to toggle like');
            }

        } catch (error) {
            console.error('Failed to toggle like:', error);
            // rollback only on failure
            setIsLiked(previousIsLiked);
            setLikeCount(previousLikeCount);
        } finally {
            setIsLikeLoading(false);
        }
    };

    if (!entity) return null;

    const artworkShape = entity.type === 'artist' ? 'rounded-full' : 'rounded-lg';

    return (
        <article className="relative overflow-hidden rounded-xl border border-border/70 bg-surface px-4 pt-3.5 pb-3">
            {/* faint wash of the artwork across the whole card */}
            {entity.imageUrl && (
                <div
                aria-hidden
                className="pointer-events-none absolute -inset-24 bg-cover bg-center opacity-10 blur-[90px] saturate-[1.6]"
                style={{ backgroundImage: `url(${entity.imageUrl})` }}
                />
            )}

            <div className="relative">
                {/* top section */}
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Link href={`/profile/${user.id}`} className="shrink-0">
                        {user.image ? (
                            <img
                                src={user.image}
                                alt={userDisplayName}
                                className="h-7.5 w-7.5 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                                {userInitial}
                            </div>
                        )}
                    </Link>
                    <p className="min-w-0 truncate">
                        <Link href={`/profile/${user.id}`} className="font-bold text-foreground hover:underline">
                            {userDisplayName}
                        </Link>
                        {' '}rated &middot; {timestamp}
                    </p>
                </div>

                {/* middle section */}
                <div className="my-3 flex items-center gap-4">
                    <Link href={entity.href} className="shrink-0">
                        {entity.imageUrl ? (
                            <img
                                src={entity.imageUrl}
                                alt={entity.name}
                                className={`h-21 w-21 object-cover shadow-[0_10px_24px_-8px_rgba(0,0,0,0.7)] ${artworkShape}`}
                            />
                        ) : (
                            <div className={`h-21 w-21 bg-muted ${artworkShape}`} />
                        )}
                    </Link>

                    <div className="min-w-0 flex-1">
                        <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">{entity.meta}</p>
                        <p className="mt-0.5 truncate text-lg leading-tight font-extrabold text-foreground">
                            <Link href={entity.href} className="hover:underline">
                                {entity.name}
                            </Link>
                        </p>
                        {entity.artists && (
                            <p className="mt-0.5 truncate text-sm text-muted-foreground">
                                {entity.artists.length > 0 ? (
                                    entity.artists.map((credit, index) => (
                                        <span key={credit.artist.id}>
                                            {index > 0 && ', '}
                                            <Link href={`/artist/${credit.artist.spotifyId}`} className="hover:text-foreground hover:underline">
                                                {credit.artist.name}
                                            </Link>
                                        </span>
                                    ))
                                ) : (
                                    'Unknown artist'
                                )}
                            </p>
                        )}
                    </div>

                    <ScoreBadge rating={rating} className="h-14 w-14 text-2xl" />
                </div>

                {/* bottom section */}
                <div className="flex items-center gap-6 text-sm">
                    <button
                        onClick={handleLikeToggle}
                        disabled={isLikeLoading}
                        className={`flex items-center gap-1.5 ${isLiked ? 'text-pink-400' : 'text-muted-foreground hover:text-pink-400'} disabled:opacity-60`}
                    >
                        <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                        <span className="font-semibold">{likeCount}</span>
                    </button>
                    <button
                        onClick={() => setIsCommentsOpen((prev) => !prev)}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                        <MessageCircle size={18} />
                        <span className="font-semibold">{commentCount}</span>
                    </button>

                    {!isOwnPost && savedRating !== undefined && (
                        savedRating === null ? (
                            <button
                                onClick={() => setIsRatingOpen(true)}
                                className="ml-auto rounded-full border border-border px-3.5 py-1 text-xs font-bold text-foreground transition-colors hover:bg-muted"
                            >
                                Rate It
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsRatingOpen(true)}
                                aria-label={`You rated this ${savedRating}. Change your rating`}
                                className="ml-auto flex items-center gap-2 rounded-full bg-muted py-1 pr-1.5 pl-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                            >
                                You rated
                                <ScoreBadge rating={savedRating} className="h-5.5 w-5.5 text-[11px] ring-[1.5px]" />
                            </button>
                        )
                    )}
                </div>

                {isRatingOpen && (
                    <RatingModal
                        type={entity.type}
                        spotifyId={entity.spotifyId}
                        name={entity.name}
                        artist={entity.artists ? entity.artists.map((credit) => credit.artist.name).join(', ') : 'Artist'}
                        imageUrl={entity.imageUrl}
                        initialRating={savedRating}
                        isOpen
                        onClose={() => setIsRatingOpen(false)}
                        onSuccess={setSavedRating}
                    />
                )}

                {isCommentsOpen && <CommentSection postId={id} onCommentAdded={() => setCommentCount(prev => prev + 1)} />}
            </div>
        </article>
    );
}

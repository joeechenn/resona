'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import PostCard from './Post';
import type { PostProps } from './Post';

type FeedFilter = 'global' | 'following';

export default function Feed() {
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // tab filter, drives whether the feed query scopes to follows or stays global
    const [filter, setFilter] = useState<FeedFilter>('global');
    // null until the API reports it on the first following-page fetch
    const [followCount, setFollowCount] = useState<number | null>(null);

    // ref for the sentinel element at the bottom of the feed
    const sentinelRef = useRef<HTMLDivElement>(null);

    const fetchFeed = useCallback(async (signal?: AbortSignal, cursor?: string) => {
        // first page uses loading, subsequent pages use loadingMore
        if (cursor) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }
        setErrorMessage(null);

        try {
            // build url with optional cursor + filter params
            const params = new URLSearchParams();
            if (cursor) params.set('cursor', cursor);
            if (filter !== 'global') params.set('filter', filter);
            const url = `/api/feed${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await fetch(url, { signal });
            let data: { posts?: PostProps[]; hasMore?: boolean; error?: string; followCount?: number } = {};

            try {
                data = await response.json();
            } catch {
                // keep fallback message below when JSON parsing fails
            }

            if (!response.ok) {
                const fallback =
                    response.status === 503
                        ? 'Feed is temporarily unavailable. Please try again.'
                        : 'Failed to load feed. Please try again.';
                setErrorMessage(
                    typeof data === 'object' && data && 'error' in data && data.error ? data.error : fallback
                );
                return;
            }

            if (data.posts && Array.isArray(data.posts)) {
                // append to existing posts if paginating, replace if first page
                setPosts(prev => cursor ? [...prev, ...data.posts!] : data.posts!);
                setHasMore(data.hasMore ?? false);
                // followCount only comes back on the first following-page response
                if (typeof data.followCount === 'number') {
                    setFollowCount(data.followCount);
                }
                return;
            }

            // response was ok but invalid format
            setErrorMessage('Unexpected response format from feed API.');

            // if canceled request, silent exit
            // otherwise, show error message
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            setErrorMessage('Network error while loading feed.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filter]);

    useEffect(() => {
        const controller = new AbortController();
        fetchFeed(controller.signal);
        return () => controller.abort();
    }, [fetchFeed]);

    // infinite scroll, observe the sentinel element at the bottom
    useEffect(() => {
        if (!hasMore || loadingMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                // when sentinel becomes visible, load the next page
                if (entries[0].isIntersecting && posts.length > 0) {
                    const lastPostDate = posts[posts.length - 1].createdAt;
                    fetchFeed(undefined, lastPostDate);
                }
            },
            { threshold: 0.1 }
        );

        const sentinel = sentinelRef.current;
        if (sentinel) observer.observe(sentinel);

        return () => { if (sentinel) observer.unobserve(sentinel); };
    }, [hasMore, loadingMore, posts, fetchFeed]);

    return (
        <div className="flex-1 bg-neutral-800 rounded-lg p-6 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Your Feed</h2>
                {/* pill tabs — switching resets pagination via fetchFeed re-firing on filter change */}
                <div className="flex gap-1 bg-neutral-900 border border-neutral-600 rounded-full p-1">
                    <button
                        onClick={() => setFilter('global')}
                        className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${filter === 'global'
                                ? 'bg-white text-black'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                    >
                        Global
                    </button>
                    <button
                        onClick={() => setFilter('following')}
                        className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${filter === 'following'
                                ? 'bg-white text-black'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                    >
                        Following
                    </button>
                </div>
            </div>

            {loading && (
                <div className="space-y-3">
                    {[1, 2, 3].map((index) => (
                        <div
                            key={index}
                            className="h-44 rounded-2xl border border-neutral-700/70 bg-neutral-900/60 animate-pulse"
                        />
                    ))}
                </div>
            )}

            {!loading && errorMessage && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                    <p className="text-red-400 font-semibold">{errorMessage}</p>
                    <button
                        onClick={() => fetchFeed()}
                        className="px-5 py-2 rounded-md border border-neutral-600 bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!loading && !errorMessage && posts.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                    {/* following with zero follows — actionable nudge */}
                    {filter === 'following' && followCount === 0 ? (
                        <p className="text-white font-semibold text-lg">
                            Follow more people to see their ratings here!
                        </p>
                    ) : filter === 'following' ? (
                        // following with follows but no posts from them
                        <p className="text-white font-semibold text-lg">
                            The people you follow haven&apos;t rated anything yet!
                        </p>
                    ) : (
                        // global feed empty (cold start)
                        <>
                            <p className="text-white font-semibold text-lg">No posts yet</p>
                            <p className="text-neutral-400 mt-2 max-w-md">
                                Rate a track, album, or artist to create your first post and start your feed.
                            </p>
                        </>
                    )}
                </div>
            )}

            {!loading && !errorMessage && posts.length > 0 && (
                <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                    {posts.map((post) => (
                        <PostCard key={post.id} {...post} />
                    ))}

                    {/* loading spinner for next page */}
                    {loadingMore && (
                        <div className="flex justify-center py-4">
                            <div className="h-6 w-6 rounded-full border-2 border-neutral-600 border-t-white animate-spin" />
                        </div>
                    )}

                    {/* invisible sentinel — triggers next page fetch when scrolled into view */}
                    {hasMore && !loadingMore && <div ref={sentinelRef} className="h-1" />}
                </div>
            )}
        </div>
    );
}

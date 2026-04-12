'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import PostCard from './Post';
import type { PostProps } from './Post';

export default function Feed() {
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            const url = cursor ? `/api/feed?cursor=${cursor}` : '/api/feed';
            const response = await fetch(url, { signal });
            let data: { posts?: PostProps[]; hasMore?: boolean; error?: string } = {};

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
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchFeed(controller.signal);
        return () => controller.abort();
    }, [fetchFeed]);

    // infinite scroll — observe the sentinel element at the bottom
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
                <button
                    className="px-6 py-2 bg-neutral-900 text-white font-bold rounded-md border border-neutral-600 hover:bg-neutral-700 transition-colors"
                    disabled
                    title="Filtering is not implemented yet"
                >
                    Filter
                </button>
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
                    <p className="text-white font-semibold text-lg">No posts yet</p>
                    <p className="text-neutral-400 mt-2 max-w-md">
                        Rate a track, album, or artist to create your first post and start your feed.
                    </p>
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

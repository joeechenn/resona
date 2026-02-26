'use client';
import { useCallback, useEffect, useState } from 'react';
import PostCard from './Post';
import type { PostProps } from './Post';

export default function Feed() {
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchFeed = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch('/api/feed', { signal });
            let data: PostProps[] | { error?: string } = [];

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

            // validate that data is an array of posts before
            if (Array.isArray(data)) {
                setPosts(data);
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
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchFeed(controller.signal);
        return () => controller.abort();
    }, [fetchFeed]);

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
                </div>
            )}
        </div>
    );
}

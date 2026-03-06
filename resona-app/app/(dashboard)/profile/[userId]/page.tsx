'use client';

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PostCard, { PostProps } from "@/components/dashboard/feed/Post";

type ProfileResponse = {
    user: {
        id: string;
        name: string | null;
        image: string | null;
        createdAt: string;
    };
    followerCount: number;
    followingCount: number;
    isOwnProfile: boolean;
    isFollowing: boolean;
    posts: PostProps[];
};

export default function ProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfileData = useCallback(async (signal?: AbortSignal) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/profile/${userId}`, { signal });
            let data: ProfileResponse | { error?: string } = {};

            try {
                data = await response.json();
            } catch {
                // keep fallback message below when JSON parsing fails
            }

            if (!response.ok) {
                const fallback =
                    response.status === 503
                        ? 'Profile data is temporarily unavailable. Please try again.'
                        : 'Failed to load profile data. Please try again.';
                setError(
                    typeof data === 'object' && data && 'error' in data && data.error ? data.error : fallback
                );
                return;
            }

            // validate that data contains expected profile fields before setting state
            if (
                data &&
                typeof data === 'object' &&
                'user' in data &&
                'posts' in data &&
                'followerCount' in data &&
                'followingCount' in data &&
                'isOwnProfile' in data &&
                'isFollowing' in data
            ) {
                setProfileData(data as ProfileResponse);
                return;
            }

            // response was ok but invalid format
            setError('Unexpected response format from profile API.');

            // if canceled request, silent exit
            // otherwise, show error message
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            setError('Network error while loading profile data.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        const controller = new AbortController();
        fetchProfileData(controller.signal);
        return () => controller.abort();
    }, [fetchProfileData]);

    const getInitial = (name: string | null) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    const getJoinedDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });

    if (isLoading) {
        return (
            <div className="flex-1 bg-neutral-800 rounded-lg p-6 flex flex-col min-h-0">
                <div className="rounded-2xl border border-neutral-700/60 bg-neutral-900/60 p-6 animate-pulse">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-full bg-neutral-700" />
                            <div className="space-y-3">
                                <div className="h-7 w-40 rounded bg-neutral-700" />
                                <div className="h-4 w-28 rounded bg-neutral-700" />
                                <div className="h-4 w-52 rounded bg-neutral-700" />
                            </div>
                        </div>
                        <div className="h-10 w-28 rounded-full bg-neutral-700" />
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    {[1, 2, 3].map((index) => (
                        <div
                            key={index}
                            className="h-44 rounded-2xl border border-neutral-700/70 bg-neutral-900/60 animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 bg-neutral-800 rounded-lg p-6 flex flex-col items-center justify-center gap-4 text-center">
                <p className="text-red-400 font-semibold">{error}</p>
                <button
                    onClick={() => fetchProfileData()}
                    className="px-5 py-2 rounded-md border border-neutral-600 bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="flex-1 bg-neutral-800 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <p className="text-white font-semibold text-lg">Profile not found</p>
                <p className="text-neutral-400 mt-2">This profile could not be loaded.</p>
            </div>
        );
    }

    const { user, followerCount, followingCount, isOwnProfile, isFollowing, posts } = profileData;
    const actionLabel = isOwnProfile ? 'Edit Profile' : isFollowing ? 'Following' : 'Follow';

    return (
        <div className="flex-1 bg-neutral-800 rounded-lg p-6 overflow-y-auto">
            <section className="rounded-2xl border border-neutral-700/60 bg-neutral-900/60 p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                        {user.image ? (
                            <img
                                src={user.image}
                                alt={user.name || 'Profile'}
                                className="h-20 w-20 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-700 text-2xl font-bold text-white">
                                {getInitial(user.name)}
                            </div>
                        )}

                        <div>
                            <h1 className="text-2xl font-bold text-white">{user.name || 'Anonymous'}</h1>
                            <p className="mt-1 text-sm text-neutral-400">Joined {getJoinedDate(user.createdAt)}</p>
                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-300">
                                <span>
                                    <span className="font-semibold text-white">{followerCount}</span> followers
                                </span>
                                <span>
                                    <span className="font-semibold text-white">{followingCount}</span> following
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        disabled
                        title={isOwnProfile ? 'Profile editing is not implemented yet' : 'Follow actions are not implemented yet'}
                        className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors cursor-not-allowed ${isOwnProfile
                                ? 'bg-white text-black opacity-80'
                                : isFollowing
                                    ? 'border border-neutral-600 bg-neutral-800 text-white opacity-80'
                                    : 'bg-white text-black opacity-80'
                            }`}
                    >
                        {actionLabel}
                    </button>
                </div>
            </section>

            <section className="mt-4">
                <div className="rounded-2xl border border-neutral-700/60 bg-neutral-900/60 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Posts</h2>
                        <p className="text-sm text-neutral-400">
                            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                        </p>
                    </div>

                    {posts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center px-6 py-6">
                            <p className="text-white font-semibold text-lg">No posts yet</p>
                            <p className="text-neutral-400 mt-2 max-w-md">
                                Rate a track, album, or artist to start building this profile.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {posts.map((post) => (
                                <PostCard key={post.id} {...post} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

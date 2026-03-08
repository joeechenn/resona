'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { getInitial } from '@/lib/utils/utils';

// props passed in from the profile page
interface UserListModalProps {
    listType: 'followers' | 'following';
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

// basic user shape for the modal list
type UserSummary = {
    id: string;
    name: string | null;
    image: string | null;
};

// api response shape for both list endpoints
type UserListResponse = {
    followers?: UserSummary[];
    following?: UserSummary[];
    error?: string;
};

export default function UserListModal({ listType, userId, isOpen, onClose }: UserListModalProps) {
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // fetch the selected user list when the modal opens
    useEffect(() => {
        if (!isOpen) return;

        const controller = new AbortController();

        const fetchUsers = async () => {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                const response = await fetch(`/api/profile/${userId}/${listType}`, {
                    signal: controller.signal,
                });

                const data: UserListResponse = await response.json();

                if (!response.ok) {
                    setUsers([]);
                    setErrorMessage(data.error ?? `Failed to load ${listType}.`);
                    return;
                }

                setUsers(data[listType] ?? []);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                setUsers([]);
                setErrorMessage(`Failed to load ${listType}.`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();

        return () => controller.abort();
    }, [isOpen, listType, userId]);

    // keep the modal unmounted while closed
    if (!isOpen) return null;

    const title = listType === 'followers' ? 'Followers' : 'Following';

    return (
        <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md mx-4 rounded-2xl bg-neutral-800 px-6 py-7 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
                    aria-label={`Close ${title.toLowerCase()} list`}
                >
                    <X size={20} />
                </button>

                {/* modal header */}
                <h2 className="text-xl font-semibold text-white mb-5">{title}</h2>

                {/* loading state */}
                {isLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((row) => (
                            <div
                                key={row}
                                className="flex items-center gap-3 rounded-xl bg-neutral-900/70 px-4 py-3 animate-pulse"
                            >
                                <div className="h-10 w-10 rounded-full bg-neutral-700" />
                                <div className="h-4 w-32 rounded bg-neutral-700" />
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && errorMessage && (
                    <p className="text-sm text-red-400">{errorMessage}</p>
                )}

                {/* empty state */}
                {!isLoading && !errorMessage && users.length === 0 && (
                    <p className="text-sm text-neutral-400">
                        No {listType} yet.
                    </p>
                )}

                {/* user list */}
                {!isLoading && !errorMessage && users.length > 0 && (
                    <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                        {users.map((listedUser) => (
                            <Link
                                key={listedUser.id}
                                href={`/profile/${listedUser.id}`}
                                onClick={onClose}
                                className="flex items-center gap-3 rounded-xl bg-neutral-900/70 px-4 py-3 hover:bg-neutral-700/80 transition-colors"
                            >
                                {listedUser.image ? (
                                    <img
                                        src={listedUser.image}
                                        alt={listedUser.name || 'User'}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-700 text-sm font-semibold text-white">
                                        {getInitial(listedUser.name)}
                                    </div>
                                )}

                                <span className="text-sm font-medium text-white">
                                    {listedUser.name || 'Anonymous'}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

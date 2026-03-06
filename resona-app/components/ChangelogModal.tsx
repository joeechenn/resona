'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function ChangelogModal() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            >
                What&apos;s New?
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="relative w-full max-w-md mx-4 rounded-2xl border border-neutral-700 bg-neutral-900 px-6 py-7 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                            aria-label="Close changelog"
                        >
                            <X size={18} />
                        </button>

                        <div className="pr-8">
                            <h2 className="text-center text-xl font-bold text-white mb-5">
                                v0.1.0 &mdash; Closed Beta
                            </h2>
                            <p className="mb-5 text-center text-sm text-neutral-400">
                                March 6, 2026
                            </p>
                            <h2 className="text-md font-semibold text-white mb-5">
                                Hello! I&apos;m excited to announce the launch of our closed beta, featuring:
                            </h2>
                            <ul className="list-disc space-y-3 pl-5 text-sm text-neutral-300 marker:text-neutral-400">
                                <li>User profiles with follower/following counts</li>
                                <li>Follow/unfollow system with optimistic updates</li>
                                <li>Clickable navigation from posts to profiles and entity pages</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

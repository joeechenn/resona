'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { APP_STAGE, APP_VERSION } from '@/lib/constants/version';

export default function ChangelogModal() {
    const [isOpen, setIsOpen] = useState(false);

    // close on Escape while the modal is open
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="text-sm text-muted-foreground hover:text-neutral-200 transition-colors cursor-pointer"
            >
                What&apos;s New?
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto mx-4 rounded-2xl border border-border bg-background px-6 py-7 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
                            aria-label="Close changelog"
                        >
                            <X size={18} />
                        </button>

                        <div className="pr-8">
                            <h2 className="text-center text-xl font-bold text-white mb-5">
                                {APP_VERSION} &mdash; {APP_STAGE}
                            </h2>
                            <p className="mb-5 text-center text-sm text-muted-foreground">
                                September 27, 2026
                            </p>
                            <h2 className="text-md font-semibold text-white mb-5">
                                Change of scenery. Much better scenery. And a smarter sidebar! Here&apos;s what&apos;s new:
                            </h2>
                            <ul className="list-disc space-y-3 pl-5 text-sm text-neutral-300 marker:text-muted-foreground">
                                <li><span className="font-semibold text-white">Login:</span> a new sign-in screen with a wall of album covers people in the beta have actually rated, plus a waitlist link if you&apos;re not in yet</li>
                                <li><span className="font-semibold text-white">Feed cards:</span> redesigned with bigger artwork, a soft color wash from each cover, and color-coded scores</li>
                                <li><span className="font-semibold text-white">Rate It:</span> rate anything straight from someone&apos;s post, or see your own score on posts you&apos;ve already rated</li>
                                <li><span className="font-semibold text-white">Your ratings, remembered:</span> the rating window now opens with your current score on track, album, and artist pages</li>
                                <li><span className="font-semibold text-white">Your Taste:</span> the Analytics sidebar now shows your score spread, average, most-rated artist, and your latest 10s</li>
                                <li><span className="font-semibold text-white">Friend Activity:</span> see each friend&apos;s latest rating, no Spotify connection needed</li>
                                <li><span className="font-semibold text-white">Dates:</span> posts older than a week now show the date instead of &ldquo;140d ago&rdquo;</li>
                                <li><span className="font-semibold text-white">Smaller touches:</span> weekly stats as tiles, Escape closes this window, and lots of fixes under the hood</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

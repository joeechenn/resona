'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface RatingModalProps {
    type: 'track' | 'artist' | 'album';
    spotifyId: string;
    name: string;
    artist: string;
    imageUrl: string;
}

export default function RatingModal({ type, spotifyId, name, artist, imageUrl }: RatingModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [ratingInput, setRatingInput] = useState('5');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    const getErrorMessageFromStatus = (status: number) => {
        // session missing or expired
        if (status === 401) {
            setTimeout(() => {
                router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
            }, 800);
            return 'Please sign in to submit your rating. Redirecting to login...';
        }
        // invalid rating request
        if (status === 400) return 'Invalid rating request. Check your input and try again.';
        // cannot find this item on spotify
        if (status === 404) return 'Could not find this item.';
        // rate limit exceeded
        if (status === 429) return 'Too many requests. Please try again shortly.';
        // unknown backend failure
        return 'Failed to submit rating. Please try again shortly.';
    };

    const handleSubmit = async () => {
        setErrorMessage(null);

        const parsedRating = Number(ratingInput);
        if (!Number.isInteger(parsedRating) || parsedRating < 0 || parsedRating > 10) {
            setErrorMessage('Please enter a whole number from 0 to 10.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type,
                    spotifyId,
                    rating: parsedRating,
                }),
            });

            let data: { error?: string } | null = null;
            try {
                data = await response.json();
            } catch {
                // non-JSON error, fallback message will be used
            }

            if (!response.ok) {
                const fallbackMessage = getErrorMessageFromStatus(response.status);
                setErrorMessage(data?.error ?? fallbackMessage);
                return;
            }

            setIsOpen(false);
        } catch {
            // request failed before api response
            setErrorMessage('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const parsedRatingForDisplay = Number(ratingInput);
    const fillPercent = Number.isFinite(parsedRatingForDisplay)
        ? Math.max(0, Math.min(100, (parsedRatingForDisplay / 10) * 100))
        : 0;

    return (
        <>
            <button
                onClick={() => { setErrorMessage(null); setIsOpen(true); }}
                className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-200"
            >
                Rate
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-neutral-800 rounded-2xl px-8 py-10 max-w-[36rem] w-full mx-4 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* close button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* artwork + info */}
                        <div className="flex items-center gap-4 mb-10">
                            <img
                                src={imageUrl}
                                alt={name}
                                className="w-14 h-14 object-cover rounded-md"
                            />
                            <div>
                                <h3 className="text-white font-semibold text-base">{name}</h3>
                                <p className="text-neutral-400 text-sm">{artist}</p>
                            </div>
                        </div>

                        <div className="flex gap-8">
                            {/* left: your rating */}
                            <div className="basis-[65%] flex flex-col items-center text-center">
                                <p className="text-neutral-400 text-sm mb-3">Your Rating</p>
                                <div className="relative inline-flex items-end mb-8 pr-8">
                                    <input
                                        type="number"
                                        min={0}
                                        max={10}
                                        step={1}
                                        value={ratingInput}
                                        onChange={(e) => setRatingInput(e.target.value)}
                                        className="w-20 text-center text-5xl font-semibold text-white bg-transparent border-0 p-0 leading-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="absolute right-0 bottom-0 text-neutral-400 text-sm">/10</span>
                                </div>

                                {/* visual-only slider */}
                                <div className="relative w-full h-2 bg-neutral-600/70 border border-neutral-500/70 rounded-full mb-8 pointer-events-none">
                                    <div
                                        className="absolute top-0 left-0 h-2 bg-green-500 rounded-full transition-all duration-200"
                                        style={{ width: `${fillPercent}%` }}
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-48 bg-neutral-900 border border-neutral-700 text-neutral-100 font-semibold py-2.5 rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                                </button>

                                {errorMessage && (
                                    <p className="text-sm text-red-400 mt-3 text-center">
                                        {errorMessage}
                                    </p>
                                )}
                            </div>

                            {/* vertical divider */}
                            <div className="w-px bg-neutral-700/60 self-stretch" />

                            {/* right: global + friend ratings */}
                            <div className="basis-[35%] flex flex-col items-center">
                                <div className="mb-6 text-center">
                                    <p className="text-neutral-400 text-sm mb-1">Global Rating</p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-green-400 text-3xl font-bold">--</span>
                                        <span className="text-neutral-400 text-sm">/10</span>
                                    </div>
                                </div>

                                <div className="mb-6 text-center">
                                    <p className="text-neutral-400 text-sm mb-1">Friend Rating</p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-yellow-400 text-3xl font-bold">--</span>
                                        <span className="text-neutral-400 text-sm">/10</span>
                                    </div>
                                </div>

                                {/* horizontal divider */}
                                <div className="h-px w-full bg-neutral-700/60 my-6" />

                                <div className="text-center mt-0">
                                    <p className="text-neutral-500 text-xs mb-3">
                                        Can&apos;t make up your mind?<br />Try out this new feature!
                                    </p>
                                    <button className="bg-neutral-700 border border-neutral-500 text-neutral-100 text-xs px-4 py-2 rounded-md hover:bg-neutral-600 transition-colors">
                                        Try New Rating Feature
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}

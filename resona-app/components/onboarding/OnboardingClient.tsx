'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Search, ArrowDown } from 'lucide-react';
import RatingModal from '@/components/RatingModal';
import { completeOnboarding } from '@/lib/onboarding-actions';

const REQUIRED_RATINGS = 3;

interface PopularTrack {
    id: string;
    name: string;
    artists: Array<{ id: string; name: string }>;
    album: { id: string; name: string; images: Array<{ url: string }> };
}

interface SearchTrack {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: { name: string; images: Array<{ url: string }> };
}

interface SelectedTrack {
    id: string;
    name: string;
    artist: string;
    imageUrl: string;
}

export default function OnboardingClient() {
    // section reveal flags driven by IntersectionObserver
    const section1Ref = useRef<HTMLElement | null>(null);
    const section2Ref = useRef<HTMLElement | null>(null);
    const section3Ref = useRef<HTMLElement | null>(null);
    const [revealed1, setRevealed1] = useState(false);
    const [revealed2, setRevealed2] = useState(false);
    const [revealed3, setRevealed3] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    if (entry.target === section1Ref.current) setRevealed1(true);
                    if (entry.target === section2Ref.current) setRevealed2(true);
                    if (entry.target === section3Ref.current) setRevealed3(true);
                }
            },
            { threshold: 0.2 }
        );
        if (section1Ref.current) observer.observe(section1Ref.current);
        if (section2Ref.current) observer.observe(section2Ref.current);
        if (section3Ref.current) observer.observe(section3Ref.current);
        return () => observer.disconnect();
    }, []);

    // popular tracks shown in grid (first slice of pool, replaced on rate from queue)
    const [popular, setPopular] = useState<PopularTrack[]>([]);
    // queue, remaining pool entries that slide into the grid as user rates
    const [queue, setQueue] = useState<PopularTrack[]>([]);
    const [popularLoading, setPopularLoading] = useState(true);
    const [popularError, setPopularError] = useState<string | null>(null);
    // tracks whether the pool was successfully loaded, just to distinguish "rated all" from "never loaded"
    const [poolLoaded, setPoolLoaded] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            try {
                const response = await fetch('/api/onboarding/popular', { signal: controller.signal });
                if (!response.ok) {
                    setPopularError("We couldn't load suggestions. Try searching above.");
                    return;
                }
                const data = await response.json();
                const pool: PopularTrack[] = data.tracks || [];
                // show first 5, queue the rest for swap-on-rate
                setPopular(pool.slice(0, 5));
                setQueue(pool.slice(5));
                if (pool.length > 0) setPoolLoaded(true);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                setPopularError("We couldn't load suggestions. Try searching above.");
            } finally {
                setPopularLoading(false);
            }
        })();
        return () => controller.abort();
    }, []);

    // debounced track search reusing /api/search
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchTrack[]>([]);
    const [searchError, setSearchError] = useState<string | null>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearchChange = (value: string) => {
        setQuery(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!value.trim()) {
            setSearchResults([]);
            setSearchError(null);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(value)}&type=track`);
                const data = await response.json();
                if (!response.ok) {
                    setSearchError(typeof data?.error === 'string' ? data.error : 'Search failed.');
                    setSearchResults([]);
                    return;
                }
                setSearchResults(data?.tracks?.items || []);
                setSearchError(null);
            } catch {
                setSearchError('Network error while searching.');
                setSearchResults([]);
            }
        }, 300);
    };

    // rating modal state, controlled-mode usage of RatingModal
    const [selectedTrack, setSelectedTrack] = useState<SelectedTrack | null>(null);
    const [ratedIds, setRatedIds] = useState<Set<string>>(new Set());

    const pickTrack = (track: SearchTrack | PopularTrack) => {
        setSelectedTrack({
            id: track.id,
            name: track.name,
            artist: track.artists.map((a) => a.name).join(', '),
            imageUrl: track.album.images?.[0]?.url || '',
        });
        // close the search dropdown so it doesn't compete with the modal
        setQuery('');
        setSearchResults([]);
    };

    const handleRatingSuccess = () => {
        if (!selectedTrack) return;
        // set ensures duplicate ratings (re-rating the same track) don't double-count
        setRatedIds((prev) => {
            const next = new Set(prev);
            next.add(selectedTrack.id);
            return next;
        });

        // if the rated track was in the popular grid, swap it for the next queued track
        // when the queue runs dry, the slot is removed and the grid shrinks
        setPopular((prev) => {
            const idx = prev.findIndex((t) => t.id === selectedTrack.id);
            if (idx === -1) return prev;
            if (queue.length > 0) {
                const next = [...prev];
                next[idx] = queue[0];
                return next;
            }
            return prev.filter((_, i) => i !== idx);
        });
        setQueue((prev) => prev.slice(1));
    };

    // server action transition for the completion buttons
    const [isPending, startTransition] = useTransition();
    const handleComplete = () => {
        startTransition(async () => {
            await completeOnboarding();
        });
    };

    const ratedCount = ratedIds.size;
    const canContinue = ratedCount >= REQUIRED_RATINGS;
    const canSkip = ratedCount >= 1;
    const remaining = Math.max(0, REQUIRED_RATINGS - ratedCount);

    return (
        <div className="bg-black text-white min-h-screen">
            {/* sticky progress dots in the corner once the user has rated something */}
            {ratedCount > 0 && (
                <div className="fixed top-6 right-6 z-40 flex gap-2">
                    {Array.from({ length: REQUIRED_RATINGS }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${i < ratedCount ? 'bg-green-500' : 'bg-neutral-700'
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* section 1: intro */}
            <section
                ref={section1Ref}
                className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center"
            >
                <div
                    className={`max-w-2xl space-y-7 transition-all duration-1000 ease-out ${revealed1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                        }`}
                >
                    <p className="text-xl md:text-2xl font-light text-neutral-200 leading-relaxed">
                        Music is personal. Your taste is yours.
                        <br /> Shaped by late nights, road trips,
                        <br /> and songs you can&apos;t explain.
                    </p>
                    <p className="text-xl md:text-2xl font-light text-neutral-200 leading-relaxed">
                        Resona is where that taste becomes something
                        <br /> you can share. Rate what you love,
                        <br /> what you hate, what you can&apos;t stop thinking about.
                    </p>
                    <p className="text-xl md:text-2xl font-light text-neutral-200 leading-relaxed">
                        Every opinion is a post. Every rating tells
                        <br /> someone else who you are.
                    </p>
                    <p className="text-xl md:text-2xl font-medium text-white leading-relaxed pt-2">
                        People shouldn&apos;t be afraid of their opinions.
                        <br /> You shouldn&apos;t either.
                    </p>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-neutral-500 animate-bounce">
                    <ArrowDown size={20} />
                </div>
            </section>

            {/* section 2: rate */}
            <section
                ref={section2Ref}
                className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
            >
                <div
                    className={`w-full max-w-3xl transition-all duration-1000 ease-out ${revealed2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                        }`}
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-3">Start with a song.</h2>
                        <p className="text-neutral-400 text-base">
                            Search one you have an opinion on or rate something popular below.
                        </p>
                    </div>

                    {/* search */}
                    <div className="relative max-w-xl mx-auto mb-12">
                        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 focus-within:border-neutral-600 transition-colors">
                            <Search className="w-5 h-5 text-neutral-500 mr-3" />
                            <input
                                type="text"
                                placeholder="Search for a song..."
                                value={query}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="bg-transparent border-none outline-none text-white placeholder-neutral-500 w-full"
                            />
                        </div>
                        {searchResults.length > 0 && (
                            <div className="absolute top-full mt-2 w-full bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl max-h-80 overflow-y-auto z-30">
                                {searchResults.slice(0, 6).map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => pickTrack(t)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-neutral-800 text-left border-b border-neutral-800 last:border-b-0"
                                    >
                                        {t.album.images?.[0]?.url ? (
                                            <img
                                                src={t.album.images[0].url}
                                                alt=""
                                                className="w-10 h-10 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-neutral-800" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium text-white truncate">{t.name}</div>
                                            <div className="text-sm text-neutral-400 truncate">
                                                {t.artists.map((a) => a.name).join(', ')}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {searchError && (
                            <p className="mt-2 text-xs text-red-400 text-center">{searchError}</p>
                        )}
                    </div>

                    {/* popular */}
                    <div>
                        <p className="text-center text-neutral-500 text-xs uppercase tracking-widest mb-6">
                            Can&apos;t think of any? Here&apos;s some to get you started!
                        </p>
                        {popularLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square bg-neutral-900 rounded-lg animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : popularError ? (
                            <p className="text-center text-neutral-500 text-sm">{popularError}</p>
                        ) : popular.length === 0 && poolLoaded ? (
                            // easter egg, user rated every track in the pool
                            <p className="text-center text-white font-semibold">
                                Wow, number one supporter over here.
                            </p>
                        ) : popular.length === 0 ? (
                            // pool was empty (e.g. all fetches failed)
                            <p className="text-center text-neutral-500 text-sm">
                                No suggestions right now. Try searching above.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {popular.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => pickTrack(t)}
                                        className="group text-left"
                                    >
                                        {t.album.images?.[0]?.url ? (
                                            <img
                                                src={t.album.images[0].url}
                                                alt={t.name}
                                                className="w-full aspect-square object-cover rounded-lg mb-2 transition-all group-hover:ring-2 group-hover:ring-white/40"
                                            />
                                        ) : (
                                            <div className="w-full aspect-square bg-neutral-800 rounded-lg mb-2" />
                                        )}
                                        <div className="text-sm font-medium text-white truncate">
                                            {t.name}
                                        </div>
                                        <div className="text-xs text-neutral-400 truncate">
                                            {t.artists.map((a) => a.name).join(', ')}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* section 3: continue */}
            <section
                ref={section3Ref}
                className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center"
            >
                <div
                    className={`w-full max-w-md transition-all duration-1000 ease-out ${revealed3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                        }`}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">
                        {canContinue ? 'You’re ready.' : 'Almost there.'}
                    </h2>
                    <p className="text-neutral-400 mb-10">
                        {canContinue
                            ? 'Your opinions are live. Now go see what everyone else thinks.'
                            : `${remaining} more ${remaining === 1 ? 'rating' : 'ratings'} to go.`}
                    </p>

                    <div className="flex justify-center gap-3 mb-10">
                        {Array.from({ length: REQUIRED_RATINGS }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full transition-colors duration-300 ${i < ratedCount
                                    ? 'bg-green-500'
                                    : 'bg-neutral-900 border border-neutral-700'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleComplete}
                        disabled={!canContinue || isPending}
                        className="w-full bg-white text-black font-semibold py-3 rounded-full hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Loading…' : 'Explore Resona'}
                    </button>

                    {canSkip && !canContinue && (
                        <div className="mt-8">
                            <button
                                onClick={handleComplete}
                                disabled={isPending}
                                className="text-neutral-500 text-sm hover:text-neutral-300 transition-colors disabled:opacity-50"
                            >
                                Skip for now
                            </button>
                            <p className="text-neutral-600 text-xs mt-3 leading-relaxed">
                                You can always rate later.
                                <br /> Your experience gets better as you do.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* rating modal in controlled mode, opens whenever a track is picked */}
            {selectedTrack && (
                <RatingModal
                    type="track"
                    spotifyId={selectedTrack.id}
                    name={selectedTrack.name}
                    artist={selectedTrack.artist}
                    imageUrl={selectedTrack.imageUrl}
                    isOpen={true}
                    onClose={() => setSelectedTrack(null)}
                    onSuccess={handleRatingSuccess}
                />
            )}
        </div>
    );
}

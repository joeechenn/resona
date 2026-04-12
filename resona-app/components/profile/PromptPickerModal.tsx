'use client';

import { useCallback, useEffect, useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { PROFILE_PROMPTS, type ProfilePrompt, type EntityType } from '@/lib/constants/profilePrompts';

// shape of rated items from the API
interface RatedTrack {
    rating: number;
    track: {
        id: string;
        name: string;
        album: { imageUrl: string | null } | null;
        artists: Array<{ artist: { name: string } }>;
    };
}

interface RatedAlbum {
    rating: number;
    album: {
        id: string;
        name: string;
        imageUrl: string | null;
        artists: Array<{ artist: { name: string } }>;
    };
}

interface RatedArtist {
    rating: number;
    artist: {
        id: string;
        name: string;
        imageUrl: string | null;
    };
}

interface PromptPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    position: number;
    // prompt texts already used, to gray them out
    existingPrompts: string[];
    onSave: () => void;
}

export default function PromptPickerModal({
    isOpen,
    onClose,
    userId,
    position,
    existingPrompts,
    onSave,
}: PromptPickerModalProps) {
    // step 1 = pick a prompt, step 2 = pick an entity
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedPrompt, setSelectedPrompt] = useState<ProfilePrompt | null>(null);
    const [tracks, setTracks] = useState<RatedTrack[]>([]);
    const [albums, setAlbums] = useState<RatedAlbum[]>([]);
    const [artists, setArtists] = useState<RatedArtist[]>([]);
    const [activeTab, setActiveTab] = useState<EntityType>('track');
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // reset state when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setStep(1);
        setSelectedPrompt(null);
        setTracks([]);
        setAlbums([]);
        setArtists([]);
        setErrorMessage(null);
    }, [isOpen]);

    // fetch rated items when moving to step 2
    const fetchRatedItems = useCallback(async (type: EntityType | 'any') => {
        setIsLoadingItems(true);
        setErrorMessage(null);

        try {
            // "any" type fetches all, specific type filters
            const url = type === 'any'
                ? `/api/profile/${userId}/rated-items`
                : `/api/profile/${userId}/rated-items?type=${type}`;

            const response = await fetch(url);
            if (!response.ok) {
                setErrorMessage('Failed to load your rated items.');
                return;
            }

            const data = await response.json();
            setTracks(data.tracks || []);
            setAlbums(data.albums || []);
            setArtists(data.artists || []);

            // set initial tab based on prompt type
            if (type !== 'any') {
                setActiveTab(type);
            }
        } catch {
            setErrorMessage('Network error while loading rated items.');
        } finally {
            setIsLoadingItems(false);
        }
    }, [userId]);

    // handle prompt selection (step 1 -> step 2)
    const handlePromptSelect = (prompt: ProfilePrompt) => {
        setSelectedPrompt(prompt);
        setStep(2);
        fetchRatedItems(prompt.type);
    };

    // handle entity selection (step 2 -> save)
    const handleEntitySelect = async (entityType: EntityType, entityId: string) => {
        if (!selectedPrompt || isSaving) return;

        setIsSaving(true);
        setErrorMessage(null);

        try {
            const response = await fetch(`/api/profile/${userId}/prompts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: selectedPrompt.text,
                    entityType,
                    entityId,
                    position,
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                setErrorMessage(data.error || 'Failed to save prompt.');
                return;
            }

            onSave();
            onClose();
        } catch {
            setErrorMessage('Network error while saving prompt.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-xl mx-4 rounded-2xl bg-neutral-800 px-8 py-8 shadow-2xl max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {step === 2 && (
                            <button
                                onClick={() => { setStep(1); setSelectedPrompt(null); setErrorMessage(null); }}
                                className="text-neutral-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <h2 className="text-xl font-semibold text-white">
                            {step === 1 ? 'Choose a Prompt' : 'Pick Your Answer'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* selected prompt preview in step 2 */}
                {step === 2 && selectedPrompt && (
                    <div className="mb-4 rounded-xl bg-neutral-900/70 px-4 py-3">
                        <p className="text-sm text-neutral-400 italic">{selectedPrompt.text}</p>
                    </div>
                )}

                {errorMessage && (
                    <p className="mb-4 text-sm text-red-400">{errorMessage}</p>
                )}

                {/* scrollable content area */}
                <div className="overflow-y-auto flex-1 min-h-0">
                    {/* step 1: prompt list */}
                    {step === 1 && (
                        <div className="space-y-2">
                            {PROFILE_PROMPTS.map((prompt) => {
                                const isUsed = existingPrompts.includes(prompt.text);
                                return (
                                    <button
                                        key={prompt.text}
                                        onClick={() => !isUsed && handlePromptSelect(prompt)}
                                        disabled={isUsed}
                                        className={`w-full text-left rounded-xl px-4 py-3 transition-colors ${isUsed
                                            ? 'bg-neutral-900/30 text-neutral-600 cursor-not-allowed'
                                            : 'bg-neutral-900/70 text-white hover:bg-neutral-700/80 cursor-pointer'
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{prompt.text}</span>
                                        {isUsed && (
                                            <span className="ml-2 text-xs text-neutral-600">(already used)</span>
                                        )}
                                        <span className={`ml-2 text-xs ${isUsed ? 'text-neutral-700' : 'text-neutral-500'}`}>
                                            {prompt.type === 'any' ? 'any' : prompt.type}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* step 2: entity picker */}
                    {step === 2 && (
                        <>
                            {/* tabs for "any" type prompts */}
                            {selectedPrompt?.type === 'any' && (
                                <div className="flex gap-2 mb-4">
                                    {(['track', 'album', 'artist'] as EntityType[]).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === tab
                                                ? 'bg-white text-black'
                                                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                                                }`}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}s
                                        </button>
                                    ))}
                                </div>
                            )}

                            {isLoadingItems && (
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex items-center gap-3 rounded-xl bg-neutral-900/70 px-4 py-3 animate-pulse">
                                            <div className="h-10 w-10 rounded bg-neutral-700" />
                                            <div className="flex-1 space-y-1">
                                                <div className="h-4 w-32 rounded bg-neutral-700" />
                                                <div className="h-3 w-24 rounded bg-neutral-700" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* track list */}
                            {!isLoadingItems && (activeTab === 'track' || selectedPrompt?.type === 'track') && (
                                <div className="space-y-2">
                                    {tracks.length === 0 ? (
                                        <p className="text-neutral-500 text-sm text-center py-6">No rated tracks yet.</p>
                                    ) : (
                                        tracks.map((item) => (
                                            <button
                                                key={item.track.id}
                                                onClick={() => handleEntitySelect('track', item.track.id)}
                                                disabled={isSaving}
                                                className="w-full flex items-center gap-3 rounded-xl bg-neutral-900/70 px-4 py-3 hover:bg-neutral-700/80 transition-colors text-left disabled:opacity-50"
                                            >
                                                {item.track.album?.imageUrl ? (
                                                    <img src={item.track.album.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded bg-neutral-700" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{item.track.name}</p>
                                                    <p className="text-xs text-neutral-400 truncate">
                                                        {item.track.artists.map(a => a.artist.name).join(', ')}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-bold text-neutral-300">{item.rating}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* album list */}
                            {!isLoadingItems && (activeTab === 'album' || selectedPrompt?.type === 'album') && selectedPrompt?.type !== 'track' && (
                                <div className="space-y-2">
                                    {albums.length === 0 ? (
                                        <p className="text-neutral-500 text-sm text-center py-6">No rated albums yet.</p>
                                    ) : (
                                        albums.map((item) => (
                                            <button
                                                key={item.album.id}
                                                onClick={() => handleEntitySelect('album', item.album.id)}
                                                disabled={isSaving}
                                                className="w-full flex items-center gap-3 rounded-xl bg-neutral-900/70 px-4 py-3 hover:bg-neutral-700/80 transition-colors text-left disabled:opacity-50"
                                            >
                                                {item.album.imageUrl ? (
                                                    <img src={item.album.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded bg-neutral-700" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{item.album.name}</p>
                                                    <p className="text-xs text-neutral-400 truncate">
                                                        {item.album.artists.map(a => a.artist.name).join(', ')}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-bold text-neutral-300">{item.rating}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* artist list */}
                            {!isLoadingItems && (activeTab === 'artist' || selectedPrompt?.type === 'artist') && selectedPrompt?.type !== 'track' && selectedPrompt?.type !== 'album' && (
                                <div className="space-y-2">
                                    {artists.length === 0 ? (
                                        <p className="text-neutral-500 text-sm text-center py-6">No rated artists yet.</p>
                                    ) : (
                                        artists.map((item) => (
                                            <button
                                                key={item.artist.id}
                                                onClick={() => handleEntitySelect('artist', item.artist.id)}
                                                disabled={isSaving}
                                                className="w-full flex items-center gap-3 rounded-xl bg-neutral-900/70 px-4 py-3 hover:bg-neutral-700/80 transition-colors text-left disabled:opacity-50"
                                            >
                                                {item.artist.imageUrl ? (
                                                    <img src={item.artist.imageUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-neutral-700" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{item.artist.name}</p>
                                                </div>
                                                <span className="text-sm font-bold text-neutral-300">{item.rating}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

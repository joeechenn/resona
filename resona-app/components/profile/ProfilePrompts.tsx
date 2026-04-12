'use client';

import { Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface PromptEntity {
    track: {
        id: string;
        spotifyId: string;
        name: string;
        album: { imageUrl: string | null } | null;
        artists: Array<{ artist: { name: string } }>;
    } | null;
    album: {
        id: string;
        spotifyId: string;
        name: string;
        imageUrl: string | null;
        artists: Array<{ artist: { name: string } }>;
    } | null;
    artist: {
        id: string;
        spotifyId: string;
        name: string;
        imageUrl: string | null;
    } | null;
}

export interface ProfilePromptData extends PromptEntity {
    id: string;
    prompt: string;
    position: number;
    rating?: number | null;
}

interface ProfilePromptsProps {
    prompts: ProfilePromptData[];
    isOwnProfile: boolean;
    onAddPrompt: (position: number) => void;
    onDeletePrompt: (promptId: string) => void;
}

function ratingColorClass(rating: number): string {
    if (rating <= 4) return 'text-red-400';
    if (rating <= 7) return 'text-yellow-300';
    return 'text-green-400';
}

// extract display info from whichever entity is attached
function getEntityDisplay(prompt: ProfilePromptData) {
    if (prompt.track) {
        return {
            name: prompt.track.name,
            subtitle: prompt.track.artists.map(a => a.artist.name).join(', '),
            imageUrl: prompt.track.album?.imageUrl ?? null,
            href: `/track/${prompt.track.spotifyId}`,
            rounded: false,
            rating: prompt.rating ?? null,
        };
    }
    if (prompt.album) {
        return {
            name: prompt.album.name,
            subtitle: prompt.album.artists.map(a => a.artist.name).join(', '),
            imageUrl: prompt.album.imageUrl,
            href: `/album/${prompt.album.spotifyId}`,
            rounded: false,
            rating: prompt.rating ?? null,
        };
    }
    if (prompt.artist) {
        return {
            name: prompt.artist.name,
            subtitle: 'Artist',
            imageUrl: prompt.artist.imageUrl,
            href: `/artist/${prompt.artist.spotifyId}`,
            rounded: true,
            rating: prompt.rating ?? null,
        };
    }
    return null;
}

// empty slot, clickable to add a prompt (own profile only)
function EmptySlot({ position, onAdd, isFeatured = false }: { position: number; onAdd: (pos: number) => void; isFeatured?: boolean }) {
    return (
        <button
            onClick={() => onAdd(position)}
            className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-600 bg-neutral-900/30 hover:border-neutral-500 hover:bg-neutral-800/40 transition-colors cursor-pointer w-full ${isFeatured ? 'h-full min-h-[420px]' : 'flex-1 min-h-[200px]'
                }`}
        >
            <Plus size={28} className="text-neutral-500 mb-2" />
            <p className="text-neutral-500">Add a prompt</p>
        </button>
    );
}

// filled prompt card
function PromptCard({
    prompt,
    isOwnProfile,
    onDelete,
    isFeatured = false,
}: {
    prompt: ProfilePromptData;
    isOwnProfile: boolean;
    onDelete: (id: string) => void;
    isFeatured?: boolean;
}) {
    const entity = getEntityDisplay(prompt);
    if (!entity) return null;

    return (
        <div className={`relative rounded-2xl border border-neutral-700/60 bg-neutral-800/35 p-5 ${isFeatured ? 'h-full w-full min-h-[420px] flex flex-col justify-center gap-4' : 'flex-1 flex flex-col justify-center gap-4 min-h-[200px]'
            }`}>
            {/* delete button for own profile */}
            {isOwnProfile && (
                <button
                    onClick={() => onDelete(prompt.id)}
                    className="absolute top-4 right-4 text-neutral-500 hover:text-red-400 transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            )}

            {/* prompt text — large, Hinge-style */}
            <p className={`${isFeatured ? 'text-3xl' : 'text-2xl'} font-bold text-white italic pr-6`}>
                {prompt.prompt}
            </p>

            {/* entity answer */}
            <Link href={entity.href} className="flex items-center justify-between rounded-xl bg-neutral-700/65 px-4 py-3 group">
                <div className="min-w-0 flex items-center gap-3">
                    {entity.imageUrl ? (
                        <img
                            src={entity.imageUrl}
                            alt={entity.name}
                            className={`${isFeatured ? 'h-16 w-16' : 'h-14 w-14'} object-cover ${entity.rounded ? 'rounded-full' : 'rounded-md'}`}
                        />
                    ) : (
                        <div className={`${isFeatured ? 'h-16 w-16' : 'h-14 w-14'} bg-neutral-700 ${entity.rounded ? 'rounded-full' : 'rounded-md'}`} />
                    )}
                    <div className="min-w-0">
                        <p className={`${isFeatured ? 'text-lg' : 'text-base'} font-extrabold text-white truncate leading-tight group-hover:underline`}>
                            {entity.name}
                        </p>
                        <p className={`${isFeatured ? 'text-sm' : 'text-xs'} text-neutral-400 truncate`}>{entity.subtitle}</p>
                    </div>
                </div>

                {/* rating circle */}
                {entity.rating !== null && entity.rating !== undefined && (
                    <div className={`ml-4 flex shrink-0 items-center justify-center rounded-full border-2 border-neutral-400 ${isFeatured ? 'h-12 w-12' : 'h-11 w-11'}`}>
                        <span className={`${isFeatured ? 'text-xl' : 'text-lg'} font-bold ${ratingColorClass(entity.rating)}`}>{entity.rating}</span>
                    </div>
                )}
            </Link>
        </div>
    );
}

export default function ProfilePrompts({ prompts, isOwnProfile, onAddPrompt, onDeletePrompt }: ProfilePromptsProps) {
    // build a map of position -> prompt for easy lookup
    const promptsByPosition: Record<number, ProfilePromptData | undefined> = {};
    prompts.forEach(p => { promptsByPosition[p.position] = p; });

    const hasAnyPrompts = prompts.length > 0;

    // don't show the section on other people's empty profiles
    if (!isOwnProfile && !hasAnyPrompts) return null;

    return (
        <section className="mt-4">
            <div className="rounded-2xl border border-neutral-700/60 bg-neutral-900/60 p-6">
                {/* layout: positions 0 & 1 on left, position 2 on right (featured) */}
                <div className="grid grid-cols-[1fr_1fr] gap-4 min-h-[420px]">
                    {/* left column: positions 0 and 1 stacked */}
                    <div className="flex flex-col gap-4">
                        {[0, 1].map((pos) => {
                            const prompt = promptsByPosition[pos];
                            if (prompt) {
                                return <PromptCard key={prompt.id} prompt={prompt} isOwnProfile={isOwnProfile} onDelete={onDeletePrompt} />;
                            }
                            if (isOwnProfile) {
                                return <EmptySlot key={`empty-${pos}`} position={pos} onAdd={onAddPrompt} />;
                            }
                            return null;
                        })}
                    </div>

                    {/* right column: position 2 (featured, full height) */}
                    <div className="flex w-full min-h-full">
                        {promptsByPosition[2] ? (
                            <PromptCard
                                prompt={promptsByPosition[2]}
                                isOwnProfile={isOwnProfile}
                                onDelete={onDeletePrompt}
                                isFeatured
                            />
                        ) : isOwnProfile ? (
                            <EmptySlot position={2} onAdd={onAddPrompt} isFeatured />
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}

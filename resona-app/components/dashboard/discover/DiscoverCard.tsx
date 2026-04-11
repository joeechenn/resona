'use client';

import Link from 'next/link';

interface DiscoverCardProps {
    id: string;
    name: string;
    imageUrl: string | null;
    subtitle?: string;
    href: string;
    // true for artists (circular), false for tracks/albums
    rounded?: boolean;
}

export default function DiscoverCard({ name, imageUrl, subtitle, href, rounded = false }: DiscoverCardProps) {
    return (
        <Link
            href={href}
            className="group w-[calc((100%-9*1rem)/10)] rounded-xl bg-neutral-900/40 border border-neutral-700/40 p-3 hover:bg-neutral-700/50 hover:border-neutral-600 transition-all"
        >
            {/* artwork */}
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={name}
                    className={`w-full aspect-square object-cover ${rounded ? 'rounded-full' : 'rounded-lg'}`}
                />
            ) : (
                <div className={`w-full aspect-square bg-neutral-700 ${rounded ? 'rounded-full' : 'rounded-lg'}`} />
            )}

            {/* text */}
            <p className="mt-2 text-sm font-semibold text-white truncate group-hover:underline">
                {name}
            </p>
            {subtitle && (
                <p className="text-xs text-neutral-400 truncate">
                    {subtitle}
                </p>
            )}
        </Link>
    );
}

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
            className="group min-w-0 rounded-xl border border-border bg-background p-3 transition-all hover:border-border hover:bg-muted"
        >
            {/* artwork */}
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={name}
                    className={`w-full aspect-square object-cover ${rounded ? 'rounded-full' : 'rounded-lg'}`}
                />
            ) : (
                <div className={`w-full aspect-square bg-muted ${rounded ? 'rounded-full' : 'rounded-lg'}`} />
            )}

            {/* text */}
            <p className="mt-2 text-sm font-semibold text-white truncate group-hover:underline">
                {name}
            </p>
            {subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                    {subtitle}
                </p>
            )}
        </Link>
    );
}

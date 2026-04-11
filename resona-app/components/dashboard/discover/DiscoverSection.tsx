'use client';

interface DiscoverSectionProps {
    title: string;
    children: React.ReactNode;
    isEmpty?: boolean;
    emptyMessage?: string;
}

export default function DiscoverSection({ title, children, isEmpty = false, emptyMessage }: DiscoverSectionProps) {
    return (
        <div className="mb-4 rounded-2xl border border-neutral-700/60 bg-neutral-800/35 px-6 py-4">
            <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
            {isEmpty ? (
                <p className="text-neutral-500 text-sm py-4 text-center">{emptyMessage}</p>
            ) : (
                <div className="flex flex-wrap gap-4">
                    {children}
                </div>
            )}
        </div>
    );
}

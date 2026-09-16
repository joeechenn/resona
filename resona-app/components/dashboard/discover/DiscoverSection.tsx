'use client';

interface DiscoverSectionProps {
    title: string;
    children: React.ReactNode;
    isEmpty?: boolean;
    emptyMessage?: string;
}

export default function DiscoverSection({ title, children, isEmpty = false, emptyMessage }: DiscoverSectionProps) {
    return (
        <section className="mb-2 rounded-2xl border border-border bg-surface px-4 py-4 2xl:px-6">
            <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
            {isEmpty ? (
                <p className="text-muted-foreground text-sm py-4 text-center">{emptyMessage}</p>
            ) : (
                <div className="discover-grid">
                    {children}
                </div>
            )}
        </section>
    );
}

import { cn } from '@/lib/utils/utils';

interface ScoreBadgeProps {
    rating: number | null;
    // callers set size and position, e.g. "h-12 w-12 text-2xl"
    className?: string;
}

// 0–10 scale: red up to 4, yellow up to 7, green above
function ratingToneClass(rating: number | null): string {
    if (rating === null) return 'text-neutral-300 bg-muted ring-neutral-400';
    if (rating <= 4) return 'text-red-400 bg-red-400/12 ring-red-400/55';
    if (rating <= 7) return 'text-yellow-300 bg-yellow-300/12 ring-yellow-300/55';
    return 'text-green-400 bg-green-400/12 ring-green-400/55';
}

export default function ScoreBadge({ rating, className }: ScoreBadgeProps) {
    return (
        <span
        className={cn(
            'flex shrink-0 items-center justify-center rounded-full font-bold tabular-nums ring-2 ring-inset',
            ratingToneClass(rating),
            className
        )}>
            {rating ?? '-'}
        </span>
    );
}

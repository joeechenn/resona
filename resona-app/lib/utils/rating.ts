export function ratingColorClass(rating: number | null): string {
    if (rating === null) return 'text-neutral-300';
    if (rating <= 4) return 'text-red-400';
    if (rating <= 7) return 'text-yellow-300';
    return 'text-green-400';
}

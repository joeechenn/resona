export function getCurrentWeekBounds() {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();

    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() - dayOfWeek);
    weekStart.setUTCHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);

    return { weekStart, weekEnd };
}

export function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function getYear(dateString: string | null): string | null {
    if (!dateString) return null;
    return new Date(dateString).getFullYear().toString();
}

export function formatTimestamp(dateString: string): string {
    const now = new Date();
    const created = new Date(dateString);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

    if (diffMinutes < 60) return `${Math.max(1, diffMinutes)}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    // older than a week shows the date, with the year only when it isn't this year
    return created.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(created.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
    });
}

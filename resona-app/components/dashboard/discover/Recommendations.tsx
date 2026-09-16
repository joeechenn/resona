import { getRecommendations, MIN_RECOMMENDATION_RATINGS } from '@/lib/recommendations';
import DiscoverCard from './DiscoverCard';
import DiscoverSection from './DiscoverSection';

export function RecommendationsLoading() {
    return (
        <section className="mb-2 rounded-2xl border border-border bg-surface px-4 py-4 2xl:px-6" aria-busy="true">
            <h3 className="mb-3 text-lg font-bold text-white">Recommended for you</h3>
            <p className="py-4 text-sm text-muted-foreground" role="status">Loading recommendations…</p>
        </section>
    );
}

export default async function Recommendations() {
    const result = await getRecommendations();
    if (result.status === 'signed_out') return null;
    const messages: Record<Exclude<typeof result.status, 'signed_out'>, string> = {
        ready: '',
        insufficient_ratings: `You have ${result.qualifyingRatings ?? 0} of ${MIN_RECOMMENDATION_RATINGS} qualifying ratings. For now, recommendations use ratings above 0/10. Zero ratings are saved and won't be recommended again.`,
        awaiting_training: 'You have enough qualifying ratings. Recommendations will be available after a future training update includes them.',
        empty: 'No new recommendations are available right now. Check back after a future recommendation update.',
        unavailable: 'Recommendations are temporarily unavailable. Please reload this page to try again.',
    };
    return (
        <DiscoverSection title="Recommended for you" isEmpty={result.items.length === 0} emptyMessage={messages[result.status]}>
            {result.items.map(item => (
                <DiscoverCard
                    key={`${item.itemType}:${item.id}`}
                    id={item.id}
                    name={item.name}
                    imageUrl={item.imageUrl}
                    subtitle={item.subtitle}
                    href={item.href}
                    rounded={item.itemType === 'artist'}
                />
            ))}
        </DiscoverSection>
    );
}

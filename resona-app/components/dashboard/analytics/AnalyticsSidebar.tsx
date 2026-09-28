import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/auth';
import ScoreBadge from '@/components/ScoreBadge';
import { getTasteSummary, type TasteSummary } from '@/lib/tasteSummary';

// label from the share of ratings that are 8 or higher
function getRaterLabel(highShare: number): string {
  if (highShare >= 0.6) return 'Rating only favorites?';
  if (highShare <= 0.25) return 'Tough critic';
  return 'Jack Of All Rates';
}

function TasteMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex min-h-full items-center justify-center text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function TastePanel({ summary }: { summary: TasteSummary }) {
  const { counts, distribution, average, highShare, lowestScore, topArtist, recentTens } = summary;
  const peak = Math.max(...distribution);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-extrabold tracking-tight tabular-nums">{average?.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">avg score</span>
      </div>
      <p className="mt-0.5 text-sm font-semibold">
        {getRaterLabel(highShare)}{' '}
        <span className="font-normal whitespace-nowrap text-muted-foreground">{Math.round(highShare * 100)}% are 8+</span>
      </p>

      {/* score histogram, 0 on the left to 10 on the right */}
      <div className="mt-4 flex h-24 items-end gap-1">
        {distribution.map((count, score) => (
          <div key={score} className="group relative flex h-full flex-1 items-end">
            <div
            className={`w-full rounded-t-sm transition-colors ${count === peak ? 'bg-foreground' : 'bg-foreground/25 group-hover:bg-foreground/50'}`}
            style={{ height: `${Math.max(2, (count / peak) * 100)}%` }}
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-[11px] font-semibold whitespace-nowrap text-background opacity-0 transition-opacity group-hover:opacity-100">
              {score} &middot; {count} {count === 1 ? 'rating' : 'ratings'}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>0</span>
        <span>5</span>
        <span>10</span>
      </div>

      <dl className="mt-3">
        <div className="flex items-center justify-between gap-3 border-t border-border/60 py-2.5">
          <dt className="text-xs text-muted-foreground">Most-rated artist</dt>
          <dd className="min-w-0 truncate text-sm font-semibold">
            {topArtist ? (
              <Link href={`/artist/${topArtist.spotifyId}`} className="hover:underline">{topArtist.name}</Link>
            ) : (
              '—'
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border/60 py-2.5">
          <dt className="text-xs text-muted-foreground">Tracks / albums / artists</dt>
          <dd className="text-sm font-semibold whitespace-nowrap tabular-nums">{counts.track} / {counts.album} / {counts.artist}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border/60 py-2.5">
          <dt className="text-xs text-muted-foreground">Lowest score</dt>
          <dd><ScoreBadge rating={lowestScore} className="h-7 w-7 text-xs" /></dd>
        </div>
      </dl>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">Recent 10s</h3>
        <span className="text-xs text-muted-foreground">{recentTens.length}</span>
      </div>
      <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
        {recentTens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing rated 10 yet.</p>
        ) : (
          <ul className="space-y-1">
            {recentTens.map((item) => (
              <li key={`${item.type}:${item.spotifyId}`}>
                <Link href={`/${item.type}/${item.spotifyId}`} className="-mx-1 flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-surface">
                  {item.imageUrl ? (
                    <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={64}
                    height={64}
                    className={`h-16 w-16 shrink-0 object-cover ${item.type === 'artist' ? 'rounded-full' : 'rounded-md'}`}
                    />
                  ) : (
                    <div className={`h-16 w-16 shrink-0 bg-muted ${item.type === 'artist' ? 'rounded-full' : 'rounded-md'}`} />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default async function AnalyticsSidebar() {
  const session = await auth();
  const summary = session?.user?.id ? await getTasteSummary(session.user.id) : null;

  return (
    <section className="flex h-full min-h-0 flex-col rounded-lg bg-card p-4" aria-labelledby="analytics-heading">
      <div className="mb-4 shrink-0">
        <h2 id="analytics-heading" className="text-lg font-semibold leading-7">Your Taste</h2>
        {summary && summary.totalRatings > 0 && (
          <p className="text-xs text-muted-foreground">
            From your {summary.totalRatings} {summary.totalRatings === 1 ? 'rating' : 'ratings'}
          </p>
        )}
      </div>
      <div className="min-h-0 flex-1">
        {!summary ? (
          <TasteMessage>Couldn&apos;t load your taste right now.</TasteMessage>
        ) : summary.totalRatings === 0 ? (
          <TasteMessage>Rate a few tracks to see your taste here.</TasteMessage>
        ) : (
          <TastePanel summary={summary} />
        )}
      </div>
    </section>
  );
}

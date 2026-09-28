import { getCurrentWeekBounds } from "@/lib/utils/timeUtils";
import { auth } from "@/auth"; 
import { prisma } from "@/lib/prisma";

export default async function YourStatsPanel() {
    const session = await auth();
  
    if (!session?.user?.id) {
        return <YourStatsSkeleton />;
    }
  
    const { weekStart, weekEnd } = getCurrentWeekBounds();

    const [tracksRated, albumsRated, artistsRated] = await Promise.all([
    prisma.userTrackStat.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    }),

    prisma.userAlbumStat.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    }),

    prisma.userArtistStat.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    }),
    ]);
  
    return (
    <div className="shrink-0 bg-card rounded-lg p-4">
        <div className="mb-4 flex min-h-7 shrink-0 items-center justify-between gap-2">
            <h2 className="text-lg font-semibold leading-7">Your Stats This Week</h2>
        </div>
        <dl className="grid grid-cols-3 gap-1.5">
            {[
                { label: 'Tracks', count: tracksRated },
                { label: 'Albums', count: albumsRated },
                { label: 'Artists', count: artistsRated },
            ].map(({ label, count }) => (
                <div key={label} className="flex flex-col-reverse rounded-lg bg-surface p-2.5">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-2xl font-extrabold tabular-nums">{count}</dd>
                </div>
            ))}
        </dl>
    </div>
  );
}

function YourStatsSkeleton() {
    return (
        <div className="shrink-0 bg-card rounded-lg p-4">
            <div className="mb-4 flex min-h-7 shrink-0 items-center justify-between gap-2">
                <h2 className="text-lg font-semibold leading-7">Your Stats This Week</h2>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[4.5rem] animate-pulse rounded-lg bg-surface" />
                ))}
            </div>
        </div>
    );
}

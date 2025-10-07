import { TrendingUp } from "lucide-react";
import { getCurrentWeekBounds } from "@/lib/utils/timeUtils";
import { auth } from "@/auth"; 
import { prisma } from "@/lib/prisma";

export default async function YourStatsPanel() {
    const session = await auth();
  
    if (!session?.user?.id) {
        return null;
    }
  
    const { weekStart, weekEnd } = getCurrentWeekBounds();

    const [tracksRanked, albumsRanked, artistsRanked] = await Promise.all([
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
    <div className="bg-neutral-800 rounded-lg p-4">
        <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 mr-2 text-gray-400" />
            <h2 className="text-lg font-semibold">Your Stats This Week</h2>
        </div>
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <p className="text-gray-400">Tracks</p>
                <p className="text-lg font-semibold">{tracksRanked}</p>
            </div>
            <div className="flex justify-between items-center">
                <p className="text-gray-400">Albums</p>
                <p className="text-lg font-semibold">{albumsRanked}</p>
            </div>
            <div className="flex justify-between items-center">
                <p className="text-gray-400">Artists</p>
                <p className="text-lg font-semibold">{artistsRanked}</p>
            </div>
        </div>
    </div>
  );
}
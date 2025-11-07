import { Music } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function FriendActivity() {
    const session = await auth();
    
    if (!session?.user?.id) {
        return <FriendActivitySkeleton />;
    }

    const friendsListening = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            follows: {
                select: {
                    following: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            isListening: true,
                            currentlyPlayingTrack: {
                                select: {
                                    name: true,
                                    artists: {
                                        select: {
                                            artist: {
                                                select: {
                                                    name: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                where: {
                    following: {
                        isListening: true,
                    },
                },
            },
        },
    });
    
    const activeListeners = friendsListening?.follows || [];
    
    return (
    <div className="bg-neutral-800 rounded-lg p-4">
        <div className="flex items-center mb-4">
            <Music className="w-5 h-5 mr-2 text-gray-400" />
            <h2 className="text-lg font-semibold">Friend Activity</h2>
        </div>
        
        {activeListeners.length === 0 ? (
            <p className="text-gray-400 text-sm">
                Add more friends who connected with Spotify to see what they're up to!
            </p>
            ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800">
                {activeListeners.map(({ following }) => (
                    <div key={following.id} className="flex items-start gap-3">
                        <img
                        src={following.image || "/default-avatar.png"}
                        alt={following.name || "User"}
                        className="w-10 h-10 rounded-full"/>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                                {following.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                                {following.currentlyPlayingTrack?.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {following.currentlyPlayingTrack?.artists.map((trackArtist) => trackArtist.artist.name).join(", ")}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}

function FriendActivitySkeleton() {
    return (
        <div className="bg-neutral-800 rounded-lg p-3">
            <div className="flex items-center mb-4">
                <Music className="w-5 h-5 mr-2 text-gray-400" />
                <h2 className="text-lg font-semibold">Friend Activity</h2>
            </div>
            <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="flex items-start gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-neutral-700" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-neutral-700 rounded w-24" />
                            <div className="h-3 bg-neutral-700 rounded w-32" />
                            <div className="h-3 bg-neutral-700 rounded w-28" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
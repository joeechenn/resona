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
    <div className="flex min-h-0 flex-1 flex-col bg-card rounded-lg p-4">
        <div className="mb-4 flex min-h-7 shrink-0 items-center justify-between gap-2">
            <h2 className="text-lg font-semibold leading-7">Friend Activity</h2>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
            {activeListeners.length === 0 ? (
                <p className="flex min-h-full items-center justify-center text-center text-sm text-muted-foreground">
                    Add more friends who connected with Spotify to see what they&apos;re up to!
                </p>
                ) : (
                <div className="space-y-3">
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
                                <p className="text-xs text-muted-foreground truncate">
                                    {following.currentlyPlayingTrack?.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {following.currentlyPlayingTrack?.artists.map((trackArtist) => trackArtist.artist.name).join(", ")}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}

function FriendActivitySkeleton() {
    return (
        <div className="flex min-h-0 flex-1 flex-col bg-card rounded-lg p-4">
            <div className="mb-4 flex min-h-7 shrink-0 items-center justify-between gap-2">
                <h2 className="text-lg font-semibold leading-7">Friend Activity</h2>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="flex items-start gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-24" />
                            <div className="h-3 bg-muted rounded w-32" />
                            <div className="h-3 bg-muted rounded w-28" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

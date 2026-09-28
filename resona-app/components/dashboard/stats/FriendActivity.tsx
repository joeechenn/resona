import Link from "next/link";
import { auth } from "@/auth";
import ScoreBadge from "@/components/ScoreBadge";
import { getFriendActivity, type FriendRating } from "@/lib/friendActivity";
import { getInitial } from "@/lib/utils/utils";

function FriendRatingRow({ user, type, spotifyId, title, subtitle, rating }: FriendRating) {
    const displayName = user.name || "Anonymous";

    return (
        <li className="flex items-center gap-3 border-t border-border/60 py-2.5 first:border-t-0 first:pt-0">
            <Link href={`/profile/${user.id}`} className="shrink-0">
                {user.image ? (
                    <img src={user.image} alt={displayName} className="h-9 w-9 rounded-full object-cover" />
                ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                        {getInitial(user.name)}
                    </div>
                )}
            </Link>
            <div className="min-w-0 flex-1">
                <Link href={`/profile/${user.id}`} className="block truncate text-sm font-bold hover:underline">
                    {displayName}
                </Link>
                <Link href={`/${type}/${spotifyId}`} className="block truncate text-xs text-muted-foreground transition-colors hover:text-foreground">
                    {title} &middot; {subtitle}
                </Link>
            </div>
            <ScoreBadge rating={rating} className="h-8 w-8 text-sm" />
        </li>
    );
}

export default async function FriendActivity() {
    const session = await auth();
    const activity = session?.user?.id ? await getFriendActivity(session.user.id) : null;

    const emptyMessage = !activity
        ? "Couldn't load friend activity right now."
        : !activity.followsAnyone
            ? "Follow people to see their latest ratings here."
            : "The people you follow haven't rated anything yet.";

    return (
    <div className="flex min-h-0 flex-1 flex-col bg-card rounded-lg p-4">
        <div className="mb-4 shrink-0">
            <h2 className="text-lg font-semibold leading-7">Friend Activity</h2>
            <p className="text-xs text-muted-foreground">Each friend&apos;s latest rating</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
            {activity && activity.ratings.length > 0 ? (
                <ul>
                    {activity.ratings.map((friendRating) => (
                        <FriendRatingRow key={friendRating.postId} {...friendRating} />
                    ))}
                </ul>
            ) : (
                <p className="flex min-h-full items-center justify-center text-center text-sm text-muted-foreground">
                    {emptyMessage}
                </p>
            )}
        </div>
    </div>
  );
}

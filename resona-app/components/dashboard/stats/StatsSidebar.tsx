import YourStatsPanel from "./YourStatsPanel";
import FriendActivity from "./FriendActivity";

export default function StatsSidebar() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <YourStatsPanel />
      <FriendActivity />
    </div>
  );
}

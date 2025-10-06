import YourStatsPanel from "./YourStatsPanel";
import FriendAcitivty from "./FriendActivity";  

export default function StatsSidebar() {
  return (
  <div className="flex flex-col gap-2">
    <YourStatsPanel />
    <FriendAcitivty />
    </div>
  );
}
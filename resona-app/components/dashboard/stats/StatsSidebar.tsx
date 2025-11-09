import YourStatsPanel from "./YourStatsPanel";
import FriendAcitivty from "./FriendActivity";  

export default function StatsSidebar() {
  return (
  <div className="flex flex-col gap-5">
    <YourStatsPanel />
    <FriendAcitivty />
    </div>
  );
}
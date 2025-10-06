import TopGenre from "./cards/TopGenreCard";
import Uniquness from "./cards/UniquenessCard";
import HighestRated from "./cards/HighestRatedCard";
import { Activity } from "lucide-react";

export default function AnalyticsSidebar() {
  return (
  <div className="h-full flex flex-col bg-neutral-800 rounded-lg gap-4">
    <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-gray-400" />
        <div className="text-sm font-semibold">Analytics This Week</div>
        </div>
        <div className="text-xs font-semibold hover:underline cursor-pointer">
                See All
        </div>
    </div>
    
    <div className="flex-1 min-h-0 px-4 pb-8">
        <div className="h-full flex flex-col gap-4">
            <TopGenre />
            <Uniquness />
            <HighestRated />
        </div>
        <div className="h-4"></div>
    </div>
    </div>
    );
}
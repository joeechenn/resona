import { TrendingUp } from "lucide-react";

export default function YourStatsPanel() {
    return (
    <div className="bg-neutral-800 rounded-lg p-4">
        <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 mr-2 text-gray-400" />
        <h2 className="text-lg font-semibold">Your Stats This Week</h2>
        </div>
    </div>
  );
}
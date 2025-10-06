import { ChartColumn } from "lucide-react";

export default function TopGenreCard() {
    return (
    <div className="flex-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 flex flex-col justify-center">
        <div className="flex justify-center mb-1">
            <ChartColumn className="w-4 h-4" />
        </div>
        <div className="text-center text-sm font-bold uppercase mb-3">
            Top Genre
        </div>
        <div className="text-center">
            <p className="text-white text-xs px-10">Rate more artists, albums and songs to see your top genres!</p> 
        </div>
    </div>
  );
}
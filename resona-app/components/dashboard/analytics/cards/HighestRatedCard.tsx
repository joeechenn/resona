import { Heart } from "lucide-react";

export default function HighestRatedCard() {
    return (
    <div className="flex-1 bg-gradient-to-br from-pink-500 to-rose-400 rounded-lg p-6 flex flex-col justify-center">
        <div className="flex justify-center mb-1">
            <Heart className="w-4 h-4" />
        </div>
        <div className="text-center text-sm font-bold uppercase mb-3">
            Highest Rated
        </div>
        <div className="text-center">
            <p className="text-white text-xs px-10">Rate music to see your highest-rated tracks!</p> 
        </div>
    </div>
  );
}
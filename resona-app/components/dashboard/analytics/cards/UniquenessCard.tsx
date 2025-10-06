import { Flame } from "lucide-react";

export default function UniquenessCard() {
    return (
    <div className="flex-1 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg p-6 flex flex-col justify-center">
        <div className="flex justify-center mb-1">
            <Flame className="w-4 h-4" />
        </div>
        <div className="text-center text-sm font-bold uppercase mb-3">
            Uniqueness Score
        </div>
        <div className="text-center">
            <p className="text-white text-xs px-10">Rate more artists, albums and songs to see your score!</p> 
        </div>
    </div>
  );
}
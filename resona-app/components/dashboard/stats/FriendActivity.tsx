import { User } from "lucide-react";

export default function FriendActivity() {
    return (
    <div className="bg-neutral-800 rounded-lg p-4">
        <div className="flex items-center mb-4">
            <User className="w-5 h-5 mr-2 text-gray-400" />
            <h2 className="text-md font-bold">Friend Activity</h2>
        </div>
    </div>
  );
}
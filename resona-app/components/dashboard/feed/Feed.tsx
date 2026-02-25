export default function Feed() {
    return (
        <div className="flex-1 bg-neutral-800 rounded-lg p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Your Feed</h2>
                <button className="px-6 py-2 bg-neutral-900 text-white font-bold rounded-md border border-neutral-600 hover:bg-neutral-700 transition-colors">
                    Filter
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center">
                <p className="text-white font-bold">Feed posts will go here</p>
            </div>
        </div>
    );
}
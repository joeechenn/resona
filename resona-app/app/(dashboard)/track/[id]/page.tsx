import { getTrack } from '@/lib/spotify';
import Image from 'next/image';
import Link from 'next/link';

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const track = await getTrack(id);
    
    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    
    const trackArt = track.album.images[0]?.url;
    const artistNames = track.artists.map(artist => artist.name).join(', ');
    
    return (
    <div className="flex-1 bg-neutral-800 rounded-lg p-8 flex flex-col overflow-y-auto">
        <div className="flex gap-8">
            <div className="flex-shrink-0">
                {trackArt && (
                    <Image
                    src={trackArt}
                    alt={`${track.name} album art`}
                    width={272}
                    height={272}
                    className="rounded-lg shadow-lg"
                    />
                    )}
            </div>
            <div className="flex flex-col gap-4">
                <div>
                    <span className="inline-block px-3 py-1 bg-neutral-700 text-white text-xs font-semibold uppercase tracking-wider rounded">
                        TRACK
                    </span>
                    <h1 className="text-4xl font-extrabold text-white mt-2">
                        {track.name}
                    </h1>
                    <p className="text-xl text-gray-400 mt-2">
                        <span className="text-white font-bold"> {artistNames} </span> • {formatDuration(track.duration_ms)}
                    </p>
                </div>
            <div>
                <p className="text-md text-gray-400">
                    Track on <span className="text-white font-bold"> {track.album.name} </span>
                </p>
                <p className="text-md text-gray-400">
                    Released {new Date(track.album.release_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                        })}
                </p>
            </div>
            <div className="flex gap-4 mt-2">
                <button className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-200">
                    Rate
                </button>
                <Link 
                href={track.external_urls.spotify}
                target="_blank"
                className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 flex items-center gap-2"
                >
                Open in Spotify
                </Link>
            </div>
        </div>
        </div>
    </div>
    );
}
import { getTrack } from '@/lib/spotify';
import Image from 'next/image';
import Link from 'next/link';
import RatingModal from '@/components/RatingModal';

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
        <div className="flex flex-1 flex-col overflow-y-auto rounded-lg bg-card p-4 xl:p-6 2xl:p-8">
            <div className="detail-hero">
                <div className="flex shrink-0 justify-center self-start">
                    {trackArt && (
                        <Image
                            src={trackArt}
                            alt={`${track.name} album art`}
                            width={272}
                            height={272}
                            className="detail-artwork rounded-lg object-cover shadow-lg"
                        />
                    )}
                </div>
                <div className="flex min-w-0 flex-col gap-4">
                    <div>
                        <span className="inline-block px-3 py-1 bg-muted text-white text-xs font-semibold uppercase tracking-wider rounded">
                            TRACK
                        </span>
                        <h1 className="detail-title mt-2 font-extrabold text-white">
                            {track.name}
                        </h1>
                        <p className="text-xl text-muted-foreground mt-2">
                            <span className="text-white font-bold"> {artistNames} </span> • {formatDuration(track.duration_ms)}
                        </p>
                    </div>
                    <div>
                        <p className="text-md text-muted-foreground">
                            Track on <span className="text-white font-bold"> {track.album.name} </span>
                        </p>
                        <p className="text-md text-muted-foreground">
                            Released {new Date(track.album.release_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 2xl:gap-4">
                        <RatingModal
                            type="track"
                            spotifyId={id}
                            name={track.name}
                            artist={artistNames}
                            imageUrl={trackArt}
                        />
                        <Link
                            href={track.external_urls.spotify}
                            target="_blank"
                            className="flex items-center gap-2 whitespace-nowrap rounded-full bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700 2xl:px-6"
                        >
                            Open in Spotify
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

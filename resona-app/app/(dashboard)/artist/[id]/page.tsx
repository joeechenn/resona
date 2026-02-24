import { getArtist } from '@/lib/spotify';
import Image from 'next/image';
import Link from 'next/link';
import RatingModal from '@/components/RatingModal';

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const artist = await getArtist(id);
    const artistImage = artist.images[0]?.url;

    const formatFollowers = (count: number) => {
        return count.toLocaleString();
    }

    return (
        <div className="flex-1 bg-neutral-800 rounded-lg p-8 flex flex-col overflow-y-auto">
            <div className="flex gap-8">
                <div className="flex-shrink-0">
                    {artistImage && (
                        <Image
                            src={artistImage}
                            alt={`${artist.name}`}
                            width={272}
                            height={272}
                            className="rounded-full shadow-lg"
                        />
                    )}
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <span className="inline-block px-3 py-1 bg-neutral-700 text-white text-xs font-semibold uppercase tracking-wider rounded">
                            ARTIST
                        </span>
                        <h1 className="text-4xl font-bold text-white mt-2">
                            {artist.name}
                        </h1>
                    </div>
                    <div className="flex gap-4 mt-4">
                        <RatingModal
                            type="artist"
                            spotifyId={id}
                            name={artist.name}
                            artist={artist.name}
                            imageUrl={artistImage}
                        />
                        <Link
                            href={artist.external_urls.spotify}
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
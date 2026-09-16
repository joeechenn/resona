import { getArtist } from '@/lib/spotify';
import Image from 'next/image';
import Link from 'next/link';
import RatingModal from '@/components/RatingModal';

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const artist = await getArtist(id);
    const artistImage = artist.images[0]?.url;

    return (
        <div className="flex flex-1 flex-col overflow-y-auto rounded-lg bg-card p-4 xl:p-6 2xl:p-8">
            <div className="detail-hero">
                <div className="flex shrink-0 justify-center self-start">
                    {artistImage && (
                        <Image
                            src={artistImage}
                            alt={`${artist.name}`}
                            width={272}
                            height={272}
                            className="detail-artwork rounded-full object-cover shadow-lg"
                        />
                    )}
                </div>

                <div className="flex min-w-0 flex-col gap-4">
                    <div>
                        <span className="inline-block px-3 py-1 bg-muted text-white text-xs font-semibold uppercase tracking-wider rounded">
                            ARTIST
                        </span>
                        <h1 className="detail-title mt-2 font-bold text-white">
                            {artist.name}
                        </h1>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 2xl:gap-4">
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

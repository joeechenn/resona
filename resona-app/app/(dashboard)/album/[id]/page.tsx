import { getAlbum } from '@/lib/spotify';
import Image from 'next/image';
import Link from 'next/link';
import RatingModal from '@/components/RatingModal';

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const album = await getAlbum(id);
    const albumArt = album.images[0]?.url;
    const artistNames = album.artists.map(artist => artist.name).join(', ');

    return (
        <div className="flex-1 bg-neutral-800 rounded-lg p-8 flex flex-col overflow-y-auto">
            <div className="flex gap-8">
                <div className="flex-shrink-0">
                    {albumArt && (
                        <Image
                            src={albumArt}
                            alt={`${album.name} album art`}
                            width={272}
                            height={272}
                            className="rounded-lg shadow-lg"
                        />
                    )}
                </div>
                <div className="flex flex-col gap-4">
                    <div>
                        <span className="inline-block px-3 py-1 bg-neutral-700 text-white text-xs font-semibold uppercase tracking-wider rounded">
                            ALBUM
                        </span>
                        <h1 className="text-4xl font-extrabold text-white mt-2">
                            {album.name}
                        </h1>
                        <p className="text-xl text-white font-bold mt-2">
                            {artistNames}
                        </p>
                    </div>
                    <div>
                        <p className="text-md text-gray-400">
                            {album.total_tracks} {album.total_tracks === 1 ? 'track' : 'tracks'}
                        </p>
                        <p className="text-md text-gray-400">
                            Released {new Date(album.release_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="flex gap-4 mt-2">
                        <RatingModal
                            type="album"
                            spotifyId={id}
                            name={album.name}
                            artist={artistNames}
                            imageUrl={albumArt}
                        />
                        <Link
                            href={album.external_urls.spotify}
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
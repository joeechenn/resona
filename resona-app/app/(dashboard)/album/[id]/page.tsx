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
        <div className="flex flex-1 flex-col overflow-y-auto rounded-lg bg-card p-4 xl:p-6 2xl:p-8">
            <div className="detail-hero">
                <div className="flex shrink-0 justify-center self-start">
                    {albumArt && (
                        <Image
                            src={albumArt}
                            alt={`${album.name} album art`}
                            width={272}
                            height={272}
                            className="detail-artwork rounded-lg object-cover shadow-lg"
                        />
                    )}
                </div>
                <div className="flex min-w-0 flex-col gap-4">
                    <div>
                        <span className="inline-block px-3 py-1 bg-muted text-white text-xs font-semibold uppercase tracking-wider rounded">
                            ALBUM
                        </span>
                        <h1 className="detail-title mt-2 font-extrabold text-white">
                            {album.name}
                        </h1>
                        <p className="text-xl text-white font-bold mt-2">
                            {artistNames}
                        </p>
                    </div>
                    <div>
                        <p className="text-md text-muted-foreground">
                            {album.total_tracks} {album.total_tracks === 1 ? 'track' : 'tracks'}
                        </p>
                        <p className="text-md text-muted-foreground">
                            Released {new Date(album.release_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 2xl:gap-4">
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

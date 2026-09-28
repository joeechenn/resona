type ArtistCredits = { artists: { artist: { name: string } }[] };

// "Artist A, Artist B" for a track or album's credited artists
export function joinArtistNames({ artists }: ArtistCredits): string {
    return artists.map(({ artist }) => artist.name).join(', ') || 'Unknown artist';
}

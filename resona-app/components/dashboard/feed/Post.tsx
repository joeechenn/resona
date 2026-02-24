interface Post {
    id: string;
    userId: string;
    user: {
        id: string;
        name: string;
        image: string;
    };
    
    track: {
        id: string;
        name: string;
        spotifyId: string;
        durationMs: number;
        album: {
            imageUrl: string;
            name: string;
            _count: {
                select: {
                    tracks: number;
                }
            }
        } | null;
        artists: Array<{
            artist: {
                id: string;
                name: string;
            };
        }>;
    } | null;

    album: {
        id: string;
        name: string;
        spotifyId: string;
        imageUrl: string | null;
        releaseDate: string | null;
        primaryArtist: {
            id: string;
            name: string;
        } | null;
        _count: {
            tracks: number;
        };
    } | null;

    artist: {
        id: string;
        name: string;
        spotifyId: string;
        imageUrl: string | null;
    } | null;

    rating: number | null;
    createdAt: string;
}
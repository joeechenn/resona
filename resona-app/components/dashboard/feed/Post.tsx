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
        albumId: string | null;
    } | null;

    album: {
        
    } | null;

    artist: {

    } | null;
    rating: number | null;
    createdAt: string;
}
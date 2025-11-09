export async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
    }>;
    release_date: string;
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}

interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  external_urls: {
    spotify: string;
  };
  followers: {
    total: number;
  };
  images: Array<{
    url: string;
  }>;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  uri: string;
  release_date: string;
  total_tracks: number;
  external_urls: {
    spotify: string;
  };
  images: Array<{
    url: string;
  }>;
  artists: Array<{
    id: string;
    name: string;
  }>;
}

export async function getTrack(trackId: string): Promise<SpotifyTrack> {
  const token = await getSpotifyAccessToken();
  
  const response = await fetch(
    `https://api.spotify.com/v1/tracks/${trackId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch track');
  }

  return response.json();
}

export async function getArtist(artistId: string): Promise<SpotifyArtist> {
  const token = await getSpotifyAccessToken();
  
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch artist');
  }

  return response.json();
}

export async function getAlbum(albumId: string): Promise<SpotifyAlbum> {
  const token = await getSpotifyAccessToken();
  
  const response = await fetch(
    `https://api.spotify.com/v1/albums/${albumId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch album');
  }

  return response.json();
}
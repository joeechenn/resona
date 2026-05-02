import { prisma } from "@/lib/prisma";

export async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify client credentials");
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Spotify access token (${response.status})`);
  }

  const data = await response.json();
  if (!data?.access_token) {
    throw new Error("Spotify access token missing in response");
  }

  return data.access_token;
}

async function refreshSpotifyToken(userId: string): Promise<string | null> {
  // fetch user's refresh token
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { spotifyRefreshToken: true }
  });

  // no refresh token, user never linked Spotify
  if (!user?.spotifyRefreshToken) {
    return null;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify client credentials");
  }

  // swap refresh token for a new access token
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: `grant_type=refresh_token&refresh_token=${user.spotifyRefreshToken}`
  });

  // refresh failed, clear Spotify fields to reset to unlinked state
  if (!response.ok) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        spotifyId: null,
        spotifyAccessToken: null,
        spotifyRefreshToken: null,
        spotifyTokenExpiry: null,
      }
    });
    console.error(`Spotify token refresh failed for user ${userId} (${response.status})`);
    return null;
  }

  // parse response, Spotify returns access_token, expires_in, and sometimes a new refresh_token
  const data = await response.json();
  if (!data?.access_token) {
    return null;
  }

  // persist new tokens, keep old refresh token if Spotify didn't rotate it
  await prisma.user.update({
    where: { id: userId },
    data: {
      spotifyAccessToken: data.access_token,
      spotifyRefreshToken: data.refresh_token || user.spotifyRefreshToken,
      spotifyTokenExpiry: new Date(Date.now() + data.expires_in * 1000),
    }
  });

  return data.access_token;
}

export async function getValidSpotifyToken(userId: string): Promise<string | null> {
  // fetch user's token fields
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      spotifyAccessToken: true,
      spotifyRefreshToken: true,
      spotifyTokenExpiry: true,
    }
  });

  // no refresh token, user never linked Spotify
  if (!user?.spotifyRefreshToken) {
    return null;
  }

  // token still valid and not within 5 min expiry buffer
  const bufferMs = 5 * 60 * 1000;
  if (user.spotifyTokenExpiry && user.spotifyTokenExpiry.getTime() > Date.now() + bufferMs) {
    return user.spotifyAccessToken;
  }

  // expired or within buffer, attempt refresh
  return await refreshSpotifyToken(userId);
}

export async function getTopTracks(userId: string, limit: number = 20): Promise<SpotifyTrack[] | null> {
  const token = await getValidSpotifyToken(userId);
  if (!token) return null;

  const response = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?limit=${limit}&time_range=short_term`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  if (!response.ok) {
    console.error(`Failed to fetch top tracks for user ${userId} (${response.status})`);
    return null;
  }

  const data = await response.json();
  return data.items;
}

export async function getTopArtists(userId: string, limit: number = 20): Promise<SpotifyArtist[] | null> {
  const token = await getValidSpotifyToken(userId);
  if (!token) return null;

  const response = await fetch(
    `https://api.spotify.com/v1/me/top/artists?limit=${limit}&time_range=short_term`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  if (!response.ok) {
    console.error(`Failed to fetch top artists for user ${userId} (${response.status})`);
    return null;
  }

  const data = await response.json();
  return data.items;
}

export async function getRecentlyPlayed(userId: string, limit: number = 20): Promise<SpotifyTrack[] | null> {
  const token = await getValidSpotifyToken(userId);
  if (!token) return null;

  const response = await fetch(
    `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  if (!response.ok) {
    console.error(`Failed to fetch recently played for user ${userId} (${response.status})`);
    return null;
  }

  // items are PlayHistoryObjects, unwrap .track from each
  const data = await response.json();
  return data.items.map((item: { track: SpotifyTrack }) => item.track);
} 

export function getSpotifyRedirectUri() {
  return `${process.env.AUTH_URL}/api/spotify/callback`;
}

export const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-top-read",
  "user-read-recently-played",
  "user-library-read",
];

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
    total_tracks: number;
  };
  duration_ms: number;
  popularity?: number;
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

// approximates a "global top tracks of the current year" list using client credentials
// spotify deprecated direct access so use the search endpoint with a year filter and re-sort the results by popularity
export async function getGlobalTop(limit: number = 50): Promise<SpotifyTrack[]> {
  const token = await getSpotifyAccessToken();
  const currentYear = new Date().getFullYear();

  // search returns up to 50 results, ordered by Spotify's relevance ranking, re-sort by popularity
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(`genre:pop year:${currentYear}`)}&type=track&limit=50`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch global top tracks (${response.status})`);
  }

  const data = await response.json();
  const tracks: SpotifyTrack[] = data?.tracks?.items ?? [];

  // sort by popularity descending and slice to the requested limit
  return tracks
    .slice()
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, limit);
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

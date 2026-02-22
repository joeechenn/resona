import { NextRequest, NextResponse } from 'next/server';
import { getSpotifyAccessToken } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = (searchParams.get('q') ?? '').trim();
  const rawType = (searchParams.get('type') ?? 'track,artist,album').trim();
  const allowedTypes = new Set(['track', 'artist', 'album']);
  const parsedTypes = rawType.split(',').map((value) => value.trim()).filter(Boolean);

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  if (parsedTypes.length === 0 || parsedTypes.some((value) => !allowedTypes.has(value))) {
    return NextResponse.json(
      { error: 'Invalid "type" parameter. Allowed values: track,artist,album' },
      { status: 400 }
    );
  }

  try {
    const token = await getSpotifyAccessToken();
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${parsedTypes.join(',')}&limit=5`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Spotify rate limit exceeded. Please retry shortly.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Spotify search request failed', details: data?.error?.message ?? undefined },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSpotifyAccessToken } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  // validate query parameters
  const query = (searchParams.get('q') ?? '').trim();
  // validate type 
  const rawType = (searchParams.get('type') ?? 'track,artist,album').trim();
  const allowedTypes = new Set(['track', 'artist', 'album']);
  const parsedTypes = rawType.split(',').map((value) => value.trim()).filter(Boolean);

  // if no query is provided, return an error
  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  // if any of the provided types are invalid, return an error
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

    // handle Spotify API errors
    if (!response.ok) {
      // check if rate limit exceeded
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Spotify rate limit exceeded. Please try again shortly.' },
          { status: 429 }
        );
      }

      // for other upstream errors, return error message if available
      return NextResponse.json(
        { error: 'Spotify search request failed', details: data?.error?.message ?? undefined },
        { status: 502 }
      );
    }

    // success
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    // check unexpected internal server errors 
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

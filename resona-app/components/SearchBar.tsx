'use client';

import { useState, useRef } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';

type SearchResults = {
  tracks?: {
    items: Array<{
      id: string;
      name: string;
      artists: Array<{ name: string }>;
      album: { name: string; images: Array<{ url: string }> };
    }>;
  };
  artists?: {
    items: Array<{
      id: string;
      name: string;
      images: Array<{ url: string }>;
    }>;
  };
  albums?: {
    items: Array<{
      id: string;
      name: string;
      artists: Array<{ name: string }>;
      release_date?: string;
      images: Array<{ url: string }>;
    }>;
  };
};

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      setSearchError(null);
      return;
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=track,artist,album`);
      const data = await response.json();

      if (!response.ok) {
        setResults(null);
        setSearchError(typeof data?.error === 'string' ? data.error : 'Search failed. Please try again.');
        return;
      }

      setResults(data);
      setSearchError(null);
    } catch (error) {
      console.error('Search error:', error);
      setResults(null);
      setSearchError('Network error while searching.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleResultClick = () => {
    setResults(null);
    setQuery('');
  };

  return (
    <div className="relative flex-1 max-w-xl">
      <div className="flex items-center border border-border bg-card rounded-lg px-4 py-2 transition-colors focus-within:border-ring">
        <Search className="w-5 h-5 text-muted-foreground mr-3" />
        <input
          type="text"
          placeholder="Search music…"
          aria-label="Search tracks, artists, and albums"
          value={query}
          onChange={handleInputChange}
          className="min-w-0 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground w-full"
        />
      </div>

      {results && (
        <div className="absolute top-full mt-2 w-full bg-card rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">

          {results.tracks?.items && results.tracks.items.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase border-b border-border">
                Tracks
              </div>
              {results.tracks.items.slice(0, 3).map((track) => (
                <Link
                  key={track.id}
                  href={`/track/${track.id}`}
                  onClick={handleResultClick}
                  className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b border-border"
                >
                  {track.album.images?.[0]?.url ? (
                    <img
                      src={track.album.images[0].url}
                      alt=""
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-muted flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white truncate">
                      {track.name}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {track.artists.map((a: { name: string }) => a.name).join(', ')} • {track.album.name}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {results.artists?.items && results.artists.items.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase border-b border-border">
                Artists
              </div>
              {results.artists.items.slice(0, 1).map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.id}`}
                  onClick={handleResultClick}
                  className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b border-border"
                >
                  {artist.images?.[0]?.url ? (
                    <img
                      src={artist.images[0].url}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white truncate">
                      {artist.name}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      Artist
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {results.albums?.items && results.albums.items.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase border-b border-border">
                Albums
              </div>
              {results.albums.items.slice(0, 1).map((album) => (
                <Link
                  key={album.id}
                  href={`/album/${album.id}`}
                  onClick={handleResultClick}
                  className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b border-border"
                >
                  {album.images?.[0]?.url ? (
                    <img
                      src={album.images[0].url}
                      alt=""
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-muted flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white truncate">
                      {album.name}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {album.artists.map((a: { name: string }) => a.name).join(', ')}
                      {album.release_date && ` • ${album.release_date.split('-')[0]}`}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      )}

      {searchError && (
        <p className="mt-2 text-xs text-red-400">{searchError}</p>
      )}
    </div>
  );
}

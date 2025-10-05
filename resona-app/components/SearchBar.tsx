'use client';

import { useState, useRef } from 'react';
import { Search } from 'lucide-react';

type SearchResults = {
  tracks?: {
    items: Array<{
      id: string;
      name: string;
      artists: Array<{ name: string }>;
      album: { name: string };
    }>;
  };
  artists?: {
    items: Array<any>;
  };
  albums?: {
    items: Array<any>;
  };
};

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (searchQuery: string) => {
    console.log('Search called with:', searchQuery);
    
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=track,artist,album`);
      const data = await response.json();
      console.log('Search results:', data);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
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
  
  return (
    <div className="relative flex-1 max-w-xl">
      <div className="flex items-center bg-neutral-800 rounded-lg px-4 py-2">
        <Search className="w-5 h-5 text-gray-400 mr-3" />
        <input
          type="text"
          placeholder="Search songs, artists, or users..."
          value={query}
          onChange={handleInputChange}
          className="bg-transparent border-none outline-none text-white placeholder-gray-400 w-full"
        />
      </div>

      {results && (
        <div className="absolute top-full mt-2 w-full bg-neutral-800 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          
          {results.tracks?.items && results.tracks.items.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase border-b border-gray-700">
                Tracks
              </div>
              {results.tracks.items.slice(0,1).map((track) => (
                <div key={track.id} className="p-3 hover:bg-neutral-700 cursor-pointer border-b border-gray-700">
                  <div className="font-semibold text-white">{track.name}</div>
                  <div className="text-sm text-gray-400">
                    {track.artists.map((a: { name: string }) => a.name).join(', ')} • {track.album.name}
                  </div>
                </div>
              ))}
            </div>
          )}
          {results.artists?.items && results.artists.items.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase border-b border-gray-700">
                Artists
              </div>
              {results.artists.items.slice(0,1).map((artist) => (
                <div key={artist.id} className="p-3 hover:bg-neutral-700 cursor-pointer border-b border-gray-700">
                  <div className="font-semibold text-white">{artist.name}</div>
                  <div className="text-sm text-gray-400">
                    Artist
                  </div>
                </div>
              ))}
            </div>
          )}
          {results.albums?.items && results.albums.items.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase border-b border-gray-700">
                Albums
              </div>
              {results.albums.items.slice(0,1).map((album) => (
                <div key={album.id} className="p-3 hover:bg-neutral-700 cursor-pointer border-b border-gray-700">
                  <div className="font-semibold text-white">{album.name}</div>
                  <div className="text-sm text-gray-400">
                    {album.artists.map((a: { name: string }) => a.name).join(', ')}
                    {album.release_date && ` • ${album.release_date.split('-')[0]}`}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
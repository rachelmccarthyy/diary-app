'use client';

import { useState } from 'react';

interface SpotifyEmbedProps {
  url?: string;
  onChange: (url: string | undefined) => void;
}

function parseSpotifyEmbedUrl(input: string): string | null {
  try {
    const u = new URL(input.trim());
    if (!u.hostname.includes('spotify.com')) return null;
    const match = u.pathname.match(/\/(track|playlist|album|artist|episode|show)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    const [, type, id] = match;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  } catch {
    return null;
  }
}

export default function SpotifyEmbed({ url, onChange }: SpotifyEmbedProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  function handleAdd() {
    const embedUrl = parseSpotifyEmbedUrl(input);
    if (!embedUrl) {
      setError('Paste a valid Spotify track, album, playlist, or episode URL');
      return;
    }
    setError('');
    setInput('');
    onChange(embedUrl);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }

  if (url) {
    return (
      <div className="space-y-2">
        <iframe
          src={url}
          width="100%"
          height="152"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl"
          style={{ border: 'none' }}
        />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-xs text-stone-400 hover:text-red-400 transition-colors"
        >
          Remove song
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="Paste a Spotify URL..."
          className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 placeholder:text-stone-400 bg-white focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!input.trim()}
          className="px-3 py-2 bg-[#1DB954] text-white text-sm font-semibold rounded-lg hover:bg-[#1aa34a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          ♫ Add
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-xs text-stone-400">
        Supports tracks, albums, playlists, podcasts &middot; e.g. https://open.spotify.com/track/...
      </p>
    </div>
  );
}

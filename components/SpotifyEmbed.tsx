'use client';

import { useState } from 'react';

interface SpotifyEmbedProps {
  url?: string;
  title?: string;
  onChange: (url: string | undefined, title?: string) => void;
}

function parseSpotifyEmbedUrl(input: string): string | null {
  try {
    const u = new URL(input.trim());
    if (!u.hostname.includes('spotify.com')) return null;
    const match = u.pathname.match(/\/(track|playlist|album|artist|episode|show)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    const [, type, id] = match;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  } catch { return null; }
}

async function fetchSpotifyTitle(spotifyUrl: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`);
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.title as string;
  } catch { return undefined; }
}

export default function SpotifyEmbed({ url, title, onChange }: SpotifyEmbedProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    const embedUrl = parseSpotifyEmbedUrl(input);
    if (!embedUrl) { setError('Paste a valid Spotify track, album, playlist, or episode URL'); return; }
    setError('');
    setLoading(true);
    const trackTitle = await fetchSpotifyTitle(input.trim());
    setLoading(false);
    setInput('');
    onChange(embedUrl, trackTitle);
  }

  if (url) {
    return (
      <div className="space-y-2">
        {title && <p className="text-xs font-medium text-[#1DB954] flex items-center gap-1"><span>♫</span> {title}</p>}
        <iframe src={url} width="100%" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="rounded-xl" style={{ border: 'none' }} />
        <button type="button" onClick={() => onChange(undefined, undefined)} className="text-xs hover:text-red-400 transition-colors" style={{ color: 'var(--th-faint)' }}>Remove song</button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          placeholder="Paste a Spotify URL..."
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all placeholder:opacity-40"
          style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!input.trim() || loading}
          className="px-3 py-2 bg-[#1DB954] text-white text-sm font-semibold rounded-lg hover:bg-[#1aa34a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          {loading ? '...' : '♫ Add'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-xs" style={{ color: 'var(--th-faint)' }}>Supports tracks, albums, playlists, podcasts</p>
    </div>
  );
}

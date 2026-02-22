'use client';

import Link from 'next/link';
import { DiaryEntry } from '@/lib/types';
import { formatEntryDateShort } from '@/lib/storage';

interface EntryCardProps {
  entry: DiaryEntry;
  searchQuery?: string;
}

function highlight(text: string, query: string): string {
  return text; // Raw text; highlighting handled via CSS mark below
}

export default function EntryCard({ entry, searchQuery }: EntryCardProps) {
  const preview = entry.body
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*|__|\*|_|~~|`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .slice(0, 200);

  const dateStr = formatEntryDateShort(entry.createdAt, entry.timezone);

  const thumbnail = entry.images?.[0];

  return (
    <Link
      href={`/entry/${entry.id}`}
      className="block group bg-white rounded-xl border border-stone-200 p-5 hover:border-pink-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {entry.mood && (
            <span className="text-xl flex-shrink-0" title="Mood">
              {entry.mood}
            </span>
          )}
          <h2 className="text-base font-semibold text-stone-800 group-hover:text-pink-700 transition-colors truncate">
            {entry.title || 'Untitled'}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {entry.spotifyUrl && <span className="text-xs text-[#1DB954]" title="Has a song">♫</span>}
          <time className="text-xs text-stone-400">{dateStr}</time>
        </div>
      </div>

      {thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt=""
          className="w-full h-36 object-cover rounded-lg mb-3 border border-stone-100"
        />
      )}

      {preview && (
        <p className="text-sm text-stone-500 leading-relaxed line-clamp-2 mb-3">{preview}</p>
      )}

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full border border-stone-200"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

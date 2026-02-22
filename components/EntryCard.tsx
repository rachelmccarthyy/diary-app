'use client';

import Link from 'next/link';
import { DiaryEntry } from '@/lib/types';
import { formatEntryDateShort } from '@/lib/storage';

interface EntryCardProps {
  entry: DiaryEntry;
  searchQuery?: string;
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
      className="block group rounded-xl border p-5 hover:border-pink-300 hover:shadow-md transition-all duration-200"
      style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {entry.mood && <span className="text-xl flex-shrink-0">{entry.mood}</span>}
          <h2 className="text-base font-semibold group-hover:text-pink-500 transition-colors truncate" style={{ color: 'var(--th-text)' }}>
            {entry.title || 'Untitled'}
          </h2>
        </div>
        <time className="text-xs flex-shrink-0" style={{ color: 'var(--th-faint)' }}>{dateStr}</time>
      </div>

      {thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbnail} alt="" className="w-full h-72 object-cover rounded-lg mb-3 border" style={{ borderColor: 'var(--th-border)' }} />
      )}

      {preview && (
        <p className="text-sm leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--th-muted)' }}>{preview}</p>
      )}

      {entry.spotifyUrl && (
        <div className="flex items-center gap-1.5 text-xs text-[#1DB954] mb-2">
          <span>♫</span>
          <span className="truncate">{entry.spotifyTitle ?? 'Song attached'}</span>
        </div>
      )}

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full border" style={{ background: 'var(--th-toolbar)', color: 'var(--th-muted)', borderColor: 'var(--th-border)' }}>
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

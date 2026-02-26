'use client';

import Link from 'next/link';
import { DiaryEntry } from '@/lib/types';
import { formatEntryDateShort } from '@/lib/db';

interface EntryCardProps {
  entry: DiaryEntry;
  searchQuery?: string;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const isLocked = entry.isTimeCapsule && !entry.isRevealed && entry.revealAt && new Date(entry.revealAt) > new Date();

  const preview = isLocked
    ? ''
    : entry.body
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*|__|\*|_|~~|`/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .slice(0, 200);

  const dateStr = formatEntryDateShort(entry.createdAt, entry.timezone);
  const thumbnail = isLocked ? undefined : entry.images?.[0];

  // Countdown for time capsule
  let countdown = '';
  if (isLocked && entry.revealAt) {
    const diff = new Date(entry.revealAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    countdown = days === 1 ? 'Opens in 1 day' : `Opens in ${days} days`;
  }

  return (
    <Link
      href={`/entry/${entry.id}`}
      className="block group border-t transition-opacity hover:opacity-60"
      style={{ borderColor: 'var(--th-border)' }}
    >
      <div className="py-5">
        {/* 1. Date */}
        <time className="font-mono-editorial block mb-2" style={{ color: 'var(--th-faint)' }}>
          {isLocked && <span className="mr-1.5" style={{ color: 'var(--th-accent)' }}>SEALED</span>}
          {dateStr}
        </time>

        {/* 2. Title */}
        <h2
          className="font-display mb-2 group-hover:opacity-60 transition-opacity"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: 'var(--th-text)' }}
        >
          {isLocked ? 'Time Capsule' : (entry.title || 'Untitled')}
        </h2>

        {isLocked ? (
          <p
            className="text-sm leading-relaxed font-mono-editorial"
            style={{ color: 'var(--th-accent)' }}
          >
            {countdown}
          </p>
        ) : (
          <>
            {/* 3. Tags / Mood */}
            {(entry.mood || entry.tags.length > 0) && (
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {entry.mood && (
                  <span
                    className="font-mono-editorial px-1.5 py-0.5 border"
                    style={{ borderColor: 'var(--th-border)', color: 'var(--th-muted)' }}
                  >
                    {entry.mood}
                  </span>
                )}
                {entry.tags.map((tag) => (
                  <span key={tag} className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 4. Text preview */}
            {preview && (
              <p
                className="text-sm leading-relaxed line-clamp-2"
                style={{ color: 'var(--th-muted)', maxWidth: '60ch' }}
              >
                {preview}
              </p>
            )}

            {/* 5. Image */}
            {thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnail}
                alt=""
                className="w-full object-cover mt-3 rounded"
                style={{ maxHeight: '320px' }}
              />
            )}

            {/* 6. Song */}
            {entry.spotifyUrl && (
              <p className="text-xs mt-3 font-medium" style={{ color: '#1DB954' }}>
                ♫ {entry.spotifyTitle ?? 'Song attached'}
              </p>
            )}
          </>
        )}
      </div>
    </Link>
  );
}

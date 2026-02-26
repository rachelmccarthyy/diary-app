'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DiaryEntry } from '@/lib/types';

interface Props {
  entries: DiaryEntry[];
}

export default function OnThisDay({ entries }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || entries.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>On This Day</span>
        <button
          onClick={() => setDismissed(true)}
          className="font-mono-editorial transition-opacity hover:opacity-50"
          style={{ color: 'var(--th-faint)' }}
        >
          Dismiss
        </button>
      </div>
      <div className="h-px mb-4" style={{ background: 'var(--th-border)' }} />

      <div className="space-y-3">
        {entries.map((entry) => {
          const year = new Date(entry.createdAt).getFullYear();
          const preview = entry.body
            .replace(/#{1,6}\s/g, '')
            .replace(/\*\*|__|\*|_|~~|`/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .slice(0, 100);

          return (
            <Link
              key={entry.id}
              href={`/entry/${entry.id}`}
              className="block rounded-lg border p-3 transition-opacity hover:opacity-70"
              style={{ borderColor: 'var(--th-border)', background: 'var(--th-card)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                {entry.mood && <span className="text-sm">{entry.mood}</span>}
                <span className="font-mono-editorial" style={{ color: 'var(--th-accent)' }}>
                  {year}
                </span>
              </div>
              <p className="text-sm font-medium leading-tight" style={{ color: 'var(--th-text)' }}>
                {entry.title || 'Untitled'}
              </p>
              {preview && (
                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--th-muted)' }}>
                  {preview}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

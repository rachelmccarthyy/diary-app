'use client';

import Link from 'next/link';
import type { Letter } from '@/lib/lettersDb';

interface Props {
  letter: Letter;
}

export default function LetterCard({ letter }: Props) {
  const isDelivered = letter.delivered || new Date(letter.deliverAt) <= new Date();

  const deliverDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(letter.deliverAt));

  if (!isDelivered) {
    const diff = new Date(letter.deliverAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const countdown = days === 1 ? '1 day' : `${days} days`;

    return (
      <div
        className="rounded-xl border p-4"
        style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}
      >
        <div className="flex items-start gap-3">
          <span className="font-mono-editorial text-sm" style={{ color: 'var(--th-faint)' }}>SEALED</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--th-text)' }}>
              {letter.subject}
            </p>
            <p className="font-mono-editorial mt-1" style={{ color: 'var(--th-faint)' }}>
              Delivers {deliverDate}
            </p>
            <p className="font-mono-editorial" style={{ color: 'var(--th-accent)' }}>
              {countdown} remaining
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/letters/${letter.id}`}
      className="block rounded-xl border p-4 transition-opacity hover:opacity-70"
      style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}
    >
      <div className="flex items-start gap-3">
        <span className="font-mono-editorial text-sm" style={{ color: 'var(--th-accent)' }}>OPENED</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--th-text)' }}>
            {letter.subject}
          </p>
          <p className="font-mono-editorial mt-1" style={{ color: 'var(--th-faint)' }}>
            Delivered {deliverDate}
          </p>
          <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--th-muted)' }}>
            {letter.body.slice(0, 120)}
          </p>
        </div>
      </div>
    </Link>
  );
}

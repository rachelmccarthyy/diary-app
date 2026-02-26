'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MediaItem, MEDIA_TYPE_CONFIG } from '@/lib/mediaTypes';
import { getActiveMedia } from '@/lib/mediaDb';
import { useAuth } from './AuthProvider';

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function MediaPicker({ selectedIds, onChange }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    if (user) {
      getActiveMedia(user.id).then(setItems).catch(console.error);
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--th-faint)' }}>
        No active media.{' '}
        <Link href="/media" className="underline" style={{ color: 'var(--th-muted)' }}>
          Add some
        </Link>{' '}
        to link here.
      </p>
    );
  }

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const cfg = MEDIA_TYPE_CONFIG[item.type];
        const selected = selectedIds.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => toggle(item.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all"
            style={
              selected
                ? { background: cfg.bg, color: cfg.color, borderColor: cfg.color }
                : { background: 'var(--th-card)', color: 'var(--th-muted)', borderColor: 'var(--th-border)' }
            }
          >
            <span>{cfg.emoji}</span>
            <span>{item.title}</span>
          </button>
        );
      })}
    </div>
  );
}

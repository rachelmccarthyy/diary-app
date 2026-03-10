'use client';

import { MOODS } from '@/lib/types';

interface MoodPickerProps {
  value: string;
  onChange: (mood: string) => void;
}

/** Moods are stored as comma-separated string, e.g. "happy,calm" */
export default function MoodPicker({ value, onChange }: MoodPickerProps) {
  const selected = value ? value.split(',').filter(Boolean) : [];

  function toggle(emoji: string) {
    const next = selected.includes(emoji)
      ? selected.filter((m) => m !== emoji)
      : [...selected, emoji];
    onChange(next.join(','));
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Select moods">
      {MOODS.map(({ emoji, label }) => {
        const active = selected.includes(emoji);
        return (
          <button
            key={emoji}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(emoji)}
            className="px-3 py-1.5 border text-sm font-mono-editorial transition-all"
            style={{
              borderColor: active ? 'var(--th-text)' : 'var(--th-border-strong)',
              background: active ? 'var(--th-text)' : 'transparent',
              color: active ? 'var(--th-bg)' : 'var(--th-muted)',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

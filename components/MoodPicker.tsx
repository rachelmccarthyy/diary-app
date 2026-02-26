'use client';

import { MOODS } from '@/lib/types';

interface MoodPickerProps {
  value: string;
  onChange: (mood: string) => void;
}

export default function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map(({ emoji, label }) => {
        const active = value === emoji;
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            className="px-3 py-1.5 border text-sm font-mono-editorial transition-all"
            style={{
              borderColor: active ? 'var(--th-text)' : 'var(--th-border)',
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

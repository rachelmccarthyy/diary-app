'use client';

import { MOODS } from '@/lib/types';

interface MoodPickerProps {
  value: string;
  onChange: (mood: string) => void;
}

export default function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map(({ emoji, label }) => (
        <button
          key={emoji}
          type="button"
          title={label}
          onClick={() => onChange(emoji)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all
            ${value === emoji
              ? 'bg-pink-50 border-pink-400 text-pink-700 shadow-sm'
              : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
            }
          `}
        >
          <span className="text-base">{emoji}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

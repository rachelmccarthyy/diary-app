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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${value === emoji ? 'bg-pink-50 border-pink-400 text-pink-700 shadow-sm' : 'hover:border-pink-200'}`}
          style={value !== emoji ? { background: 'var(--th-card)', borderColor: 'var(--th-border)', color: 'var(--th-muted)' } : {}}
        >
          <span className="text-base">{emoji}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

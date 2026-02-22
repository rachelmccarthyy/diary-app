'use client';

import { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState('');

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setInput('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); }
    else if (e.key === 'Backspace' && !input && tags.length > 0) onChange(tags.slice(0, -1));
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 min-h-10 px-3 py-2 border rounded-lg focus-within:border-pink-400 focus-within:ring-1 focus-within:ring-pink-100 transition-all"
      style={{ background: 'var(--th-input)', borderColor: 'var(--th-border)' }}
    >
      {tags.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-pink-50 text-pink-700 text-sm rounded-full border border-pink-200">
          #{tag}
          <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} className="text-pink-400 hover:text-pink-600 leading-none">×</button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input && addTag(input)}
        placeholder={tags.length === 0 ? 'Add tags (press Enter or comma)' : ''}
        className="flex-1 min-w-24 outline-none text-sm bg-transparent placeholder:opacity-40"
        style={{ color: 'var(--th-text)' }}
      />
    </div>
  );
}

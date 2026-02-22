'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DiaryEntry, MOODS } from '@/lib/types';
import { getEntries } from '@/lib/storage';
import EntryCard from '@/components/EntryCard';

export default function HomePage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [query, setQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    setEntries(getEntries());
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach((e) => e.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return entries.filter((e) => {
      const matchesQuery =
        !q || e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q);
      const matchesMood = !selectedMood || e.mood === selectedMood;
      const matchesTag = !selectedTag || e.tags.includes(selectedTag);
      return matchesQuery && matchesMood && matchesTag;
    });
  }, [entries, query, selectedMood, selectedTag]);

  // Group entries by calendar date in their stored timezone
  const grouped = useMemo(() => {
    const groups: Record<string, DiaryEntry[]> = {};
    filtered.forEach((entry) => {
      const dateLabel = new Intl.DateTimeFormat('en-US', {
        timeZone: entry.timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(entry.createdAt));
      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(entry);
    });
    return groups;
  }, [filtered]);

  const hasFilters = query || selectedMood || selectedTag;

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-[#FDFBF7]/90 border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-800 tracking-tight">My Diary</h1>
            <p className="text-xs text-stone-400 mt-0.5">{entries.length} entries</p>
          </div>
          <Link
            href="/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
          >
            <span className="text-base leading-none">+</span>
            New Entry
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-lg bg-white text-stone-700 placeholder:text-stone-400 text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Mood filter */}
          <div className="flex flex-wrap gap-1.5">
            {MOODS.map(({ emoji, label }) => (
              <button
                key={emoji}
                type="button"
                title={label}
                onClick={() => setSelectedMood(selectedMood === emoji ? '' : emoji)}
                className={`
                  text-lg px-2 py-1 rounded-lg border transition-all
                  ${selectedMood === emoji
                    ? 'bg-pink-50 border-pink-300 scale-110'
                    : 'bg-white border-stone-200 hover:border-stone-300 opacity-60 hover:opacity-100'
                  }
                `}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-stone-400">Tags:</span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`
                    text-xs px-2.5 py-1 rounded-full border transition-all
                    ${selectedTag === tag
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                    }
                  `}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Clear filters */}
          {hasFilters && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSelectedMood(''); setSelectedTag(''); }}
              className="text-xs px-2.5 py-1 rounded-full border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-all"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Entry list */}
        {entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📖</p>
            <h2 className="text-lg font-semibold text-stone-600 mb-2">Your diary is empty</h2>
            <p className="text-stone-400 text-sm mb-6">Start capturing your thoughts and memories.</p>
            <Link
              href="/new"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors"
            >
              Write your first entry
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-stone-500">No entries match your filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([dateLabel, dayEntries]) => (
              <div key={dateLabel}>
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2 px-1">
                  {dateLabel}
                </h3>
                <div className="space-y-3">
                  {dayEntries.map((entry) => (
                    <EntryCard key={entry.id} entry={entry} searchQuery={query} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DiaryEntry, MOODS } from '@/lib/types';
import { getEntries } from '@/lib/storage';
import EntryCard from '@/components/EntryCard';
import ThemeToggle from '@/components/ThemeToggle';

export default function HomePage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [query, setQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => { setEntries(getEntries()); }, []);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    entries.forEach((e) => e.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return entries.filter((e) => {
      const matchesQuery = !q || e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q);
      return matchesQuery && (!selectedMood || e.mood === selectedMood) && (!selectedTag || e.tags.includes(selectedTag));
    });
  }, [entries, query, selectedMood, selectedTag]);

  const grouped = useMemo(() => {
    const g: Record<string, DiaryEntry[]> = {};
    filtered.forEach((entry) => {
      const label = new Intl.DateTimeFormat('en-US', {
        timeZone: entry.timezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      }).format(new Date(entry.createdAt));
      if (!g[label]) g[label] = [];
      g[label].push(entry);
    });
    return g;
  }, [filtered]);

  const hasFilters = query || selectedMood || selectedTag;

  return (
    <div className="min-h-screen" style={{ background: 'var(--th-bg)' }}>
      <header className="sticky top-0 z-10 backdrop-blur-sm border-b border-[var(--th-border)]" style={{ background: 'var(--th-header-bg)' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--th-text)' }}>My Diary</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--th-faint)' }}>{entries.length} entries</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors shadow-sm">
              <span className="text-base leading-none">+</span> New Entry
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--th-faint)' }}>🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all"
            style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-wrap gap-1.5">
            {MOODS.map(({ emoji, label }) => (
              <button
                key={emoji}
                type="button"
                title={label}
                onClick={() => setSelectedMood(selectedMood === emoji ? '' : emoji)}
                className={`text-lg px-2 py-1 rounded-lg border transition-all ${selectedMood === emoji ? 'bg-pink-50 border-pink-300 scale-110' : 'opacity-60 hover:opacity-100'}`}
                style={selectedMood !== emoji ? { background: 'var(--th-card)', borderColor: 'var(--th-border)' } : {}}
              >
                {emoji}
              </button>
            ))}
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs" style={{ color: 'var(--th-faint)' }}>Tags:</span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${selectedTag === tag ? 'bg-pink-600 text-white border-pink-600' : ''}`}
                  style={selectedTag !== tag ? { background: 'var(--th-card)', color: 'var(--th-muted)', borderColor: 'var(--th-border)' } : {}}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

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
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--th-muted)' }}>Your diary is empty</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--th-faint)' }}>Start capturing your thoughts and memories.</p>
            <Link href="/new" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors">
              Write your first entry
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">🔍</p>
            <p style={{ color: 'var(--th-muted)' }}>No entries match your filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([dateLabel, dayEntries]) => (
              <div key={dateLabel}>
                <h3 className="text-xs font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--th-faint)' }}>
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

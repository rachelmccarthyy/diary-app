'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { DiaryEntry, MOODS } from '@/lib/types';
import { getEntries, getOnThisDayEntries, formatEntryDateShort } from '@/lib/db';
import { getActiveMedia } from '@/lib/mediaDb';
import { MediaItem, MEDIA_TYPE_CONFIG } from '@/lib/mediaTypes';
import { needsMigration, migrateToSupabase } from '@/lib/migrate';
import { useAuth } from '@/components/AuthProvider';
import AuthGuard from '@/components/AuthGuard';
import EntryCard from '@/components/EntryCard';
import OnThisDay from '@/components/OnThisDay';
import HoroscopeCard from '@/components/HoroscopeCard';
import ThemeToggle from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';

function HomeContent() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [activeMedia, setActiveMedia] = useState<MediaItem[]>([]);
  const [onThisDayEntries, setOnThisDayEntries] = useState<DiaryEntry[]>([]);
  const [query, setQuery] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      // Check for localStorage migration
      if (needsMigration()) {
        setMigrating(true);
        await migrateToSupabase(user.id);
        setMigrating(false);
      }
      const [e, m, otd] = await Promise.all([
        getEntries(user.id),
        getActiveMedia(user.id),
        getOnThisDayEntries(user.id),
      ]);
      setEntries(e);
      setActiveMedia(m);
      setOnThisDayEntries(otd);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    entries.forEach((e) => e.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return entries.filter((e) => {
      const matchesQuery = !q || e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q);
      const matchesMood = selectedMoods.length === 0 || selectedMoods.includes(e.mood);
      const matchesTags = selectedTags.length === 0 || selectedTags.every((t) => e.tags.includes(t));
      return matchesQuery && matchesMood && matchesTags;
    });
  }, [entries, query, selectedMoods, selectedTags]);

  const grouped = useMemo(() => {
    const g: Record<string, DiaryEntry[]> = {};
    const fmt = (d: Date) => new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(d);
    const fmtYear = (d: Date) => new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(d);
    const thisYear = new Date().getFullYear();

    filtered.forEach((entry) => {
      const d = new Date(entry.createdAt);
      // Find the Sunday that starts this week
      const sun = new Date(d);
      sun.setDate(sun.getDate() - sun.getDay());
      sun.setHours(0, 0, 0, 0);
      const sat = new Date(sun);
      sat.setDate(sat.getDate() + 6);

      const showYear = sun.getFullYear() !== thisYear;
      const label = showYear
        ? `${fmt(sun)} – ${fmtYear(sat)}`
        : `${fmt(sun)} – ${fmt(sat)}`;

      if (!g[label]) g[label] = [];
      g[label].push(entry);
    });
    return g;
  }, [filtered]);

  const playlistSongs = useMemo(() => {
    const now = new Date();
    return entries.filter((e) => {
      if (!e.spotifyTitle || !e.spotifyUrl) return false;
      const d = new Date(e.createdAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
  }, [entries]);

  const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  function toggleMood(emoji: string) {
    setSelectedMoods((prev) =>
      prev.includes(emoji) ? prev.filter((m) => m !== emoji) : [...prev, emoji]
    );
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  const activeFilterCount = selectedMoods.length + selectedTags.length;
  const hasFilters = query || activeFilterCount > 0;

  if (loading || migrating) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--th-bg)' }}>
        <div className="text-center">
          <div
            className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: 'var(--th-faint)', borderTopColor: 'transparent' }}
          />
          <p className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>
            {migrating ? 'Importing your entries...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--th-bg)' }}>
      <header
        className="sticky top-0 z-10 backdrop-blur-sm border-b"
        style={{ background: 'var(--th-header-bg)', borderColor: 'var(--th-border)' }}
      >
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <h1
              className="font-display leading-none"
              style={{ color: 'var(--th-text)', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', letterSpacing: '0.02em' }}
            >
              My Diary
            </h1>
            <p className="font-mono-editorial mt-1.5" style={{ color: 'var(--th-faint)' }}>
              {new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())}
              {entries.length > 0 && <>&nbsp;&middot;&nbsp;{entries.length} entries</>}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <ThemeToggle />
            <Link
              href="/letters"
              className="font-mono-editorial transition-opacity hover:opacity-50"
              style={{ color: 'var(--th-muted)' }}
            >
              Letters
            </Link>
            <Link
              href="/media"
              className="font-mono-editorial transition-opacity hover:opacity-50"
              style={{ color: 'var(--th-muted)' }}
            >
              Media
            </Link>
            <Link
              href="/chart"
              className="font-mono-editorial transition-opacity hover:opacity-50"
              style={{ color: 'var(--th-muted)' }}
            >
              Chart
            </Link>
            <Link
              href="/new"
              className="font-display px-5 py-2.5 transition-opacity hover:opacity-75"
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                background: 'var(--th-text)',
                color: 'var(--th-bg)',
              }}
            >
              + New Entry
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-14 items-start">

          {/* Left sidebar */}
          <aside className="md:sticky md:top-[81px] md:max-h-[calc(100vh-97px)] md:overflow-y-auto md:pr-4 sidebar-scroll space-y-6">

            {/* On This Day */}
            {onThisDayEntries.length > 0 && (
              <OnThisDay entries={onThisDayEntries} />
            )}

            {/* Horoscope */}
            <HoroscopeCard />

            {/* Filter widget */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>Filter</span>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => { setSelectedMoods([]); setSelectedTags([]); }}
                    className="font-mono-editorial transition-opacity hover:opacity-50"
                    style={{ color: 'var(--th-accent)' }}
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="h-px mb-4" style={{ background: 'var(--th-border)' }} />

              <div className="mb-4">
                <p className="font-mono-editorial mb-3" style={{ color: 'var(--th-faint)' }}>Mood</p>
                <div className="flex flex-wrap gap-1.5">
                  {MOODS.map(({ emoji, label }) => {
                    const active = selectedMoods.includes(emoji);
                    return (
                      <button
                        key={emoji}
                        type="button"
                        title={label}
                        onClick={() => toggleMood(emoji)}
                        className="font-mono-editorial px-2 py-1.5 border transition-all"
                        style={{
                          borderColor: active ? 'var(--th-text)' : 'var(--th-border)',
                          background: active ? 'var(--th-text)' : 'transparent',
                          color: active ? 'var(--th-bg)' : 'var(--th-faint)',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {allTags.length > 0 && (
                <div>
                  <p className="font-mono-editorial mb-3" style={{ color: 'var(--th-faint)' }}>Tags</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-2">
                    {allTags.map((tag) => {
                      const active = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className="font-mono-editorial px-2 py-1 border transition-all"
                          style={{
                            borderColor: active ? 'var(--th-text)' : 'var(--th-border)',
                            background: active ? 'var(--th-text)' : 'transparent',
                            color: active ? 'var(--th-bg)' : 'var(--th-faint)',
                          }}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Currently widget */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>Currently</span>
                <Link href="/media" className="font-mono-editorial transition-opacity hover:opacity-50" style={{ color: 'var(--th-faint)' }}>
                  Manage →
                </Link>
              </div>
              <div className="h-px mb-4" style={{ background: 'var(--th-border)' }} />

              {activeMedia.length === 0 ? (
                <div className="py-1">
                  <p className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>Nothing tracked yet. <Link href="/media" className="underline" style={{ textUnderlineOffset: '3px' }}>Add media →</Link></p>
                </div>
              ) : (
                <div className="space-y-0 divide-y" style={{ borderColor: 'var(--th-border)' }}>
                  {activeMedia.map((item) => {
                    const cfg = MEDIA_TYPE_CONFIG[item.type];
                    return (
                      <Link
                        key={item.id}
                        href="/media"
                        className="flex items-center gap-3 py-2.5 transition-opacity hover:opacity-50"
                      >
                        <span className="text-base flex-shrink-0">{cfg.emoji}</span>
                        <span className="text-sm truncate" style={{ color: 'var(--th-text)' }}>
                          {item.title}
                        </span>
                        {item.author_or_creator && (
                          <span className="text-xs truncate ml-auto pl-2 flex-shrink-0" style={{ color: 'var(--th-faint)' }}>
                            {item.author_or_creator}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Monthly playlist widget */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>{currentMonthName} Playlist</span>
                <span className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>
                  {playlistSongs.length} {playlistSongs.length === 1 ? 'song' : 'songs'}
                </span>
              </div>
              <div className="h-px mb-4" style={{ background: 'var(--th-border)' }} />

              {playlistSongs.length === 0 ? (
                <p className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>
                  No songs yet — link a Spotify track when writing an entry.
                </p>
              ) : (
                <>
                  {playingIdx !== null && playlistSongs[playingIdx]?.spotifyUrl && (
                    <div className="mb-3">
                      <div className="rounded-lg overflow-hidden mb-2">
                        <iframe
                          key={playlistSongs[playingIdx].id}
                          src={playlistSongs[playingIdx].spotifyUrl}
                          width="100%"
                          height="80"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          style={{ border: 'none', display: 'block' }}
                        />
                      </div>
                      {playlistSongs.length > 1 && (
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setPlayingIdx((i) => i !== null ? (i - 1 + playlistSongs.length) % playlistSongs.length : 0)}
                            className="font-mono-editorial transition-opacity hover:opacity-50"
                            style={{ color: 'var(--th-faint)' }}
                          >
                            ← Prev
                          </button>
                          <span className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>
                            {playingIdx + 1} / {playlistSongs.length}
                          </span>
                          <button
                            onClick={() => setPlayingIdx((i) => i !== null ? (i + 1) % playlistSongs.length : 0)}
                            className="font-mono-editorial transition-opacity hover:opacity-50"
                            style={{ color: 'var(--th-faint)' }}
                          >
                            Next →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="divide-y overflow-y-auto max-h-48" style={{ borderColor: 'var(--th-border)' }}>
                    {playlistSongs.map((entry, idx) => {
                      const isPlaying = playingIdx === idx;
                      const shortDate = new Intl.DateTimeFormat('en-US', {
                        timeZone: entry.timezone, month: 'short', day: 'numeric',
                      }).format(new Date(entry.createdAt));
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => setPlayingIdx(isPlaying ? null : idx)}
                          className="w-full flex items-center gap-2.5 py-2.5 text-left transition-opacity hover:opacity-60"
                          style={{ borderColor: 'var(--th-border)' }}
                        >
                          <span
                            className="text-xs flex-shrink-0 w-4"
                            style={{ color: isPlaying ? 'var(--th-accent)' : 'var(--th-faint)' }}
                          >
                            {isPlaying ? '▐▐' : '▶'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-xs font-medium leading-tight truncate"
                              style={{ color: isPlaying ? 'var(--th-accent)' : 'var(--th-text)' }}
                            >
                              {entry.spotifyTitle}
                            </p>
                            <p className="font-mono-editorial mt-0.5 truncate" style={{ color: 'var(--th-faint)' }}>
                              {entry.title || 'Untitled'} · {shortDate}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

          </aside>

          {/* Right: entries */}
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono-editorial" style={{ color: 'var(--th-faint)' }}>/</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search entries..."
                className="w-full pl-9 pr-4 py-2.5 border-b border-t-0 border-x-0 text-sm focus:outline-none transition-all bg-transparent"
                style={{ color: 'var(--th-text)', borderColor: 'var(--th-border)' }}
              />
            </div>

            {hasFilters && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {selectedMoods.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => toggleMood(emoji)}
                    className="font-mono-editorial inline-flex items-center gap-1 transition-opacity hover:opacity-50"
                    style={{ color: 'var(--th-text)', textDecoration: 'line-through', textDecorationColor: 'var(--th-accent)' }}
                  >
                    {emoji} ×
                  </button>
                ))}
                {selectedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="font-mono-editorial inline-flex items-center gap-1 transition-opacity hover:opacity-50"
                    style={{ color: 'var(--th-text)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                  >
                    #{tag} ×
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setQuery(''); setSelectedMoods([]); setSelectedTags([]); }}
                  className="font-mono-editorial transition-opacity hover:opacity-50"
                  style={{ color: 'var(--th-accent)' }}
                >
                  Clear
                </button>
              </div>
            )}

            {entries.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-display text-4xl mb-4" style={{ color: 'var(--th-border)' }}>*</p>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--th-muted)' }}>Your diary is empty</h2>
                <p className="text-sm mb-6" style={{ color: 'var(--th-faint)' }}>Start capturing your thoughts and memories.</p>
                <Link href="/new" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors">
                  Write your first entry
                </Link>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-display text-2xl mb-3" style={{ color: 'var(--th-border)' }}>—</p>
                <p style={{ color: 'var(--th-muted)' }}>No entries match your filters.</p>
              </div>
            ) : (
              <div>
                {Object.entries(grouped).map(([dateLabel, dayEntries]) => (
                  <div key={dateLabel} className="mb-8">
                    <div className="flex items-center gap-4 mb-0">
                      <h3 className="font-mono-editorial flex-shrink-0" style={{ color: 'var(--th-faint)' }}>
                        {dateLabel}
                      </h3>
                      <div className="flex-1 h-px" style={{ background: 'var(--th-border)' }} />
                    </div>
                    <div>
                      {dayEntries.map((entry) => (
                        <EntryCard key={entry.id} entry={entry} searchQuery={query} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}

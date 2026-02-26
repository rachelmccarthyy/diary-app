'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MediaItem, MediaType, MEDIA_TYPE_CONFIG } from '@/lib/mediaTypes';
import { getMediaItems, formatMediaDate, formatDuration } from '@/lib/mediaDb';
import { useAuth } from '@/components/AuthProvider';
import AuthGuard from '@/components/AuthGuard';
import ThemeToggle from '@/components/ThemeToggle';

const TYPE_ORDER: MediaType[] = ['book', 'show', 'movie', 'podcast'];

interface Tooltip {
  item: MediaItem;
  x: number;
  y: number;
}

function TimelineContent() {
  const { user } = useAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setItems(await getMediaItems(user.id));
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--th-bg)' }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--th-faint)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (items.length < 2) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--th-bg)' }}>
        <header className="sticky top-0 z-10 backdrop-blur-sm border-b" style={{ background: 'var(--th-header-bg)', borderColor: 'var(--th-border)' }}>
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/media" className="text-sm flex items-center gap-1" style={{ color: 'var(--th-muted)' }}>← Media</Link>
            <h1 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Timeline</h1>
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <p className="text-4xl mb-4">📊</p>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--th-muted)' }}>Not enough data yet</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--th-faint)' }}>Add at least 2 media items to see a timeline.</p>
          <Link href="/media" className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors">Go to Media</Link>
        </div>
      </div>
    );
  }

  const now = Date.now();
  const allStarts = items.map((m) => new Date(m.started_at).getTime());
  const allEnds = items.map((m) => m.finished_at ? new Date(m.finished_at).getTime() : now);
  const minTime = Math.min(...allStarts);
  const maxTime = Math.max(...allEnds);
  const padding = Math.max((maxTime - minTime) * 0.03, 1000 * 60 * 60 * 24);
  const rangeStart = minTime - padding;
  const rangeEnd = maxTime + padding;
  const totalRange = rangeEnd - rangeStart;

  function leftPct(t: number): number { return ((t - rangeStart) / totalRange) * 100; }
  function widthPct(start: number, end: number): number { return Math.max(((end - start) / totalRange) * 100, 0.5); }

  const grouped: Record<MediaType, MediaItem[]> = { book: [], show: [], movie: [], podcast: [] };
  items.forEach((m) => grouped[m.type].push(m));

  const labels: { label: string; leftPct: number }[] = [];
  const startDate = new Date(rangeStart);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);
  const cursor = new Date(startDate);
  while (cursor.getTime() <= rangeEnd) {
    const lp = leftPct(cursor.getTime());
    if (lp >= 0 && lp <= 100) {
      labels.push({ label: new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(cursor), leftPct: lp });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--th-bg)' }}>
      <header className="sticky top-0 z-10 backdrop-blur-sm border-b" style={{ background: 'var(--th-header-bg)', borderColor: 'var(--th-border)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/media" className="text-sm flex items-center gap-1" style={{ color: 'var(--th-muted)' }}>← Media</Link>
          <h1 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Timeline</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="rounded-xl border overflow-x-auto" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
          <div style={{ minWidth: '600px' }}>
            <div className="relative h-8 border-b px-4" style={{ borderColor: 'var(--th-border)' }}>
              {labels.map(({ label, leftPct: lp }) => (
                <span key={label} className="absolute text-xs -translate-x-1/2 top-1.5" style={{ left: `calc(${lp}%)`, color: 'var(--th-faint)' }}>{label}</span>
              ))}
            </div>

            {TYPE_ORDER.map((type) => {
              const group = grouped[type];
              if (group.length === 0) return null;
              const cfg = MEDIA_TYPE_CONFIG[type];
              return (
                <div key={type} className="border-b last:border-b-0" style={{ borderColor: 'var(--th-border)' }}>
                  <div className="flex items-center px-4 py-1 border-b" style={{ borderColor: 'var(--th-border)', background: 'var(--th-bg)' }}>
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: cfg.color }}>{cfg.emoji} {cfg.label}s</span>
                  </div>
                  {group.map((item) => {
                    const start = new Date(item.started_at).getTime();
                    const end = item.finished_at ? new Date(item.finished_at).getTime() : now;
                    const isActive = item.status === 'active';
                    const lp = leftPct(start);
                    const wp = widthPct(start, end);
                    return (
                      <div key={item.id} className="relative h-10 px-4 flex items-center">
                        <button
                          className="absolute h-6 rounded-md text-xs font-medium flex items-center px-2 overflow-hidden whitespace-nowrap cursor-pointer transition-opacity hover:opacity-80"
                          style={{ left: `${lp}%`, width: `${wp}%`, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`, minWidth: '4px' }}
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip(tooltip?.item.id === item.id ? null : { item, x: rect.left + rect.width / 2, y: rect.bottom + 8 });
                          }}
                        >
                          {wp > 5 && item.title}
                          {isActive && <span className="absolute right-0 top-0 bottom-0 w-1 rounded-r-md" style={{ background: cfg.color, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            <div className="absolute top-8 bottom-0 w-px pointer-events-none" style={{ left: `${leftPct(now)}%`, background: '#ec4899', opacity: 0.4, position: 'relative' }} />
          </div>
        </div>
        <p className="text-xs text-center mt-3" style={{ color: 'var(--th-faint)' }}>Click a bar for details · Pulsing edge = still active</p>
      </main>

      {tooltip && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setTooltip(null)} />
          <div className="fixed z-50 rounded-xl border shadow-xl p-4 max-w-xs w-64" style={{ left: Math.min(tooltip.x - 128, typeof window !== 'undefined' ? window.innerWidth - 280 : 500), top: tooltip.y, background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
            <div className="flex items-start gap-2">
              <span className="text-xl">{MEDIA_TYPE_CONFIG[tooltip.item.type].emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--th-text)' }}>{tooltip.item.title}</p>
                {tooltip.item.author_or_creator && <p className="text-xs mt-0.5" style={{ color: 'var(--th-muted)' }}>{tooltip.item.author_or_creator}</p>}
              </div>
              <button onClick={() => setTooltip(null)} className="text-xs" style={{ color: 'var(--th-faint)' }}>×</button>
            </div>
            <div className="mt-2 space-y-1 text-xs" style={{ color: 'var(--th-faint)' }}>
              <p>Started: {formatMediaDate(tooltip.item.started_at)}</p>
              {tooltip.item.finished_at && <p>Finished: {formatMediaDate(tooltip.item.finished_at)}</p>}
              <p>Duration: {formatDuration(tooltip.item.started_at, tooltip.item.finished_at)}</p>
              {tooltip.item.status === 'active' && <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Active</span>}
              {tooltip.item.status === 'dropped' && <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">Dropped</span>}
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}

export default function TimelinePage() {
  return (
    <AuthGuard>
      <TimelineContent />
    </AuthGuard>
  );
}

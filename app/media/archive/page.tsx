'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MediaItem, MEDIA_TYPE_CONFIG } from '@/lib/mediaTypes';
import { getMediaItems, formatMediaDate, formatDuration } from '@/lib/mediaDb';
import { useAuth } from '@/components/AuthProvider';
import AuthGuard from '@/components/AuthGuard';
import ThemeToggle from '@/components/ThemeToggle';

function ArchiveContent() {
  const { user } = useAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const all = await getMediaItems(user.id);
      const done = all
        .filter((m) => m.status === 'finished' || m.status === 'dropped')
        .sort((a, b) => {
          const aEnd = a.finished_at ? new Date(a.finished_at).getTime() : 0;
          const bEnd = b.finished_at ? new Date(b.finished_at).getTime() : 0;
          return bEnd - aEnd;
        });
      setItems(done);
    } catch (err) {
      console.error('Failed to load archive:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const grouped: Record<string, MediaItem[]> = {};
  items.forEach((m) => {
    const year = m.finished_at ? new Date(m.finished_at).getFullYear().toString() : 'Unknown';
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(m);
  });
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--th-bg)' }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--th-faint)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--th-bg)' }}>
      <header className="sticky top-0 z-10 backdrop-blur-sm border-b" style={{ background: 'var(--th-header-bg)', borderColor: 'var(--th-border)' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/media" className="text-sm flex items-center gap-1" style={{ color: 'var(--th-muted)' }}>← Media</Link>
          <h1 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Archive</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">📦</p>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--th-muted)' }}>Nothing archived yet</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--th-faint)' }}>Finished or dropped items will appear here.</p>
            <Link href="/media" className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors">Go to Media</Link>
          </div>
        ) : (
          <div className="space-y-8">
            {years.map((year) => (
              <section key={year}>
                <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--th-faint)' }}>{year}</h2>
                <div className="rounded-xl border divide-y overflow-hidden" style={{ borderColor: 'var(--th-border)' }}>
                  {grouped[year].map((item) => {
                    const cfg = MEDIA_TYPE_CONFIG[item.type];
                    return (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-3" style={{ background: 'var(--th-card)' }}>
                        <div className="w-9 h-12 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: cfg.bg }}>
                          {item.cover_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover rounded-md" />
                          ) : (
                            <span className="text-lg">{cfg.emoji}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium leading-tight truncate" style={{ color: 'var(--th-text)' }}>{item.title}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                            {item.status === 'dropped' && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">dropped</span>}
                          </div>
                          {item.author_or_creator && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--th-muted)' }}>{item.author_or_creator}</p>}
                          <p className="text-xs mt-0.5" style={{ color: 'var(--th-faint)' }}>
                            {formatMediaDate(item.started_at)}
                            {item.finished_at && ` → ${formatMediaDate(item.finished_at)}`}
                            {' · '}
                            {formatDuration(item.started_at, item.finished_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ArchivePage() {
  return (
    <AuthGuard>
      <ArchiveContent />
    </AuthGuard>
  );
}

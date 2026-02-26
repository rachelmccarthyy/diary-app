'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MediaType, MEDIA_TYPE_CONFIG } from '@/lib/mediaTypes';
import {
  getActiveMedia,
  createMediaItem,
  finishMediaItem,
  dropMediaItem,
  deleteMediaItem,
  formatMediaDate,
} from '@/lib/mediaDb';
import { useAuth } from '@/components/AuthProvider';
import AuthGuard from '@/components/AuthGuard';
import ThemeToggle from '@/components/ThemeToggle';
import type { MediaItem } from '@/lib/mediaTypes';

const MEDIA_TYPES: MediaType[] = ['book', 'show', 'movie', 'podcast'];

interface AddForm {
  title: string;
  type: MediaType;
  author_or_creator: string;
  cover_image_url: string;
  notes: string;
  started_at: string;
}

function todayISO(): string {
  return new Date().toISOString();
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function MediaContent() {
  const { user } = useAuth();
  const [activeItems, setActiveItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [finishConfirm, setFinishConfirm] = useState<string | null>(null);
  const [dropConfirm, setDropConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<AddForm>({
    title: '',
    type: 'book',
    author_or_creator: '',
    cover_image_url: '',
    notes: '',
    started_at: todayDate(),
  });

  const reload = useCallback(async () => {
    if (!user) return;
    try {
      setActiveItems(await getActiveMedia(user.id));
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleAdd() {
    if (!form.title.trim() || !user) return;
    try {
      await createMediaItem(user.id, {
        title: form.title.trim(),
        type: form.type,
        author_or_creator: form.author_or_creator.trim() || undefined,
        cover_image_url: form.cover_image_url.trim() || undefined,
        notes: form.notes.trim() || undefined,
        started_at: form.started_at ? new Date(form.started_at).toISOString() : todayISO(),
      });
      setForm({ title: '', type: 'book', author_or_creator: '', cover_image_url: '', notes: '', started_at: todayDate() });
      setShowAdd(false);
      reload();
    } catch (err) {
      console.error('Failed to add media:', err);
    }
  }

  async function handleFinish(id: string) {
    try {
      await finishMediaItem(id);
      setFinishConfirm(null);
      reload();
    } catch (err) {
      console.error('Failed to finish media:', err);
    }
  }

  async function handleDrop(id: string) {
    try {
      await dropMediaItem(id);
      setDropConfirm(null);
      reload();
    } catch (err) {
      console.error('Failed to drop media:', err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMediaItem(id);
      reload();
    } catch (err) {
      console.error('Failed to delete media:', err);
    }
  }

  const canAdd = form.title.trim();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--th-bg)' }}>
        <div
          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--th-faint)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--th-bg)' }}>
      <header
        className="sticky top-0 z-10 backdrop-blur-sm border-b"
        style={{ background: 'var(--th-header-bg)', borderColor: 'var(--th-border)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link href="/" className="text-sm flex items-center gap-1 transition-colors" style={{ color: 'var(--th-muted)' }}>
            ← Back
          </Link>
          <h1 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>
            Media
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/media/timeline"
              className="text-xs px-3 py-1.5 rounded-lg border transition-all"
              style={{ color: 'var(--th-muted)', borderColor: 'var(--th-border)', background: 'var(--th-card)' }}
            >
              Timeline
            </Link>
            <Link
              href="/media/archive"
              className="text-xs px-3 py-1.5 rounded-lg border transition-all"
              style={{ color: 'var(--th-muted)', borderColor: 'var(--th-border)', background: 'var(--th-card)' }}
            >
              Archive
            </Link>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-pink-600 text-white text-xs font-medium rounded-lg hover:bg-pink-700 transition-colors"
            >
              + Add
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--th-faint)' }}>
            Currently
          </h2>

          {activeItems.length === 0 ? (
            <div
              className="rounded-xl border p-6 text-center"
              style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}
            >
              <p className="font-display text-2xl mb-3" style={{ color: 'var(--th-border)' }}>—</p>
              <p className="text-sm mb-4" style={{ color: 'var(--th-muted)' }}>
                Nothing currently tracked.
              </p>
              <button
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-1 px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors"
              >
                + Start tracking something
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeItems.map((item) => {
                const cfg = MEDIA_TYPE_CONFIG[item.type];
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border p-4 flex items-start gap-4"
                    style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}
                  >
                    <div
                      className="w-12 h-16 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{ background: cfg.bg }}
                    >
                      {item.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-2xl">{cfg.emoji}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--th-text)' }}>
                            {item.title}
                          </p>
                          {item.author_or_creator && (
                            <p className="text-xs mt-0.5" style={{ color: 'var(--th-muted)' }}>
                              {item.author_or_creator}
                            </p>
                          )}
                        </div>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--th-faint)' }}>
                        Started {formatMediaDate(item.started_at)}
                      </p>

                      <div className="flex items-center gap-2 mt-3">
                        {finishConfirm === item.id ? (
                          <>
                            <span className="text-xs" style={{ color: 'var(--th-muted)' }}>Mark as finished?</span>
                            <button onClick={() => handleFinish(item.id)} className="text-xs px-2.5 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors">Yes</button>
                            <button onClick={() => setFinishConfirm(null)} className="text-xs px-2.5 py-1 rounded-lg transition-colors" style={{ color: 'var(--th-muted)' }}>Cancel</button>
                          </>
                        ) : dropConfirm === item.id ? (
                          <>
                            <span className="text-xs" style={{ color: 'var(--th-muted)' }}>Drop this?</span>
                            <button onClick={() => handleDrop(item.id)} className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">Yes</button>
                            <button onClick={() => setDropConfirm(null)} className="text-xs px-2.5 py-1 rounded-lg transition-colors" style={{ color: 'var(--th-muted)' }}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setFinishConfirm(item.id)} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors">✓ Finished</button>
                            <button onClick={() => setDropConfirm(item.id)} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors" style={{ color: 'var(--th-muted)', borderColor: 'var(--th-border)', background: 'var(--th-card)' }}>× Drop</button>
                            <button onClick={() => handleDelete(item.id)} className="text-xs px-2.5 py-1 rounded-lg text-red-400 hover:text-red-600 transition-colors ml-auto">Delete</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border shadow-xl p-6 space-y-4" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
            <h2 className="text-base font-semibold" style={{ color: 'var(--th-text)' }}>Add Media</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-1" style={{ color: 'var(--th-faint)' }}>Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. The Great Gatsby" className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100" style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-1" style={{ color: 'var(--th-faint)' }}>Type *</label>
                <div className="flex gap-2 flex-wrap">
                  {MEDIA_TYPES.map((t) => {
                    const cfg = MEDIA_TYPE_CONFIG[t];
                    return (
                      <button key={t} type="button" onClick={() => setForm({ ...form, type: t })} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition-all" style={form.type === t ? { background: cfg.bg, color: cfg.color, borderColor: cfg.color } : { background: 'var(--th-card)', color: 'var(--th-muted)', borderColor: 'var(--th-border)' }}>
                        {cfg.emoji} {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-1" style={{ color: 'var(--th-faint)' }}>Author / Creator</label>
                <input type="text" value={form.author_or_creator} onChange={(e) => setForm({ ...form, author_or_creator: e.target.value })} placeholder="e.g. F. Scott Fitzgerald" className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100" style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-1" style={{ color: 'var(--th-faint)' }}>Cover Image URL</label>
                <input type="url" value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100" style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-1" style={{ color: 'var(--th-faint)' }}>Started</label>
                <input type="date" value={form.started_at} onChange={(e) => setForm({ ...form, started_at: e.target.value })} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100" style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-1" style={{ color: 'var(--th-faint)' }}>Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." rows={2} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 resize-none" style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }} />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm rounded-lg border transition-all" style={{ color: 'var(--th-muted)', borderColor: 'var(--th-border)' }}>Cancel</button>
              <button onClick={handleAdd} disabled={!canAdd} className="px-4 py-2 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MediaPage() {
  return (
    <AuthGuard>
      <MediaContent />
    </AuthGuard>
  );
}

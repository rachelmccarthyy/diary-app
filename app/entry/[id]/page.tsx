'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DiaryEntry } from '@/lib/types';
import { getEntry, updateEntry, deleteEntry, formatEntryDate } from '@/lib/db';
import { getLogsForEntry, getMediaItem, createMediaLog, deleteLogsForEntry } from '@/lib/mediaDb';
import { MediaItem, MEDIA_TYPE_CONFIG } from '@/lib/mediaTypes';
import { useAuth } from '@/components/AuthProvider';
import AuthGuard from '@/components/AuthGuard';
import MoodPicker from '@/components/MoodPicker';
import TagInput from '@/components/TagInput';
import MarkdownEditor from '@/components/MarkdownEditor';
import ImageUploader from '@/components/ImageUploader';
import SpotifyEmbed from '@/components/SpotifyEmbed';
import MediaPicker from '@/components/MediaPicker';
import ThemeToggle from '@/components/ThemeToggle';

function EntryContent({ id }: { id: string }) {
  const { user } = useAuth();
  const router = useRouter();

  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [editing, setEditing] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [linkedMedia, setLinkedMedia] = useState<MediaItem[]>([]);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [spotifyUrl, setSpotifyUrl] = useState<string | undefined>();
  const [spotifyTitle, setSpotifyTitle] = useState<string | undefined>();
  const [editLinkedMediaIds, setEditLinkedMediaIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadEntry = useCallback(async () => {
    try {
      const found = await getEntry(id);
      if (!found) { setNotFound(true); return; }

      // Auto-reveal time capsules past their date
      if (found.isTimeCapsule && !found.isRevealed && found.revealAt && new Date(found.revealAt) <= new Date()) {
        const revealed = await updateEntry(id, { isRevealed: true });
        setEntry(revealed);
      } else {
        setEntry(found);
      }

      const logs = await getLogsForEntry(id);
      const media = await Promise.all(logs.map((l) => getMediaItem(l.media_id)));
      setLinkedMedia(media.filter((m): m is MediaItem => m !== null));
    } catch (err) {
      console.error('Failed to load entry:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEntry();
  }, [loadEntry]);

  function enterEdit() {
    if (!entry) return;
    setTitle(entry.title);
    setBody(entry.body);
    setMood(entry.mood);
    setTags(entry.tags);
    setImages(entry.images ?? []);
    setSpotifyUrl(entry.spotifyUrl);
    setSpotifyTitle(entry.spotifyTitle);
    setEditLinkedMediaIds(linkedMedia.map((m) => m.id));
    setEditing(true);
  }

  async function handleSave() {
    if (!entry || !user) return;
    setSaving(true);
    try {
      const updated = await updateEntry(id, { title: title.trim(), body, mood, tags, images, spotifyUrl, spotifyTitle });
      setEntry(updated);
      // Update media logs
      await deleteLogsForEntry(id);
      await Promise.all(editLinkedMediaIds.map((mediaId) => createMediaLog(user.id, mediaId, id)));
      const logs = await getLogsForEntry(id);
      const media = await Promise.all(logs.map((l) => getMediaItem(l.media_id)));
      setLinkedMedia(media.filter((m): m is MediaItem => m !== null));
      setEditing(false);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteEntry(id);
      router.push('/');
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }

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

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--th-bg)' }}>
        <div className="text-center">
          <p className="font-display text-3xl mb-4" style={{ color: 'var(--th-border)' }}>—</p>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--th-text)' }}>Entry not found</h2>
          <Link href="/" className="text-pink-600 hover:underline text-sm">Back to diary</Link>
        </div>
      </div>
    );
  }

  if (!entry) return null;

  const isLocked = entry.isTimeCapsule && !entry.isRevealed && entry.revealAt && new Date(entry.revealAt) > new Date();
  const dateStr = formatEntryDate(entry.createdAt, entry.timezone);
  const updatedStr = entry.updatedAt !== entry.createdAt
    ? formatEntryDate(entry.updatedAt, entry.timezone)
    : null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--th-bg)' }}>
      <header className="sticky top-0 z-10 backdrop-blur-sm border-b" style={{ background: 'var(--th-header-bg)', borderColor: 'var(--th-border)' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link href="/" className="text-sm transition-colors flex items-center gap-1" style={{ color: 'var(--th-muted)' }}>
            ← Back
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {!isLocked && !editing && (
              <>
                <button
                  onClick={enterEdit}
                  className="px-3 py-1.5 text-sm rounded-lg border transition-all hover:border-pink-300"
                  style={{ color: 'var(--th-muted)', borderColor: 'var(--th-border)' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 text-sm text-red-400 hover:text-red-600 border border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all"
                >
                  Delete
                </button>
              </>
            )}
            {editing && (
              <>
                <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm transition-colors" style={{ color: 'var(--th-muted)' }}>
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 disabled:opacity-40 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {editing ? (
          <div className="space-y-5">
            <input
              type="text"
              value={title}
              onChange={(e) => { const v = e.target.value; setTitle(v ? v[0].toUpperCase() + v.slice(1) : v); }}
              placeholder="Entry title..."
              autoFocus
              className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:opacity-40"
              style={{ color: 'var(--th-text)' }}
            />
            <hr style={{ borderColor: 'var(--th-border)' }} />
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: 'var(--th-faint)' }}>Mood</label>
              <MoodPicker value={mood} onChange={setMood} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: 'var(--th-faint)' }}>Tags</label>
              <TagInput tags={tags} onChange={setTags} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: 'var(--th-faint)' }}>Entry</label>
              <MarkdownEditor value={body} onChange={setBody} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: 'var(--th-faint)' }}>Images</label>
              <ImageUploader images={images} onChange={setImages} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: 'var(--th-faint)' }}>Song</label>
              <SpotifyEmbed
                url={spotifyUrl}
                title={spotifyTitle}
                onChange={(url, t) => { setSpotifyUrl(url); setSpotifyTitle(t); }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: 'var(--th-faint)' }}>Now Consuming</label>
              <MediaPicker selectedIds={editLinkedMediaIds} onChange={setEditLinkedMediaIds} />
            </div>
            <div className="flex justify-end pb-8">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 disabled:opacity-40 transition-colors shadow-sm"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : isLocked ? (
          <div className="text-center py-20">
            <p className="font-display text-4xl mb-4" style={{ color: 'var(--th-border)' }}>SEALED</p>
            <h1 className="font-display text-2xl mb-3" style={{ color: 'var(--th-text)' }}>Time Capsule</h1>
            <p className="text-sm mb-2" style={{ color: 'var(--th-muted)' }}>
              Written {dateStr}
            </p>
            {entry.revealAt && (
              <p className="font-mono-editorial" style={{ color: 'var(--th-accent)' }}>
                Opens {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(entry.revealAt))}
                {' '}({Math.ceil((new Date(entry.revealAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days)
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              {entry.mood && <span className="text-3xl mt-1">{entry.mood}</span>}
              <h1 className="text-2xl font-bold leading-tight" style={{ color: 'var(--th-text)' }}>
                {entry.title || 'Untitled'}
              </h1>
            </div>

            {entry.isTimeCapsule && entry.isRevealed && (
              <p className="font-mono-editorial" style={{ color: 'var(--th-accent)' }}>
                Time capsule — revealed
              </p>
            )}

            <div className="text-xs space-y-0.5" style={{ color: 'var(--th-faint)' }}>
              <p>Written {dateStr}</p>
              {updatedStr && <p className="italic">Edited {updatedStr}</p>}
              <p>{entry.timezone}</p>
            </div>

            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-pink-50 text-pink-600 rounded-full border border-pink-200">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {linkedMedia.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--th-faint)' }}>
                  Consumed with this entry
                </p>
                <div className="flex flex-wrap gap-2">
                  {linkedMedia.map((item) => {
                    const cfg = MEDIA_TYPE_CONFIG[item.type];
                    return (
                      <Link
                        key={item.id}
                        href="/media"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-opacity hover:opacity-80"
                        style={{ background: cfg.bg, color: cfg.color, borderColor: `${cfg.color}40` }}
                      >
                        <span>{cfg.emoji}</span>
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <hr style={{ borderColor: 'var(--th-border)' }} />

            {entry.spotifyUrl && (
              <iframe
                src={entry.spotifyUrl}
                width="100%"
                height="152"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl"
                style={{ border: 'none' }}
              />
            )}

            <div className="prose max-w-none">
              {entry.body ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.body}</ReactMarkdown>
              ) : (
                <p className="italic" style={{ color: 'var(--th-faint)' }}>No content.</p>
              )}
            </div>

            {entry.images?.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-2 pb-12">
                {entry.images.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`Image ${i + 1}`}
                    onClick={() => setLightboxSrc(src)}
                    className="w-full rounded-xl border object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
                    style={{ borderColor: 'var(--th-border)' }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out p-4"
          onClick={() => setLightboxSrc(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxSrc} alt="Full size" className="max-w-full max-h-full rounded-xl object-contain shadow-2xl" />
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl shadow-xl p-6 mx-4 max-w-sm w-full border" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--th-text)' }}>Delete this entry?</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--th-muted)' }}>
              &ldquo;{entry.title || 'Untitled'}&rdquo; will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm rounded-lg border transition-all"
                style={{ color: 'var(--th-muted)', borderColor: 'var(--th-border)' }}
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <EntryContent id={id} />
    </AuthGuard>
  );
}

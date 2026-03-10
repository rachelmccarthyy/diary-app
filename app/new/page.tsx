'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createEntry, updateEntry } from '@/lib/db';
import { createMediaLog, deleteLogsForEntry } from '@/lib/mediaDb';
import { useAuth } from '@/components/AuthProvider';
import AuthGuard from '@/components/AuthGuard';
import MoodPicker from '@/components/MoodPicker';
import TagInput from '@/components/TagInput';
import MarkdownEditor from '@/components/MarkdownEditor';
import ImageUploader from '@/components/ImageUploader';
import SpotifyEmbed from '@/components/SpotifyEmbed';
import MediaPicker from '@/components/MediaPicker';
import TimeCapsuleToggle from '@/components/TimeCapsuleToggle';
import AstroPrompt from '@/components/AstroPrompt';
import ThemeToggle from '@/components/ThemeToggle';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function NewEntryContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [spotifyUrl, setSpotifyUrl] = useState<string | undefined>();
  const [spotifyTitle, setSpotifyTitle] = useState<string | undefined>();
  const [linkedMediaIds, setLinkedMediaIds] = useState<string[]>([]);
  const [isTimeCapsule, setIsTimeCapsule] = useState(false);
  const [revealDate, setRevealDate] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Track whether an entry has been created in the DB
  const entryIdRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  const isEmpty = !title.trim() && !body.trim();

  const doSave = useCallback(async () => {
    if (!user || isEmpty || isSavingRef.current) return;
    isSavingRef.current = true;
    setSaveStatus('saving');
    try {
      const payload = {
        title: title.trim(),
        body,
        mood,
        tags,
        images,
        spotifyUrl,
        spotifyTitle,
        isTimeCapsule,
        revealAt: isTimeCapsule && revealDate ? new Date(revealDate).toISOString() : undefined,
      };

      if (entryIdRef.current) {
        // Update existing draft
        await updateEntry(entryIdRef.current, payload);
        // Update media logs
        await deleteLogsForEntry(entryIdRef.current);
        await Promise.all(
          linkedMediaIds.map((mediaId) => createMediaLog(user.id, mediaId, entryIdRef.current!))
        );
      } else {
        // Create new entry
        const entry = await createEntry(user.id, payload);
        entryIdRef.current = entry.id;
        await Promise.all(
          linkedMediaIds.map((mediaId) => createMediaLog(user.id, mediaId, entry.id))
        );
      }
      setSaveStatus('saved');
    } catch (err) {
      console.error('Auto-save failed:', err);
      setSaveStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  }, [user, title, body, mood, tags, images, spotifyUrl, spotifyTitle, linkedMediaIds, isTimeCapsule, revealDate, isEmpty]);

  // Debounced auto-save: triggers 2s after last change
  useEffect(() => {
    if (isEmpty) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      doSave();
    }, 2000);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [title, body, mood, tags, images, spotifyUrl, spotifyTitle, linkedMediaIds, isTimeCapsule, revealDate, doSave, isEmpty]);

  function handleDone() {
    // Save immediately and navigate
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (entryIdRef.current) {
      doSave().then(() => router.push(`/entry/${entryIdRef.current}`));
    } else if (!isEmpty) {
      doSave().then(() => {
        if (entryIdRef.current) router.push(`/entry/${entryIdRef.current}`);
        else router.push('/');
      });
    } else {
      router.push('/');
    }
  }

  const statusLabel = saveStatus === 'saving' ? 'Saving...'
    : saveStatus === 'saved' ? 'Saved'
    : saveStatus === 'error' ? 'Save failed'
    : '';

  return (
    <div className="min-h-screen" style={{ background: 'var(--th-bg)' }}>
      <header className="sticky top-0 z-10 backdrop-blur-sm border-b" style={{ background: 'var(--th-header-bg)', borderColor: 'var(--th-border)' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link href="/" className="text-sm transition-colors flex items-center gap-1" style={{ color: 'var(--th-muted)' }}>
            ← Back
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono-editorial text-xs" style={{ color: saveStatus === 'error' ? 'var(--th-accent)' : 'var(--th-faint)' }}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={handleDone} className="btn-primary">
              Done
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <input
          type="text"
          value={title}
          onChange={(e) => { const v = e.target.value; setTitle(v ? v[0].toUpperCase() + v.slice(1) : v); }}
          placeholder="Entry title..."
          autoFocus
          className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:opacity-40"
          style={{ color: 'var(--th-text)' }}
        />

        <p className="text-xs" style={{ color: 'var(--th-faint)' }}>
          {new Intl.DateTimeFormat('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }).format(new Date())}{' '}
          &middot; {Intl.DateTimeFormat().resolvedOptions().timeZone}
        </p>

        <hr style={{ borderColor: 'var(--th-border)' }} />

        {/* Astro prompt */}
        <AstroPrompt onUsePrompt={(prompt) => setBody((prev) => prev ? `${prev}\n\n${prompt}` : prompt)} />

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
            onChange={(url, title) => { setSpotifyUrl(url); setSpotifyTitle(title); }}
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: 'var(--th-faint)' }}>Now Consuming</label>
          <MediaPicker selectedIds={linkedMediaIds} onChange={setLinkedMediaIds} />
        </div>

        <hr style={{ borderColor: 'var(--th-border)' }} />

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: 'var(--th-faint)' }}>Time Capsule</label>
          <TimeCapsuleToggle
            enabled={isTimeCapsule}
            revealDate={revealDate}
            onToggle={setIsTimeCapsule}
            onDateChange={setRevealDate}
          />
        </div>

        <div className="pb-8" />
      </main>
    </div>
  );
}

export default function NewEntryPage() {
  return (
    <AuthGuard>
      <NewEntryContent />
    </AuthGuard>
  );
}

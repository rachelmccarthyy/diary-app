'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createEntry } from '@/lib/db';
import { createMediaLog } from '@/lib/mediaDb';
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
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user || (!title.trim() && !body.trim())) return;
    setSaving(true);
    try {
      const entry = await createEntry(user.id, {
        title: title.trim(),
        body,
        mood,
        tags,
        images,
        spotifyUrl,
        spotifyTitle,
        isTimeCapsule,
        revealAt: isTimeCapsule && revealDate ? new Date(revealDate).toISOString() : undefined,
      });
      await Promise.all(
        linkedMediaIds.map((mediaId) => createMediaLog(user.id, mediaId, entry.id))
      );
      router.push(`/entry/${entry.id}`);
    } catch (err) {
      console.error('Failed to save entry:', err);
      setSaving(false);
    }
  }

  const isEmpty = !title.trim() && !body.trim();

  return (
    <div className="min-h-screen" style={{ background: 'var(--th-bg)' }}>
      <header className="sticky top-0 z-10 backdrop-blur-sm border-b" style={{ background: 'var(--th-header-bg)', borderColor: 'var(--th-border)' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link href="/" className="text-sm transition-colors flex items-center gap-1" style={{ color: 'var(--th-muted)' }}>
            ← Back
          </Link>
          <h1 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>New Entry</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleSave}
              disabled={isEmpty || saving}
              className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
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

        <div className="flex justify-end pt-2 pb-8">
          <button
            onClick={handleSave}
            disabled={isEmpty || saving}
            className="px-6 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
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

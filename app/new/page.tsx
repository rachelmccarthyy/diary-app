'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createEntry } from '@/lib/storage';
import MoodPicker from '@/components/MoodPicker';
import TagInput from '@/components/TagInput';
import MarkdownEditor from '@/components/MarkdownEditor';
import ImageUploader from '@/components/ImageUploader';
import SpotifyEmbed from '@/components/SpotifyEmbed';

export default function NewEntryPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [spotifyUrl, setSpotifyUrl] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  function handleSave() {
    if (!title.trim() && !body.trim()) return;
    setSaving(true);
    const entry = createEntry({ title: title.trim(), body, mood, tags, images, spotifyUrl });
    router.push(`/entry/${entry.id}`);
  }

  const isEmpty = !title.trim() && !body.trim();

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-[#FDFBF7]/90 border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1"
          >
            ← Back
          </Link>
          <h1 className="text-sm font-semibold text-stone-700">New Entry</h1>
          <button
            onClick={handleSave}
            disabled={isEmpty || saving}
            className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => { const v = e.target.value; setTitle(v ? v[0].toUpperCase() + v.slice(1) : v); }}
          placeholder="Entry title..."
          autoFocus
          className="w-full text-2xl font-bold text-stone-800 placeholder:text-stone-300 bg-transparent border-none outline-none"
        />

        {/* Date / Timezone info */}
        <p className="text-xs text-stone-400">
          {new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }).format(new Date())}{' '}
          &middot; {Intl.DateTimeFormat().resolvedOptions().timeZone}
        </p>

        <hr className="border-stone-200" />

        {/* Mood */}
        <div>
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest block mb-2">
            Mood
          </label>
          <MoodPicker value={mood} onChange={setMood} />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest block mb-2">
            Tags
          </label>
          <TagInput tags={tags} onChange={setTags} />
        </div>

        {/* Body */}
        <div>
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest block mb-2">
            Entry
          </label>
          <MarkdownEditor value={body} onChange={setBody} />
        </div>

        {/* Images */}
        <div>
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest block mb-2">
            Images
          </label>
          <ImageUploader images={images} onChange={setImages} />
        </div>

        {/* Spotify */}
        <div>
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest block mb-2">
            Song
          </label>
          <SpotifyEmbed url={spotifyUrl} onChange={setSpotifyUrl} />
        </div>

        {/* Save (bottom) */}
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

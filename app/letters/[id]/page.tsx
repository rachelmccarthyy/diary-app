'use client';

import { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import { getLetter, deleteLetter } from '@/lib/lettersDb';
import type { Letter } from '@/lib/lettersDb';
import AuthGuard from '@/components/AuthGuard';
import ThemeToggle from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';

function LetterContent({ id }: { id: string }) {
  const router = useRouter();
  const [letter, setLetter] = useState<Letter | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const loadLetter = useCallback(async () => {
    try {
      const data = await getLetter(id);
      if (!data) { setNotFound(true); return; }
      setLetter(data);
    } catch (err) {
      console.error('Failed to load letter:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLetter();
  }, [loadLetter]);

  async function handleDelete() {
    try {
      await deleteLetter(id);
      router.push('/letters');
    } catch (err) {
      console.error('Failed to delete letter:', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--th-bg)' }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--th-faint)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (notFound || !letter) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--th-bg)' }}>
        <div className="text-center">
          <p className="font-display text-3xl mb-4" style={{ color: 'var(--th-border)' }}>—</p>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--th-text)' }}>Letter not found</h2>
          <Link href="/letters" className="text-pink-600 hover:underline text-sm">Back to letters</Link>
        </div>
      </div>
    );
  }

  const isDelivered = letter.delivered || new Date(letter.deliverAt) <= new Date();
  const deliverDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(letter.deliverAt));
  const writeDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(letter.createdAt));

  if (!isDelivered) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--th-bg)' }}>
        <header className="sticky top-0 z-10 backdrop-blur-sm border-b" style={{ background: 'var(--th-header-bg)', borderColor: 'var(--th-border)' }}>
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/letters" className="text-sm flex items-center gap-1" style={{ color: 'var(--th-muted)' }}>← Letters</Link>
            <ThemeToggle />
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="font-display text-4xl mb-4" style={{ color: 'var(--th-border)' }}>SEALED</p>
          <h1 className="font-display text-2xl mb-3" style={{ color: 'var(--th-text)' }}>{letter.subject}</h1>
          <p className="text-sm" style={{ color: 'var(--th-muted)' }}>This letter is still sealed.</p>
          <p className="font-mono-editorial mt-2" style={{ color: 'var(--th-accent)' }}>Opens {deliverDate}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--th-bg)' }}>
      <header className="sticky top-0 z-10 backdrop-blur-sm border-b" style={{ background: 'var(--th-header-bg)', borderColor: 'var(--th-border)' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/letters" className="text-sm flex items-center gap-1" style={{ color: 'var(--th-muted)' }}>← Letters</Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setShowDelete(true)}
              className="px-3 py-1.5 text-sm text-red-400 hover:text-red-600 border border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <p className="font-display text-2xl mb-3" style={{ color: 'var(--th-accent)' }}>OPENED</p>
          <p className="font-mono-editorial" style={{ color: 'var(--th-accent)' }}>
            Delivered {deliverDate}
          </p>
        </div>

        <div
          className="rounded-2xl border p-6 md:p-8 space-y-4"
          style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}
        >
          <h1 className="text-xl font-bold" style={{ color: 'var(--th-text)' }}>
            {letter.subject}
          </h1>
          <p className="text-xs" style={{ color: 'var(--th-faint)' }}>
            Written on {writeDate}
          </p>
          <hr style={{ borderColor: 'var(--th-border)' }} />
          <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--th-muted)' }}>
            {letter.body}
          </div>
        </div>
      </main>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl shadow-xl p-6 mx-4 max-w-sm w-full border" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--th-text)' }}>Delete this letter?</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--th-muted)' }}>This letter will be permanently deleted.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 text-sm rounded-lg border transition-all" style={{ color: 'var(--th-muted)', borderColor: 'var(--th-border)' }}>Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <LetterContent id={id} />
    </AuthGuard>
  );
}

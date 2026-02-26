'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getLetters, checkDeliveries } from '@/lib/lettersDb';
import type { Letter } from '@/lib/lettersDb';
import { useAuth } from '@/components/AuthProvider';
import AuthGuard from '@/components/AuthGuard';
import LetterCard from '@/components/LetterCard';
import ThemeToggle from '@/components/ThemeToggle';

function LettersContent() {
  const { user } = useAuth();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLetters = useCallback(async () => {
    if (!user) return;
    try {
      await checkDeliveries(user.id);
      const data = await getLetters(user.id);
      setLetters(data);
    } catch (err) {
      console.error('Failed to load letters:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadLetters();
  }, [loadLetters]);

  const pending = letters.filter((l) => !l.delivered && new Date(l.deliverAt) > new Date());
  const delivered = letters.filter((l) => l.delivered || new Date(l.deliverAt) <= new Date());

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
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link href="/" className="text-sm transition-colors flex items-center gap-1" style={{ color: 'var(--th-muted)' }}>
            ← Back
          </Link>
          <h1 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Letters to Future Self</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/letters/new"
              className="px-4 py-2 bg-pink-600 text-white text-xs font-medium rounded-lg hover:bg-pink-700 transition-colors"
            >
              + Write Letter
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {letters.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-3xl mb-4" style={{ color: 'var(--th-border)' }}>*</p>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--th-muted)' }}>No letters yet</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--th-faint)' }}>Write a letter to your future self and choose when to open it.</p>
            <Link href="/letters/new" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors">
              Write your first letter
            </Link>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--th-faint)' }}>
                  Pending ({pending.length})
                </h2>
                <div className="space-y-3">
                  {pending.map((letter) => (
                    <LetterCard key={letter.id} letter={letter} />
                  ))}
                </div>
              </section>
            )}

            {delivered.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--th-faint)' }}>
                  Delivered ({delivered.length})
                </h2>
                <div className="space-y-3">
                  {delivered.map((letter) => (
                    <LetterCard key={letter.id} letter={letter} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function LettersPage() {
  return (
    <AuthGuard>
      <LettersContent />
    </AuthGuard>
  );
}

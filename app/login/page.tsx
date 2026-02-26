'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { signInWithGoogle, signInWithMagicLink } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/');
  }, [user, loading, router]);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError('');
    try {
      await signInWithMagicLink(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setSending(false);
    }
  }

  async function handleGoogle() {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
    }
  }

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--th-bg)' }}>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1
            className="font-display leading-none mb-2"
            style={{ color: 'var(--th-text)', fontSize: 'clamp(2rem, 5vw, 3rem)' }}
          >
            My Diary
          </h1>
          <p className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>
            A private space for your thoughts
          </p>
        </div>

        {sent ? (
          <div
            className="rounded-xl border p-6 text-center"
            style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}
          >
            <p className="font-display text-2xl mb-3" style={{ color: 'var(--th-faint)' }}>*</p>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--th-text)' }}>
              Check your email
            </p>
            <p className="text-xs" style={{ color: 'var(--th-muted)' }}>
              We sent a magic link to <strong>{email}</strong>
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="mt-4 text-xs underline transition-opacity hover:opacity-60"
              style={{ color: 'var(--th-muted)' }}
            >
              Try a different email
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all hover:opacity-80"
              style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'var(--th-border)' }} />
              <span className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'var(--th-border)' }} />
            </div>

            <form onSubmit={handleMagicLink} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all"
                style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }}
              />
              <button
                type="submit"
                disabled={!email.trim() || sending}
                className="w-full px-4 py-3 bg-pink-600 text-white text-sm font-medium rounded-xl hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>

            {error && (
              <p className="text-xs text-center text-red-500">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

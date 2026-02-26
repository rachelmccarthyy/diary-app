'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error('Auth callback error:', error);
          router.replace('/login');
        } else {
          router.replace('/');
        }
      });
    } else {
      // No code — might have tokens in hash fragment, client handles automatically
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--th-bg)' }}>
      <div className="text-center">
        <div
          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
          style={{ borderColor: 'var(--th-faint)', borderTopColor: 'transparent' }}
        />
        <p className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>Signing you in...</p>
      </div>
    </div>
  );
}

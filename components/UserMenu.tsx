'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { signOut } from '@/lib/auth';

export default function UserMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full overflow-hidden border-2 transition-opacity hover:opacity-80 flex items-center justify-center"
        style={{ borderColor: 'var(--th-border)', background: 'var(--th-toolbar)' }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-medium" style={{ color: 'var(--th-muted)' }}>
            {(name || '?')[0].toUpperCase()}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 w-48 rounded-xl border shadow-lg py-2 z-50"
          style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}
        >
          <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--th-border)' }}>
            <p className="text-sm font-medium truncate" style={{ color: 'var(--th-text)' }}>{name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--th-faint)' }}>{user.email}</p>
          </div>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm transition-opacity hover:opacity-60"
            style={{ color: 'var(--th-text)' }}
          >
            Settings
          </Link>
          <button
            onClick={async () => {
              await signOut();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm transition-opacity hover:opacity-60"
            style={{ color: 'var(--th-accent)' }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

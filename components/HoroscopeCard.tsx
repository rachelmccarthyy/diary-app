'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { getProfile } from '@/lib/db';
import { getSunSign, getSignInfo, getDailyHoroscope, getCurrentMoonPhase } from '@/lib/astrology';
import type { ZodiacSign } from '@/lib/astrology';
import Link from 'next/link';

export default function HoroscopeCard() {
  const { user } = useAuth();
  const [sunSign, setSunSign] = useState<ZodiacSign | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then((profile) => {
      if (profile?.birth_date) {
        setSunSign(getSunSign(profile.birth_date));
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [user]);

  if (!loaded) return null;

  const moon = getCurrentMoonPhase();

  if (!sunSign) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>Astro</span>
        </div>
        <div className="h-px mb-4" style={{ background: 'var(--th-border)' }} />
        <div className="space-y-2">
          <p className="text-sm" style={{ color: 'var(--th-muted)' }}>
            {moon.emoji} {moon.name}
          </p>
          <p className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>
            <Link href="/settings" className="underline" style={{ textUnderlineOffset: '3px' }}>
              Add your birth date
            </Link>{' '}
            for daily horoscope
          </p>
        </div>
      </div>
    );
  }

  const info = getSignInfo(sunSign);
  const horoscope = getDailyHoroscope(sunSign);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>
          Daily Horoscope
        </span>
        <Link
          href="/chart"
          className="font-mono-editorial transition-opacity hover:opacity-50"
          style={{ color: 'var(--th-faint)' }}
        >
          Chart →
        </Link>
      </div>
      <div className="h-px mb-4" style={{ background: 'var(--th-border)' }} />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{info?.symbol}</span>
          <span className="text-sm font-medium" style={{ color: 'var(--th-text)' }}>
            {sunSign}
          </span>
          <span className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>
            {info?.element}
          </span>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--th-muted)' }}>
          {horoscope}
        </p>

        <p className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>
          {moon.emoji} {moon.name} · {Math.round(moon.fraction * 100)}% illuminated
        </p>
      </div>
    </div>
  );
}

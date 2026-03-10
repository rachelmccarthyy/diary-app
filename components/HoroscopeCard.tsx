'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { getProfile } from '@/lib/db';
import { getSunSign, getSignInfo, getDailyHoroscope, getCurrentMoonPhase, isMercuryRetrograde } from '@/lib/astrology';
import type { ZodiacSign } from '@/lib/astrology';
import Link from 'next/link';

/** Cache key uses date to refresh daily */
function cacheKey(sign: string) {
  const d = new Date();
  return `horoscope_${sign}_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
}

async function fetchDailyHoroscope(sign: string): Promise<string | null> {
  const key = cacheKey(sign);
  const cached = sessionStorage.getItem(key);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${encodeURIComponent(sign)}&day=TODAY`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.data?.horoscope_data;
    if (text) sessionStorage.setItem(key, text);
    return text ?? null;
  } catch {
    return null;
  }
}

/** Compose a single cohesive horoscope from astrological conditions */
function composeDailyReading(
  sunSign: ZodiacSign,
  apiText: string | null,
): string {
  const moon = getCurrentMoonPhase();
  const retrograde = isMercuryRetrograde();
  const local = getDailyHoroscope(sunSign);

  // If we got an API horoscope, use it as the core and append lunar context
  if (apiText) {
    let reading = apiText;
    // Append moon phase context
    if (moon.name === 'Full Moon') {
      reading += ' The full moon amplifies your emotions — let them guide you rather than overwhelm you.';
    } else if (moon.name === 'New Moon') {
      reading += ' Under the new moon, this is a potent time for setting intentions and planting seeds.';
    }
    if (retrograde) {
      reading += ' With Mercury retrograde, double-check your messages and allow extra patience in conversations.';
    }
    return reading;
  }

  // Fallback: blend local sign + element + moon into one paragraph
  let reading = local.sign;
  reading += ' ' + local.element;
  if (moon.name === 'Full Moon' || moon.name === 'New Moon') {
    reading += ' ' + local.moon;
  }
  if (retrograde) {
    reading += ' Mercury is retrograde — be extra mindful of miscommunications and travel plans.';
  }
  return reading;
}

export default function HoroscopeCard() {
  const { user } = useAuth();
  const [sunSign, setSunSign] = useState<ZodiacSign | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [apiHoroscope, setApiHoroscope] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then((profile) => {
      if (profile?.birth_date) {
        const sign = getSunSign(profile.birth_date);
        setSunSign(sign);
        if (sign) {
          fetchDailyHoroscope(sign).then(setApiHoroscope);
        }
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
          <span className="section-label" style={{ color: 'var(--th-text)' }}>Astro</span>
        </div>
        <div className="h-px mb-4" style={{ background: 'var(--th-border)' }} />
        <div className="space-y-2">
          <p className="text-sm" style={{ color: 'var(--th-muted)' }}>
            {moon.emoji} {moon.name}
          </p>
          <p className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>
            <Link href="/chart" className="underline" style={{ textUnderlineOffset: '3px' }}>
              Add your birth date
            </Link>{' '}
            for daily horoscope
          </p>
        </div>
      </div>
    );
  }

  const info = getSignInfo(sunSign);
  const reading = composeDailyReading(sunSign, apiHoroscope);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="section-label" style={{ color: 'var(--th-text)' }}>
          Daily Horoscope
        </span>
        <Link href="/chart" className="btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.65rem' }}>
          Chart →
        </Link>
      </div>
      <div className="h-px mb-4" style={{ background: 'var(--th-border)' }} />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{info?.symbol}</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>
            {sunSign}
          </span>
          <span className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>
            {info?.element}
          </span>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--th-muted)' }}>
          {reading}
        </p>

        <p className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>
          {moon.emoji} {moon.name} · {Math.round(moon.fraction * 100)}%
        </p>
      </div>
    </div>
  );
}

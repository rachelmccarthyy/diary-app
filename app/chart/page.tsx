'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getProfile } from '@/lib/db';
import { getSunSign, getSignInfo, getCurrentMoonPhase, isMercuryRetrograde } from '@/lib/astrology';
import { calculateChart } from '@/lib/birthChart';
import type { ChartData } from '@/lib/birthChart';
import { useAuth } from '@/components/AuthProvider';
import AuthGuard from '@/components/AuthGuard';
import BirthChart from '@/components/BirthChart';
import ThemeToggle from '@/components/ThemeToggle';

function ChartContent() {
  const { user } = useAuth();
  const [chart, setChart] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [noBirthData, setNoBirthData] = useState(false);

  const loadChart = useCallback(async () => {
    if (!user) return;
    try {
      const profile = await getProfile(user.id);
      if (!profile?.birth_date) {
        setNoBirthData(true);
        return;
      }
      const data = calculateChart(profile.birth_date, profile.birth_time, profile.birth_lat, profile.birth_lng, profile.birth_timezone);
      setChart(data);
    } catch (err) {
      console.error('Failed to load chart:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadChart();
  }, [loadChart]);

  const moon = getCurrentMoonPhase();
  const retrograde = isMercuryRetrograde();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--th-bg)' }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--th-faint)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (noBirthData) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--th-bg)' }}>
        <header className="sticky top-0 z-10 backdrop-blur-sm border-b" style={{ background: 'var(--th-header-bg)', borderColor: 'var(--th-border)' }}>
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-sm flex items-center gap-1" style={{ color: 'var(--th-muted)' }}>← Back</Link>
            <h1 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Birth Chart</h1>
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <p className="font-display text-4xl mb-4" style={{ color: 'var(--th-border)' }}>*</p>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--th-muted)' }}>No birth data yet</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--th-faint)' }}>Add your birth date in settings to see your birth chart.</p>
          <Link href="/settings" className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors">
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  if (!chart) return null;

  const sunInfo = getSignInfo(chart.sunSign);
  const moonInfo = getSignInfo(chart.moonSign);
  const risingInfo = chart.risingSign ? getSignInfo(chart.risingSign) : null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--th-bg)' }}>
      <header className="sticky top-0 z-10 backdrop-blur-sm border-b" style={{ background: 'var(--th-header-bg)', borderColor: 'var(--th-border)' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm flex items-center gap-1" style={{ color: 'var(--th-muted)' }}>← Back</Link>
          <h1 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Birth Chart</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Big three */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--th-faint)' }}>
            Your Big Three
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
              <p className="text-3xl mb-1">{sunInfo?.symbol}</p>
              <p className="text-sm font-medium" style={{ color: 'var(--th-text)' }}>{chart.sunSign}</p>
              <p className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>Sun Sign</p>
              <p className="text-xs mt-1" style={{ color: 'var(--th-muted)' }}>Your core identity</p>
            </div>
            <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
              <p className="text-3xl mb-1">{moonInfo?.symbol}</p>
              <p className="text-sm font-medium" style={{ color: 'var(--th-text)' }}>{chart.moonSign}</p>
              <p className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>Moon Sign</p>
              <p className="text-xs mt-1" style={{ color: 'var(--th-muted)' }}>Your emotional self</p>
            </div>
            <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
              {chart.risingSign ? (
                <>
                  <p className="text-3xl mb-1">{risingInfo?.symbol}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--th-text)' }}>{chart.risingSign}</p>
                </>
              ) : (
                <>
                  <p className="text-3xl mb-1">?</p>
                  <Link href="/settings" className="text-sm underline" style={{ color: 'var(--th-accent)' }}>Add birth time</Link>
                </>
              )}
              <p className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>Rising Sign</p>
              <p className="text-xs mt-1" style={{ color: 'var(--th-muted)' }}>How others see you</p>
            </div>
          </div>
        </section>

        {/* Chart visualization */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--th-faint)' }}>
            Natal Chart
          </h2>
          <div className="rounded-xl border p-6" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
            <BirthChart chart={chart} />
          </div>
          <p className="text-xs text-center mt-2" style={{ color: 'var(--th-faint)' }}>
            Approximate positions — for entertainment purposes
          </p>
        </section>

        {/* Planet placements */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--th-faint)' }}>
            Planet Placements
          </h2>
          <div className="rounded-xl border divide-y overflow-hidden" style={{ borderColor: 'var(--th-border)' }}>
            {chart.planets.map((planet) => {
              const info = getSignInfo(planet.sign);
              return (
                <div key={planet.name} className="flex items-center gap-3 px-4 py-3" style={{ background: 'var(--th-card)' }}>
                  <span className="text-xl w-8 text-center">{planet.symbol}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--th-text)' }}>{planet.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{info?.symbol}</span>
                    <span className="text-sm" style={{ color: 'var(--th-muted)' }}>{planet.sign}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Current sky */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--th-faint)' }}>
            Current Sky
          </h2>
          <div className="rounded-xl border p-4 space-y-3" style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{moon.emoji}</span>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--th-text)' }}>{moon.name}</p>
                <p className="text-xs" style={{ color: 'var(--th-muted)' }}>{Math.round(moon.fraction * 100)}% illuminated</p>
              </div>
            </div>
            {retrograde && (
              <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'var(--th-border)' }}>
                <span className="text-2xl">☿</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--th-accent)' }}>Mercury Retrograde</p>
                  <p className="text-xs" style={{ color: 'var(--th-muted)' }}>Communication and travel may be disrupted</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function ChartPage() {
  return (
    <AuthGuard>
      <ChartContent />
    </AuthGuard>
  );
}

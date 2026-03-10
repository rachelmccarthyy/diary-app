'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getProfile, updateProfile } from '@/lib/db';
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

  // Inline birth info editing
  const [editingBirth, setEditingBirth] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [savingBirth, setSavingBirth] = useState(false);

  const loadChart = useCallback(async () => {
    if (!user) return;
    try {
      const profile = await getProfile(user.id);
      if (profile) {
        setBirthDate(profile.birth_date ?? '');
        setBirthTime(profile.birth_time ?? '');
        setBirthLocation(profile.birth_location ?? '');
      }
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

  async function handleSaveBirth() {
    if (!user || !birthDate) return;
    setSavingBirth(true);
    try {
      let birth_lat: number | null = null;
      let birth_lng: number | null = null;
      let birth_timezone: string | null = null;
      const loc = birthLocation.trim();
      if (loc) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc)}&format=json&limit=1`,
            { headers: { 'User-Agent': 'diary-app/1.0' } }
          );
          const results = await res.json();
          if (results.length > 0) {
            birth_lat = parseFloat(results[0].lat);
            birth_lng = parseFloat(results[0].lon);
            try {
              const tzRes = await fetch(
                `https://timeapi.io/api/timezone/coordinate?latitude=${birth_lat}&longitude=${birth_lng}`
              );
              const tzData = await tzRes.json();
              if (tzData.timeZone) birth_timezone = tzData.timeZone;
            } catch { /* timezone lookup failed */ }
          }
        } catch { /* geocoding failed */ }
      }

      await updateProfile(user.id, {
        birth_date: birthDate || null,
        birth_time: birthTime || null,
        birth_location: loc || null,
        birth_lat,
        birth_lng,
        birth_timezone,
      });

      setEditingBirth(false);
      setNoBirthData(false);
      // Reload chart
      setLoading(true);
      await loadChart();
    } catch (err) {
      console.error('Failed to save birth info:', err);
    } finally {
      setSavingBirth(false);
    }
  }

  const moon = getCurrentMoonPhase();
  const retrograde = isMercuryRetrograde();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--th-bg)' }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--th-faint)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  // Birth info form (used for both empty state and edit mode)
  const birthForm = (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest block mb-1" style={{ color: 'var(--th-faint)' }}>Birth Date *</label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
          style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }}
        />
        {birthDate && getSunSign(birthDate) && (
          <p className="text-sm mt-2 flex items-center gap-2" style={{ color: 'var(--th-text)' }}>
            <span className="text-lg">{getSignInfo(getSunSign(birthDate)!)?.symbol}</span>
            <span className="font-medium">{getSunSign(birthDate)}</span>
          </p>
        )}
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest block mb-1" style={{ color: 'var(--th-faint)' }}>Birth Time</label>
        <input
          type="time"
          value={birthTime}
          onChange={(e) => setBirthTime(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
          style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--th-faint)' }}>Needed for accurate rising sign</p>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest block mb-1" style={{ color: 'var(--th-faint)' }}>Birth Location</label>
        <input
          type="text"
          value={birthLocation}
          onChange={(e) => setBirthLocation(e.target.value)}
          placeholder="City, Country"
          className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
          style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--th-faint)' }}>Needed for accurate chart positions</p>
      </div>
      <div className="flex gap-3 pt-2">
        {!noBirthData && (
          <button onClick={() => setEditingBirth(false)} className="btn-secondary">
            Cancel
          </button>
        )}
        <button
          onClick={handleSaveBirth}
          disabled={!birthDate || savingBirth}
          className="btn-primary"
        >
          {savingBirth ? 'Saving...' : 'Save & Generate Chart'}
        </button>
      </div>
    </div>
  );

  if (noBirthData || editingBirth) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--th-bg)' }}>
        <header className="sticky top-0 z-10 backdrop-blur-sm border-b" style={{ background: 'var(--th-header-bg)', borderColor: 'var(--th-border)' }}>
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-sm flex items-center gap-1" style={{ color: 'var(--th-muted)' }}>← Back</Link>
            <h1 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Birth Chart</h1>
            <ThemeToggle />
          </div>
        </header>
        <div className="max-w-md mx-auto py-12 px-4">
          <p className="font-display text-4xl mb-4 text-center" style={{ color: 'var(--th-border)' }}>*</p>
          <h2 className="text-lg font-semibold mb-2 text-center" style={{ color: 'var(--th-muted)' }}>
            {editingBirth ? 'Edit Birth Info' : 'Enter Your Birth Info'}
          </h2>
          <p className="text-sm mb-6 text-center" style={{ color: 'var(--th-faint)' }}>
            Add your birth details to generate a personalized chart.
          </p>
          {birthForm}
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setEditingBirth(true)} className="btn-secondary">
              Edit Birth Info
            </button>
          </div>
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
                  <button onClick={() => setEditingBirth(true)} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Add birth time</button>
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

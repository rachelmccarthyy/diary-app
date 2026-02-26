'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getProfile, updateProfile } from '@/lib/db';
import type { Profile } from '@/lib/db';
import { getSunSign, getSignInfo } from '@/lib/astrology';
import { useAuth } from '@/components/AuthProvider';
import AuthGuard from '@/components/AuthGuard';
import ThemeToggle from '@/components/ThemeToggle';

function SettingsContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');

  const loadProfile = useCallback(async () => {
    if (!user) return;
    try {
      const p = await getProfile(user.id);
      if (p) {
        setProfile(p);
        setDisplayName(p.display_name ?? '');
        setBirthDate(p.birth_date ?? '');
        setBirthTime(p.birth_time ?? '');
        setBirthLocation(p.birth_location ?? '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      // Geocode birth location to lat/lng for accurate chart calculations
      let birth_lat: number | null = profile?.birth_lat ?? null;
      let birth_lng: number | null = profile?.birth_lng ?? null;
      let birth_timezone: string | null = profile?.birth_timezone ?? null;
      const loc = birthLocation.trim();
      if (loc && (loc !== profile?.birth_location || birth_lat == null || birth_timezone == null)) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc)}&format=json&limit=1`,
            { headers: { 'User-Agent': 'diary-app/1.0' } }
          );
          const results = await res.json();
          if (results.length > 0) {
            birth_lat = parseFloat(results[0].lat);
            birth_lng = parseFloat(results[0].lon);
            // Look up IANA timezone from coordinates
            try {
              const tzRes = await fetch(
                `https://timeapi.io/api/timezone/coordinate?latitude=${birth_lat}&longitude=${birth_lng}`
              );
              const tzData = await tzRes.json();
              if (tzData.timeZone) birth_timezone = tzData.timeZone;
            } catch { /* timezone lookup failed — fall back to null */ }
          }
        } catch {
          // Geocoding failed — keep existing coordinates
        }
      }

      const payload = {
        display_name: displayName.trim() || null,
        birth_date: birthDate || null,
        birth_time: birthTime || null,
        birth_location: loc || null,
        birth_lat,
        birth_lng,
        birth_timezone,
      };
      const updated = await updateProfile(user.id, payload);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  }

  const sunSign = birthDate ? getSunSign(birthDate) : null;
  const signInfo = sunSign ? getSignInfo(sunSign) : null;

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
          <h1 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>Settings</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 disabled:opacity-40 transition-colors"
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Profile */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--th-faint)' }}>
            Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-1" style={{ color: 'var(--th-faint)' }}>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100"
                style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }}
              />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--th-faint)' }}>Email</label>
              <p className="text-sm px-4 py-3 rounded-xl border" style={{ color: 'var(--th-muted)', borderColor: 'var(--th-border)', background: 'var(--th-toolbar)' }}>
                {user?.email}
              </p>
            </div>
          </div>
        </section>

        <hr style={{ borderColor: 'var(--th-border)' }} />

        {/* Astrology */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--th-faint)' }}>
            Astrology
          </h2>
          <p className="text-xs mb-4" style={{ color: 'var(--th-faint)' }}>
            Add your birth data for personalized horoscopes and birth chart.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-1" style={{ color: 'var(--th-faint)' }}>Birth Date *</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100"
                style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }}
              />
              {sunSign && signInfo && (
                <p className="text-sm mt-2 flex items-center gap-2" style={{ color: 'var(--th-text)' }}>
                  <span className="text-lg">{signInfo.symbol}</span>
                  <span className="font-medium">{sunSign}</span>
                  <span className="font-mono-editorial" style={{ color: 'var(--th-faint)' }}>{signInfo.element}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-1" style={{ color: 'var(--th-faint)' }}>Birth Time</label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100"
                style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--th-faint)' }}>
                Needed for accurate rising sign and birth chart
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-1" style={{ color: 'var(--th-faint)' }}>Birth Location</label>
              <input
                type="text"
                value={birthLocation}
                onChange={(e) => setBirthLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100"
                style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--th-faint)' }}>
                Needed for accurate birth chart positions
              </p>
            </div>
          </div>

          {sunSign && (
            <div className="mt-6">
              <Link
                href="/chart"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-opacity hover:opacity-70"
                style={{ borderColor: 'var(--th-border)', color: 'var(--th-text)' }}
              >
                <span>{signInfo?.symbol}</span>
                <span className="text-sm">View Birth Chart</span>
              </Link>
            </div>
          )}
        </section>

        <div className="flex justify-end pt-2 pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 disabled:opacity-40 transition-colors shadow-sm"
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

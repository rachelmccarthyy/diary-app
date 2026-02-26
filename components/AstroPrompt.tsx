'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { getProfile } from '@/lib/db';
import { getSunSign, getJournalingPrompt, getCurrentMoonPhase } from '@/lib/astrology';
import type { ZodiacSign } from '@/lib/astrology';

interface Props {
  onUsePrompt: (prompt: string) => void;
}

export default function AstroPrompt({ onUsePrompt }: Props) {
  const { user } = useAuth();
  const [sunSign, setSunSign] = useState<ZodiacSign | null>(null);
  const [promptData, setPromptData] = useState<{ prompt: string; source: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) {
      // Still show moon-phase prompts even without profile
      setPromptData(getJournalingPrompt(null));
      return;
    }
    getProfile(user.id).then((profile) => {
      const sign = profile?.birth_date ? getSunSign(profile.birth_date) : null;
      setSunSign(sign);
      setPromptData(getJournalingPrompt(sign));
    }).catch(() => {
      setPromptData(getJournalingPrompt(null));
    });
  }, [user]);

  if (dismissed || !promptData) return null;

  const moon = getCurrentMoonPhase();

  return (
    <div
      className="rounded-lg border p-4"
      style={{ background: 'var(--th-card)', borderColor: 'var(--th-border)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-mono-editorial mb-2" style={{ color: 'var(--th-faint)' }}>
            {moon.emoji} {promptData.source}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text)' }}>
            {promptData.prompt}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs flex-shrink-0"
          style={{ color: 'var(--th-faint)' }}
        >
          ×
        </button>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={() => {
            onUsePrompt(promptData.prompt);
            setDismissed(true);
          }}
          className="font-mono-editorial px-3 py-1 border rounded-lg transition-opacity hover:opacity-70"
          style={{ color: 'var(--th-accent)', borderColor: 'var(--th-accent)' }}
        >
          Use as prompt
        </button>
        <button
          onClick={() => {
            // Refresh with a new prompt
            setPromptData(getJournalingPrompt(sunSign));
          }}
          className="font-mono-editorial transition-opacity hover:opacity-50"
          style={{ color: 'var(--th-faint)' }}
        >
          Shuffle
        </button>
      </div>
    </div>
  );
}

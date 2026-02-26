'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createLetter } from '@/lib/lettersDb';
import { useAuth } from '@/components/AuthProvider';
import AuthGuard from '@/components/AuthGuard';
import ThemeToggle from '@/components/ThemeToggle';

function NewLetterContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [deliverDate, setDeliverDate] = useState('');
  const [saving, setSaving] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 10);

  async function handleSave() {
    if (!user || !subject.trim() || !body.trim() || !deliverDate) return;
    setSaving(true);
    try {
      await createLetter(user.id, {
        subject: subject.trim(),
        body: body.trim(),
        deliverAt: new Date(deliverDate).toISOString(),
      });
      router.push('/letters');
    } catch (err) {
      console.error('Failed to save letter:', err);
      setSaving(false);
    }
  }

  const canSave = subject.trim() && body.trim() && deliverDate;

  return (
    <div className="min-h-screen" style={{ background: 'var(--th-bg)' }}>
      <header className="sticky top-0 z-10 backdrop-blur-sm border-b" style={{ background: 'var(--th-header-bg)', borderColor: 'var(--th-border)' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link href="/letters" className="text-sm transition-colors flex items-center gap-1" style={{ color: 'var(--th-muted)' }}>
            ← Letters
          </Link>
          <h1 className="text-sm font-semibold" style={{ color: 'var(--th-text)' }}>New Letter</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleSave}
              disabled={!canSave || saving}
              className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Sending...' : 'Seal & Send'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="text-center py-4">
          <p className="font-display text-2xl mb-2" style={{ color: 'var(--th-faint)' }}>*</p>
          <p className="text-sm" style={{ color: 'var(--th-muted)' }}>
            Write a letter to your future self. It will be sealed until the delivery date.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: 'var(--th-faint)' }}>
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Dear future me..."
            autoFocus
            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100"
            style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }}
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: 'var(--th-faint)' }}>
            Deliver on
          </label>
          <input
            type="date"
            value={deliverDate}
            min={minDate}
            onChange={(e) => setDeliverDate(e.target.value)}
            className="px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100"
            style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }}
          />
          {deliverDate && (
            <p className="text-xs mt-2" style={{ color: 'var(--th-faint)' }}>
              {Math.ceil((new Date(deliverDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days from now
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: 'var(--th-faint)' }}>
            Your letter
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write something meaningful to your future self..."
            rows={12}
            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 resize-none leading-relaxed"
            style={{ background: 'var(--th-input)', color: 'var(--th-text)', borderColor: 'var(--th-border)' }}
          />
        </div>

        <div className="flex justify-end pt-2 pb-8">
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="px-6 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {saving ? 'Sending...' : 'Seal & Send to Future'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function NewLetterPage() {
  return (
    <AuthGuard>
      <NewLetterContent />
    </AuthGuard>
  );
}

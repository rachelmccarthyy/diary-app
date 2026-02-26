'use client';

import { useEffect, useState } from 'react';

const DARK: Record<string, string> = {
  '--th-bg': '#0a0a0a',
  '--th-card': '#0a0a0a',
  '--th-toolbar': '#141414',
  '--th-border': '#222222',
  '--th-border-strong': '#333333',
  '--th-text': '#f0f0f0',
  '--th-muted': '#888888',
  '--th-faint': '#444444',
  '--th-input': '#0a0a0a',
  '--th-header-bg': 'rgba(10, 10, 10, 0.97)',
  '--th-accent': '#d4587a',
  '--th-accent-hover': '#e06e8c',
  '--th-rule': '#f0f0f0',
  '--th-inv-bg': '#f0f0f0',
  '--th-inv-text': '#0a0a0a',
};

function applyTheme(dark: boolean) {
  const root = document.documentElement;
  if (dark) {
    Object.entries(DARK).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute('data-theme', 'dark');
  } else {
    Object.keys(DARK).forEach((k) => root.style.removeProperty(k));
    root.setAttribute('data-theme', 'light');
  }
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored === 'dark' || (!stored && sys);
    setDark(isDark);
    applyTheme(isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    applyTheme(next);
  }

  return (
    <button
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--th-border)] hover:bg-[var(--th-toolbar)] transition-all text-base"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}

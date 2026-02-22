'use client';

import { useEffect, useState } from 'react';

const DARK: Record<string, string> = {
  '--th-bg': '#181715',
  '--th-card': '#221f1d',
  '--th-toolbar': '#2a2826',
  '--th-border': '#3d3a36',
  '--th-text': '#f0eeea',
  '--th-muted': '#a8a29e',
  '--th-faint': '#57534e',
  '--th-input': '#1c1917',
  '--th-header-bg': 'rgba(24, 23, 21, 0.92)',
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

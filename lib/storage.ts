import { DiaryEntry } from './types';

const STORAGE_KEY = 'diary-entries';

export function getEntries(): DiaryEntry[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const entries = (JSON.parse(raw) as DiaryEntry[]).map((e) => ({ ...e, images: e.images ?? [] }));
    return [...entries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export function getEntry(id: string): DiaryEntry | null {
  return getEntries().find((e) => e.id === id) ?? null;
}

function persistEntries(entries: DiaryEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function saveEntry(entry: DiaryEntry): void {
  const all = getEntries();
  const idx = all.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    all[idx] = entry;
  } else {
    all.unshift(entry);
  }
  persistEntries(all);
}

export function deleteEntry(id: string): void {
  persistEntries(getEntries().filter((e) => e.id !== id));
}

export function createEntry(
  data: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt' | 'timezone'>
): DiaryEntry {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date().toISOString();
  const entry: DiaryEntry = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    timezone,
  };
  saveEntry(entry);
  return entry;
}

export function updateEntry(
  id: string,
  data: Partial<Omit<DiaryEntry, 'id' | 'createdAt' | 'timezone'>>
): DiaryEntry | null {
  const entry = getEntry(id);
  if (!entry) return null;
  const updated: DiaryEntry = { ...entry, ...data, updatedAt: new Date().toISOString() };
  saveEntry(updated);
  return updated;
}

export function formatEntryDate(isoString: string, timezone: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatEntryDateShort(isoString: string, timezone: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

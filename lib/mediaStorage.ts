import { MediaItem, MediaLog, MediaStatus } from './mediaTypes';

const MEDIA_KEY = 'diary-media';
const LOGS_KEY = 'diary-media-logs';

// ── Media Items ──────────────────────────────────────────────

export function getMediaItems(): MediaItem[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(MEDIA_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MediaItem[];
  } catch {
    return [];
  }
}

export function getActiveMedia(): MediaItem[] {
  return getMediaItems().filter((m) => m.status === 'active');
}

export function getMediaItem(id: string): MediaItem | null {
  return getMediaItems().find((m) => m.id === id) ?? null;
}

function persistMedia(items: MediaItem[]): void {
  localStorage.setItem(MEDIA_KEY, JSON.stringify(items));
}

export function createMediaItem(
  data: Omit<MediaItem, 'id' | 'status'>
): MediaItem {
  const item: MediaItem = {
    ...data,
    id: crypto.randomUUID(),
    status: 'active',
  };
  const all = getMediaItems();
  all.unshift(item);
  persistMedia(all);
  return item;
}

export function updateMediaItem(
  id: string,
  data: Partial<Omit<MediaItem, 'id'>>
): MediaItem | null {
  const all = getMediaItems();
  const idx = all.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...data };
  persistMedia(all);
  return all[idx];
}

function setMediaStatus(id: string, status: MediaStatus): MediaItem | null {
  return updateMediaItem(id, {
    status,
    finished_at: new Date().toISOString(),
  });
}

export function finishMediaItem(id: string): MediaItem | null {
  return setMediaStatus(id, 'finished');
}

export function dropMediaItem(id: string): MediaItem | null {
  return setMediaStatus(id, 'dropped');
}

export function deleteMediaItem(id: string): void {
  persistMedia(getMediaItems().filter((m) => m.id !== id));
  // Also delete all logs for this media item
  persistLogs(getMediaLogs().filter((l) => l.media_id !== id));
}

// ── Media Logs ───────────────────────────────────────────────

export function getMediaLogs(): MediaLog[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(LOGS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MediaLog[];
  } catch {
    return [];
  }
}

function persistLogs(logs: MediaLog[]): void {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function createMediaLog(mediaId: string, entryId?: string): MediaLog {
  const log: MediaLog = {
    id: crypto.randomUUID(),
    media_id: mediaId,
    date: new Date().toISOString().slice(0, 10),
    entry_id: entryId,
  };
  const all = getMediaLogs();
  all.push(log);
  persistLogs(all);
  return log;
}

export function getLogsForEntry(entryId: string): MediaLog[] {
  return getMediaLogs().filter((l) => l.entry_id === entryId);
}

export function getLogsForMedia(mediaId: string): MediaLog[] {
  return getMediaLogs().filter((l) => l.media_id === mediaId);
}

export function deleteLogsForEntry(entryId: string): void {
  persistLogs(getMediaLogs().filter((l) => l.entry_id !== entryId));
}

// ── Helpers ──────────────────────────────────────────────────

export function formatDuration(startedAt: string, finishedAt?: string): string {
  const start = new Date(startedAt).getTime();
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  const diffMs = Math.max(0, end - start);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  const weeks = Math.floor(diffDays / 7);
  const remainDays = diffDays % 7;
  if (weeks < 4) {
    if (remainDays === 0) return weeks === 1 ? '1 week' : `${weeks} weeks`;
    return weeks === 1 ? `1 week, ${remainDays}d` : `${weeks} weeks, ${remainDays}d`;
  }
  const months = Math.floor(diffDays / 30);
  if (months < 12) return months === 1 ? '1 month' : `${months} months`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (remMonths === 0) return years === 1 ? '1 year' : `${years} years`;
  return `${years}y ${remMonths}mo`;
}

export function formatMediaDate(isoString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoString));
}

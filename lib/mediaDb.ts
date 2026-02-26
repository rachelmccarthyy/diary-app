import { createClient } from './supabase';
import type { MediaItem, MediaLog, MediaStatus } from './mediaTypes';

function supabase() { return createClient(); }

// ── Media Items ─────────────────────────────────────────────

export async function getMediaItems(userId: string): Promise<MediaItem[]> {
  const { data, error } = await supabase()
    .from('media')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToMedia);
}

export async function getActiveMedia(userId: string): Promise<MediaItem[]> {
  const { data, error } = await supabase()
    .from('media')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToMedia);
}

export async function getMediaItem(id: string): Promise<MediaItem | null> {
  const { data, error } = await supabase()
    .from('media')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return rowToMedia(data);
}

export async function createMediaItem(
  userId: string,
  data: Omit<MediaItem, 'id' | 'status'>
): Promise<MediaItem> {
  const { data: row, error } = await supabase()
    .from('media')
    .insert({
      user_id: userId,
      title: data.title,
      type: data.type,
      author_or_creator: data.author_or_creator ?? null,
      cover_image_url: data.cover_image_url ?? null,
      started_at: data.started_at,
      finished_at: data.finished_at ?? null,
      status: 'active',
      notes: data.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToMedia(row);
}

export async function updateMediaItem(
  id: string,
  data: Partial<Omit<MediaItem, 'id'>>
): Promise<MediaItem> {
  const { data: row, error } = await supabase()
    .from('media')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToMedia(row);
}

async function setMediaStatus(id: string, status: MediaStatus): Promise<MediaItem> {
  return updateMediaItem(id, {
    status,
    finished_at: new Date().toISOString(),
  });
}

export async function finishMediaItem(id: string): Promise<MediaItem> {
  return setMediaStatus(id, 'finished');
}

export async function dropMediaItem(id: string): Promise<MediaItem> {
  return setMediaStatus(id, 'dropped');
}

export async function deleteMediaItem(id: string): Promise<void> {
  // Logs cascade delete via FK, but also clean up explicitly
  await supabase().from('media_logs').delete().eq('media_id', id);
  const { error } = await supabase().from('media').delete().eq('id', id);
  if (error) throw error;
}

// ── Media Logs ──────────────────────────────────────────────

export async function createMediaLog(
  userId: string,
  mediaId: string,
  entryId?: string
): Promise<MediaLog> {
  const { data, error } = await supabase()
    .from('media_logs')
    .insert({
      user_id: userId,
      media_id: mediaId,
      entry_id: entryId ?? null,
      date: new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (error) throw error;
  return { id: data.id, media_id: data.media_id, date: data.date, entry_id: data.entry_id };
}

export async function getLogsForEntry(entryId: string): Promise<MediaLog[]> {
  const { data, error } = await supabase()
    .from('media_logs')
    .select('*')
    .eq('entry_id', entryId);

  if (error) throw error;
  return (data ?? []).map((r: Record<string, string>) => ({
    id: r.id,
    media_id: r.media_id,
    date: r.date,
    entry_id: r.entry_id,
  }));
}

export async function deleteLogsForEntry(entryId: string): Promise<void> {
  const { error } = await supabase()
    .from('media_logs')
    .delete()
    .eq('entry_id', entryId);

  if (error) throw error;
}

// ── Helpers ─────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMedia(row: any): MediaItem {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    author_or_creator: row.author_or_creator ?? undefined,
    cover_image_url: row.cover_image_url ?? undefined,
    started_at: row.started_at,
    finished_at: row.finished_at ?? undefined,
    status: row.status,
    notes: row.notes ?? undefined,
  };
}

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

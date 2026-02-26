import { createClient } from './supabase';
import type { DiaryEntry } from './types';
import type { MediaItem, MediaLog } from './mediaTypes';

const MIGRATION_KEY = 'diary-migration-complete';
const ENTRIES_KEY = 'diary-entries';
const MEDIA_KEY = 'diary-media';
const LOGS_KEY = 'diary-media-logs';

export function needsMigration(): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem(MIGRATION_KEY)) return false;
  const hasEntries = !!localStorage.getItem(ENTRIES_KEY);
  const hasMedia = !!localStorage.getItem(MEDIA_KEY);
  return hasEntries || hasMedia;
}

export async function migrateToSupabase(userId: string): Promise<{ entries: number; media: number }> {
  const supabase = createClient();
  let entriesMigrated = 0;
  let mediaMigrated = 0;

  // Migrate entries
  const rawEntries = localStorage.getItem(ENTRIES_KEY);
  if (rawEntries) {
    try {
      const entries = JSON.parse(rawEntries) as DiaryEntry[];
      if (entries.length > 0) {
        const rows = entries.map((e) => ({
          id: e.id,
          user_id: userId,
          title: e.title,
          content: e.body,
          mood: e.mood,
          tags: e.tags ?? [],
          images: e.images ?? [],
          spotify_url: e.spotifyUrl ?? null,
          spotify_title: e.spotifyTitle ?? null,
          timezone: e.timezone,
          is_time_capsule: false,
          reveal_at: null,
          is_revealed: false,
          created_at: e.createdAt,
          updated_at: e.updatedAt,
        }));

        const { error } = await supabase.from('entries').upsert(rows, { onConflict: 'id' });
        if (error) throw error;
        entriesMigrated = rows.length;
      }
    } catch (err) {
      console.error('Failed to migrate entries:', err);
    }
  }

  // Migrate media items
  const rawMedia = localStorage.getItem(MEDIA_KEY);
  if (rawMedia) {
    try {
      const media = JSON.parse(rawMedia) as MediaItem[];
      if (media.length > 0) {
        const rows = media.map((m) => ({
          id: m.id,
          user_id: userId,
          title: m.title,
          type: m.type,
          author_or_creator: m.author_or_creator ?? null,
          cover_image_url: m.cover_image_url ?? null,
          started_at: m.started_at,
          finished_at: m.finished_at ?? null,
          status: m.status,
          notes: m.notes ?? null,
        }));

        const { error } = await supabase.from('media').upsert(rows, { onConflict: 'id' });
        if (error) throw error;
        mediaMigrated = rows.length;
      }
    } catch (err) {
      console.error('Failed to migrate media:', err);
    }
  }

  // Migrate media logs
  const rawLogs = localStorage.getItem(LOGS_KEY);
  if (rawLogs) {
    try {
      const logs = JSON.parse(rawLogs) as MediaLog[];
      if (logs.length > 0) {
        const rows = logs.map((l) => ({
          id: l.id,
          user_id: userId,
          media_id: l.media_id,
          entry_id: l.entry_id ?? null,
          date: l.date,
        }));

        const { error } = await supabase.from('media_logs').upsert(rows, { onConflict: 'id' });
        if (error) throw error;
      }
    } catch (err) {
      console.error('Failed to migrate media logs:', err);
    }
  }

  // Mark migration complete and clear localStorage
  localStorage.setItem(MIGRATION_KEY, 'true');
  localStorage.removeItem(ENTRIES_KEY);
  localStorage.removeItem(MEDIA_KEY);
  localStorage.removeItem(LOGS_KEY);

  return { entries: entriesMigrated, media: mediaMigrated };
}

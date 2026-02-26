import { createClient } from './supabase';
import type { DiaryEntry } from './types';

function supabase() { return createClient(); }

// ── Map DB row → DiaryEntry ──────────────────────────────────
interface EntryRow {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  mood: string | null;
  tags: string[];
  images: string[];
  spotify_url: string | null;
  spotify_title: string | null;
  timezone: string | null;
  is_time_capsule: boolean;
  reveal_at: string | null;
  is_revealed: boolean;
  created_at: string;
  updated_at: string;
}

function rowToEntry(row: EntryRow): DiaryEntry & {
  isTimeCapsule: boolean;
  revealAt: string | null;
  isRevealed: boolean;
} {
  return {
    id: row.id,
    title: row.title ?? '',
    body: row.content,
    mood: row.mood ?? '',
    tags: row.tags ?? [],
    images: row.images ?? [],
    spotifyUrl: row.spotify_url ?? undefined,
    spotifyTitle: row.spotify_title ?? undefined,
    timezone: row.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isTimeCapsule: row.is_time_capsule,
    revealAt: row.reveal_at,
    isRevealed: row.is_revealed,
  };
}

// ── Entries CRUD ─────────────────────────────────────────────

export async function getEntries(userId: string) {
  const { data, error } = await supabase()
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as EntryRow[]).map(rowToEntry);
}

export async function getEntry(id: string) {
  const { data, error } = await supabase()
    .from('entries')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return rowToEntry(data as EntryRow);
}

export async function createEntry(
  userId: string,
  data: {
    title: string;
    body: string;
    mood: string;
    tags: string[];
    images: string[];
    spotifyUrl?: string;
    spotifyTitle?: string;
    isTimeCapsule?: boolean;
    revealAt?: string;
  }
) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date().toISOString();
  const { data: row, error } = await supabase()
    .from('entries')
    .insert({
      user_id: userId,
      title: data.title,
      content: data.body,
      mood: data.mood,
      tags: data.tags,
      images: data.images,
      spotify_url: data.spotifyUrl ?? null,
      spotify_title: data.spotifyTitle ?? null,
      timezone,
      is_time_capsule: data.isTimeCapsule ?? false,
      reveal_at: data.revealAt ?? null,
      is_revealed: false,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToEntry(row as EntryRow);
}

export async function updateEntry(
  id: string,
  data: {
    title?: string;
    body?: string;
    mood?: string;
    tags?: string[];
    images?: string[];
    spotifyUrl?: string;
    spotifyTitle?: string;
    isTimeCapsule?: boolean;
    revealAt?: string | null;
    isRevealed?: boolean;
  }
) {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.title !== undefined) updates.title = data.title;
  if (data.body !== undefined) updates.content = data.body;
  if (data.mood !== undefined) updates.mood = data.mood;
  if (data.tags !== undefined) updates.tags = data.tags;
  if (data.images !== undefined) updates.images = data.images;
  if (data.spotifyUrl !== undefined) updates.spotify_url = data.spotifyUrl;
  if (data.spotifyTitle !== undefined) updates.spotify_title = data.spotifyTitle;
  if (data.isTimeCapsule !== undefined) updates.is_time_capsule = data.isTimeCapsule;
  if (data.revealAt !== undefined) updates.reveal_at = data.revealAt;
  if (data.isRevealed !== undefined) updates.is_revealed = data.isRevealed;

  const { data: row, error } = await supabase()
    .from('entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToEntry(row as EntryRow);
}

export async function deleteEntry(id: string) {
  const { error } = await supabase()
    .from('entries')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ── "On This Day" query ────────────────────────────────────

export async function getOnThisDayEntries(userId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const year = now.getFullYear();

  // Fetch all entries for this user, filter client-side for month/day match from previous years
  const { data, error } = await supabase()
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data as EntryRow[])
    .filter((row) => {
      const d = new Date(row.created_at);
      return d.getMonth() + 1 === month && d.getDate() === day && d.getFullYear() < year;
    })
    .map(rowToEntry);
}

// ── Image upload to Supabase Storage ────────────────────────

export async function uploadImage(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase().storage
    .from('diary-images')
    .upload(path, file, { contentType: file.type });

  if (error) throw error;

  const { data } = supabase().storage
    .from('diary-images')
    .getPublicUrl(path);

  return data.publicUrl;
}

// ── Profile ─────────────────────────────────────────────────

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_location: string | null;
  birth_lat: number | null;
  birth_lng: number | null;
  birth_timezone: string | null;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  data: Partial<Omit<Profile, 'id'>>
) {
  const { data: row, error } = await supabase()
    .from('profiles')
    .update(data)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return row as Profile;
}

// ── Keep format helpers from original storage.ts ────────────

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

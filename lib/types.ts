export interface DiaryEntry {
  id: string;
  title: string;
  body: string;
  mood: string;
  tags: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  timezone: string;
  images: string[]; // base64 data URLs or Supabase Storage URLs
  spotifyUrl?: string; // Spotify embed URL
  spotifyTitle?: string; // e.g. "Song Name by Artist"
  isTimeCapsule: boolean;
  revealAt: string | null; // ISO string, when time capsule unlocks
  isRevealed: boolean;
}

export const MOODS = [
  { emoji: 'happy', label: 'Happy' },
  { emoji: 'calm', label: 'Calm' },
  { emoji: 'excited', label: 'Excited' },
  { emoji: 'thoughtful', label: 'Thoughtful' },
  { emoji: 'sad', label: 'Sad' },
  { emoji: 'frustrated', label: 'Frustrated' },
  { emoji: 'anxious', label: 'Anxious' },
  { emoji: 'tired', label: 'Tired' },
] as const;

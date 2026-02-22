export interface DiaryEntry {
  id: string;
  title: string;
  body: string;
  mood: string;
  tags: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  timezone: string;
  images: string[]; // base64 compressed data URLs
  spotifyUrl?: string; // Spotify embed URL
  spotifyTitle?: string; // e.g. "Song Name by Artist"
}

export const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '🎉', label: 'Excited' },
  { emoji: '🤔', label: 'Thoughtful' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😴', label: 'Tired' },
] as const;

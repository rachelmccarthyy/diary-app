export type MediaType = 'book' | 'show' | 'movie' | 'podcast';
export type MediaStatus = 'active' | 'finished' | 'dropped';

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  author_or_creator?: string;
  cover_image_url?: string;
  started_at: string; // ISO string
  finished_at?: string; // ISO string
  status: MediaStatus;
  notes?: string;
}

export interface MediaLog {
  id: string;
  media_id: string;
  date: string; // YYYY-MM-DD
  entry_id?: string;
}

export const MEDIA_TYPE_CONFIG: Record<MediaType, { emoji: string; label: string; color: string; bg: string }> = {
  book: {
    emoji: 'Bk',
    label: 'Book',
    color: 'var(--th-text)',
    bg: 'var(--th-toolbar)',
  },
  show: {
    emoji: 'Tv',
    label: 'Show',
    color: 'var(--th-text)',
    bg: 'var(--th-toolbar)',
  },
  movie: {
    emoji: 'Fm',
    label: 'Movie',
    color: 'var(--th-text)',
    bg: 'var(--th-toolbar)',
  },
  podcast: {
    emoji: 'Pd',
    label: 'Podcast',
    color: 'var(--th-text)',
    bg: 'var(--th-toolbar)',
  },
};

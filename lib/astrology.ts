import SunCalc from 'suncalc';

// ── Zodiac signs ────────────────────────────────────────────

export const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', start: [3, 21], end: [4, 19], element: 'Fire' },
  { name: 'Taurus', symbol: '♉', start: [4, 20], end: [5, 20], element: 'Earth' },
  { name: 'Gemini', symbol: '♊', start: [5, 21], end: [6, 20], element: 'Air' },
  { name: 'Cancer', symbol: '♋', start: [6, 21], end: [7, 22], element: 'Water' },
  { name: 'Leo', symbol: '♌', start: [7, 23], end: [8, 22], element: 'Fire' },
  { name: 'Virgo', symbol: '♍', start: [8, 23], end: [9, 22], element: 'Earth' },
  { name: 'Libra', symbol: '♎', start: [9, 23], end: [10, 22], element: 'Air' },
  { name: 'Scorpio', symbol: '♏', start: [10, 23], end: [11, 21], element: 'Water' },
  { name: 'Sagittarius', symbol: '♐', start: [11, 22], end: [12, 21], element: 'Fire' },
  { name: 'Capricorn', symbol: '♑', start: [12, 22], end: [1, 19], element: 'Earth' },
  { name: 'Aquarius', symbol: '♒', start: [1, 20], end: [2, 18], element: 'Air' },
  { name: 'Pisces', symbol: '♓', start: [2, 19], end: [3, 20], element: 'Water' },
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number]['name'];

export function getSunSign(birthDate: string): ZodiacSign | null {
  if (!birthDate) return null;
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const sign of ZODIAC_SIGNS) {
    const [sm, sd] = sign.start;
    const [em, ed] = sign.end;

    if (sign.name === 'Capricorn') {
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return sign.name;
    } else {
      if ((month === sm && day >= sd) || (month === em && day <= ed)) return sign.name;
    }
  }
  return null;
}

export function getSignInfo(name: ZodiacSign) {
  return ZODIAC_SIGNS.find((s) => s.name === name) ?? null;
}

// ── Moon phase ──────────────────────────────────────────────

export type MoonPhaseName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

export interface MoonPhaseInfo {
  name: MoonPhaseName;
  emoji: string;
  fraction: number;
  phase: number;
}

export function getCurrentMoonPhase(): MoonPhaseInfo {
  const now = new Date();
  const illumination = SunCalc.getMoonIllumination(now);
  const phase = illumination.phase; // 0-1

  let name: MoonPhaseName;
  let emoji: string;

  if (phase < 0.03 || phase >= 0.97) {
    name = 'New Moon';
    emoji = '●';
  } else if (phase < 0.22) {
    name = 'Waxing Crescent';
    emoji = '◑';
  } else if (phase < 0.28) {
    name = 'First Quarter';
    emoji = '◑';
  } else if (phase < 0.47) {
    name = 'Waxing Gibbous';
    emoji = '◕';
  } else if (phase < 0.53) {
    name = 'Full Moon';
    emoji = '○';
  } else if (phase < 0.72) {
    name = 'Waning Gibbous';
    emoji = '◔';
  } else if (phase < 0.78) {
    name = 'Last Quarter';
    emoji = '◐';
  } else {
    name = 'Waning Crescent';
    emoji = '◐';
  }

  return {
    name,
    emoji,
    fraction: illumination.fraction,
    phase,
  };
}

// ── Mercury retrograde periods (approximate for 2025-2026) ──

const MERCURY_RETROGRADE_PERIODS = [
  // 2025
  { start: '2025-03-14', end: '2025-04-07' },
  { start: '2025-07-18', end: '2025-08-11' },
  { start: '2025-11-09', end: '2025-11-29' },
  // 2026
  { start: '2026-02-25', end: '2026-03-20' },
  { start: '2026-06-29', end: '2026-07-23' },
  { start: '2026-10-24', end: '2026-11-13' },
];

export function isMercuryRetrograde(): boolean {
  const now = new Date().toISOString().slice(0, 10);
  return MERCURY_RETROGRADE_PERIODS.some(
    (p) => now >= p.start && now <= p.end
  );
}

// ── Journaling prompts ──────────────────────────────────────

const MOON_PROMPTS: Record<MoonPhaseName, string[]> = {
  'New Moon': [
    'What intentions are you setting for this new cycle?',
    'What do you want to plant and grow in your life right now?',
    'What feels like a fresh start today?',
  ],
  'Waxing Crescent': [
    'What small steps can you take toward your intentions today?',
    'What is beginning to emerge in your life?',
    'Where do you feel momentum building?',
  ],
  'First Quarter': [
    'What challenges are you facing, and how can you overcome them?',
    'What decisions do you need to make right now?',
    'Where do you need to take bold action?',
  ],
  'Waxing Gibbous': [
    'What adjustments do you need to make before things come to fruition?',
    'What are you learning about yourself this week?',
    'How can you refine your approach?',
  ],
  'Full Moon': [
    'What has come to completion or fullness in your life?',
    'What are you grateful for right now?',
    'What emotions are rising to the surface?',
  ],
  'Waning Gibbous': [
    'What wisdom have you gained recently?',
    'How can you share what you have learned with others?',
    'What are you ready to give back?',
  ],
  'Last Quarter': [
    'What are you ready to release or let go of?',
    'What no longer serves you?',
    'How can you forgive — yourself or someone else?',
  ],
  'Waning Crescent': [
    'What do you need to rest and recover from?',
    'How can you practice surrender today?',
    'What dreams or intuitions are speaking to you?',
  ],
};

const RETROGRADE_PROMPTS = [
  'Communication may feel off — journal about any miscommunications today.',
  'Mercury retrograde is a great time to revisit old projects. What deserves another look?',
  'Have you been putting off a difficult conversation? Write it out here first.',
  'What from your past is resurfacing? What can you learn from it?',
];

const SIGN_THEMES: Partial<Record<ZodiacSign, string[]>> = {
  Aries: ['What fires you up? What gives you courage?'],
  Taurus: ['What brings you comfort and stability today?'],
  Gemini: ['What are you curious about? What conversations energized you?'],
  Cancer: ['How are you nurturing yourself and others?'],
  Leo: ['What makes you feel confident and alive?'],
  Virgo: ['What small details are you paying attention to?'],
  Libra: ['How are your relationships? Where do you need more balance?'],
  Scorpio: ['What deep truths are you uncovering?'],
  Sagittarius: ['What adventure or new knowledge excites you?'],
  Capricorn: ['What are you building? What goals are you working toward?'],
  Aquarius: ['How are you contributing to something bigger than yourself?'],
  Pisces: ['What dreams or creative visions are calling to you?'],
};

export function getJournalingPrompt(sunSign?: ZodiacSign | null): {
  prompt: string;
  source: string;
} {
  const moon = getCurrentMoonPhase();
  const retrograde = isMercuryRetrograde();

  // Prioritize Mercury retrograde
  if (retrograde) {
    const prompt = RETROGRADE_PROMPTS[Math.floor(Math.random() * RETROGRADE_PROMPTS.length)];
    return { prompt, source: 'Mercury Retrograde' };
  }

  // Moon phase prompt
  const moonPrompts = MOON_PROMPTS[moon.name];
  const moonPrompt = moonPrompts[Math.floor(Math.random() * moonPrompts.length)];

  // If user has a sun sign, sometimes use sign theme instead
  if (sunSign && SIGN_THEMES[sunSign] && Math.random() > 0.6) {
    const signPrompts = SIGN_THEMES[sunSign]!;
    return {
      prompt: signPrompts[Math.floor(Math.random() * signPrompts.length)],
      source: `${sunSign} season`,
    };
  }

  return { prompt: moonPrompt, source: `${moon.emoji} ${moon.name}` };
}

// ── Daily horoscope (simple, based on sign) ─────────────────

const HOROSCOPE_THEMES: Record<string, string[]> = {
  Fire: [
    'Your energy is high today — channel it into something creative.',
    'Take the lead on something that matters to you.',
    'Your enthusiasm is contagious. Share it with someone.',
    'A bold move could pay off today. Trust your instincts.',
  ],
  Earth: [
    'Focus on the practical today — small steps lead to big results.',
    'Ground yourself in nature or routine.',
    'Financial matters may need your attention.',
    'Build something lasting with your steady energy.',
  ],
  Air: [
    'Communication flows easily today — say what you mean.',
    'A new idea could spark an exciting conversation.',
    'Connect with someone who stimulates your mind.',
    'Your objectivity is your superpower today.',
  ],
  Water: [
    'Trust your intuition today — it is guiding you well.',
    'Take time to process your emotions through writing.',
    'A deep connection with someone may surprise you.',
    'Your empathy helps someone who needs it today.',
  ],
};

export function getDailyHoroscope(sunSign: ZodiacSign): string {
  const info = getSignInfo(sunSign);
  if (!info) return '';
  const themes = HOROSCOPE_THEMES[info.element];
  // Use date as seed for consistent daily result
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const idx = seed % themes.length;
  return themes[idx];
}

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
    'Your passion lights the way forward. Don\'t hold back.',
    'An unexpected challenge fuels your drive. Rise to meet it.',
    'Your confidence draws opportunities to you today.',
    'Let your natural spark ignite a new project or idea.',
    'Today rewards courage — step outside your comfort zone.',
    'Your warmth opens doors. Be generous with your energy.',
    'A competitive edge serves you well today. Play to win.',
    'Your spontaneity leads to something wonderful.',
  ],
  Earth: [
    'Focus on the practical today — small steps lead to big results.',
    'Ground yourself in nature or routine.',
    'Financial matters may need your attention.',
    'Build something lasting with your steady energy.',
    'Patience is your superpower today. Trust the process.',
    'Something you\'ve been cultivating is about to bear fruit.',
    'Your reliability makes you someone others lean on. Accept that role.',
    'A sensory experience — food, nature, art — nourishes your soul today.',
    'Today favors long-term planning over quick fixes.',
    'Your practical wisdom helps someone who is overthinking.',
    'Material comfort is not shallow — honor what makes you feel secure.',
    'Slow down. The answer reveals itself when you stop rushing.',
  ],
  Air: [
    'Communication flows easily today — say what you mean.',
    'A new idea could spark an exciting conversation.',
    'Connect with someone who stimulates your mind.',
    'Your objectivity is your superpower today.',
    'Words have power today. Choose them carefully and speak your truth.',
    'An intellectual breakthrough awaits — follow your curiosity.',
    'Social connections bring unexpected gifts.',
    'A change of perspective transforms how you see a problem.',
    'Write down the ideas flowing through you — they\'re worth keeping.',
    'Your adaptability is a gift. Embrace change rather than resisting it.',
    'Today favors learning. Pick up that book or start that course.',
    'A lively debate or exchange of ideas energizes you.',
  ],
  Water: [
    'Trust your intuition today — it is guiding you well.',
    'Take time to process your emotions through writing.',
    'A deep connection with someone may surprise you.',
    'Your empathy helps someone who needs it today.',
    'Feelings you\'ve been avoiding deserve acknowledgment. Sit with them.',
    'Your creative imagination is especially vivid. Use it.',
    'A dream or daydream holds a message for you.',
    'Emotional honesty transforms a relationship today.',
    'Nurture yourself first — you can\'t pour from an empty cup.',
    'Something beneath the surface is ready to be healed.',
    'Your sensitivity is a strength, not a weakness. Honor it.',
    'A moment of quiet reflection reveals exactly what you need.',
  ],
};

const SIGN_HOROSCOPES: Record<ZodiacSign, string[]> = {
  Aries: [
    'Your pioneering spirit opens new paths. Others follow your lead.',
    'Impatience may surface — channel that restless energy into action.',
    'A personal victory is close. Stay focused on your goal.',
  ],
  Taurus: [
    'Something beautiful catches your attention today. Savor it.',
    'Your steadfastness is noticed and appreciated by those around you.',
    'Indulge in something that makes your senses come alive.',
  ],
  Gemini: [
    'Your mind is buzzing with connections. Share one insight that excites you.',
    'A conversation today could change the way you think about something.',
    'Variety is your spice — try something new, even something small.',
  ],
  Cancer: [
    'Home and family bring comfort today. Lean into what feels safe.',
    'Your nurturing instincts are strong — remember to include yourself.',
    'An old memory surfaces with a new lesson embedded in it.',
  ],
  Leo: [
    'The spotlight finds you naturally today. Enjoy it without apology.',
    'Your generosity of spirit inspires someone to be braver.',
    'Creative self-expression is your medicine today.',
  ],
  Virgo: [
    'The small details you notice today lead to a meaningful improvement.',
    'Your desire to help is powerful — direct it where it matters most.',
    'Order from chaos: organizing your space clears your mind.',
  ],
  Libra: [
    'Balance comes from knowing when to give and when to receive.',
    'A relationship dynamic shifts in your favor today.',
    'Beauty in your environment lifts your mood. Create some.',
  ],
  Scorpio: [
    'Intensity drives transformation today. Let it.',
    'Something hidden comes to light — and it\'s exactly what you needed to see.',
    'Your emotional depth gives you insight others miss.',
  ],
  Sagittarius: [
    'Adventure calls in unexpected forms today. Say yes.',
    'Your philosophical side has the answer to a practical question.',
    'Expand your horizons — literally or metaphorically.',
  ],
  Capricorn: [
    'Your discipline pays dividends today. Keep building.',
    'An authority figure or mentor offers something valuable.',
    'Long-term thinking gives you an edge over everyone else.',
  ],
  Aquarius: [
    'An unconventional idea you have is more brilliant than you realize.',
    'Community and friendship bring meaning today.',
    'Your vision for the future becomes clearer.',
  ],
  Pisces: [
    'Trust the feelings that don\'t have words yet.',
    'Your creative well is deep today — draw from it freely.',
    'Compassion flows naturally from you. It heals more than you know.',
  ],
};

const MOON_HOROSCOPES: Record<MoonPhaseName, string[]> = {
  'New Moon': [
    'New beginnings are seeded in darkness. Set an intention today.',
    'A clean slate presents itself. What will you write on it?',
  ],
  'Waxing Crescent': [
    'Momentum is building. Keep watering what you planted.',
    'Small efforts compound. Your consistency matters.',
  ],
  'First Quarter': [
    'A decision point arrives. Choose action over hesitation.',
    'Challenges today are invitations to grow stronger.',
  ],
  'Waxing Gibbous': [
    'Refine your approach. Almost there — the details matter now.',
    'Trust the work you\'ve already done. Adjust, don\'t abandon.',
  ],
  'Full Moon': [
    'Emotions peak under the full moon. Let yourself feel it all.',
    'Something reaches completion. Celebrate what you\'ve accomplished.',
  ],
  'Waning Gibbous': [
    'Share what you\'ve learned. Your experience benefits others.',
    'Gratitude shifts your perspective. Name three things.',
  ],
  'Last Quarter': [
    'Release what no longer serves you. Space is opening up.',
    'Forgiveness — of yourself or others — frees up energy.',
  ],
  'Waning Crescent': [
    'Rest is productive. Give yourself permission to slow down.',
    'Reflect on the cycle that\'s ending. What did it teach you?',
  ],
};

/** Simple hash for consistent daily selection */
function dailySeed(extra: number = 0): number {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate() + extra;
}

export function getDailyHoroscope(sunSign: ZodiacSign): {
  element: string;
  sign: string;
  moon: string;
  retrograde?: string;
} {
  const info = getSignInfo(sunSign);
  if (!info) return { element: '', sign: '', moon: '' };

  const elementThemes = HOROSCOPE_THEMES[info.element];
  const signThemes = SIGN_HOROSCOPES[sunSign];
  const moonPhase = getCurrentMoonPhase();
  const moonThemes = MOON_HOROSCOPES[moonPhase.name];

  const elementMsg = elementThemes[dailySeed() % elementThemes.length];
  const signMsg = signThemes[dailySeed(7) % signThemes.length];
  const moonMsg = moonThemes[dailySeed(13) % moonThemes.length];

  const result: { element: string; sign: string; moon: string; retrograde?: string } = {
    element: elementMsg,
    sign: signMsg,
    moon: moonMsg,
  };

  if (isMercuryRetrograde()) {
    result.retrograde = RETROGRADE_PROMPTS[dailySeed(19) % RETROGRADE_PROMPTS.length];
  }

  return result;
}

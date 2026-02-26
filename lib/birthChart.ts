import * as Astronomy from 'astronomy-engine';
import { getSunSign } from './astrology';
import type { ZodiacSign } from './astrology';

export interface PlanetPosition {
  name: string;
  symbol: string;
  sign: ZodiacSign;
  degree: number; // 0-360 ecliptic longitude
}

export interface ChartData {
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  risingSign: ZodiacSign | null;
  planets: PlanetPosition[];
}

// Ecliptic longitude 0° = Aries 0°, 30° = Taurus 0°, etc.
const SIGN_ORDER: ZodiacSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function lonToSign(lon: number): ZodiacSign {
  const normalized = ((lon % 360) + 360) % 360;
  return SIGN_ORDER[Math.floor(normalized / 30) % 12];
}

function deg2rad(d: number): number { return d * Math.PI / 180; }
function rad2deg(r: number): number { return r * 180 / Math.PI; }

// Geocentric ecliptic longitude using astronomy-engine
function getGeoLon(body: Astronomy.Body, date: Date): number {
  if (body === Astronomy.Body.Sun) {
    return Astronomy.SunPosition(date).elon;
  }
  if (body === Astronomy.Body.Moon) {
    return Astronomy.EclipticGeoMoon(date).lon;
  }
  const geo = Astronomy.GeoVector(body, date, true);
  return Astronomy.Ecliptic(geo).elon;
}

// Ascendant: ecliptic degree rising on the eastern horizon
function getAscendant(date: Date, latitude: number, longitude: number): number {
  const gast = Astronomy.SiderealTime(date); // hours
  const lst = ((gast + longitude / 15) % 24 + 24) % 24; // local sidereal time
  const ramc = lst * 15; // degrees

  const obliquity = Astronomy.e_tilt(new Astronomy.AstroTime(date)).tobl;
  const ramcRad = deg2rad(ramc);
  const oblRad = deg2rad(obliquity);
  const latRad = deg2rad(latitude);

  const denom = Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(ramcRad);
  const asc = rad2deg(Math.atan2(Math.cos(ramcRad), -denom));
  return ((asc % 360) + 360) % 360;
}

const PLANET_LIST: { name: string; symbol: string; body: Astronomy.Body }[] = [
  { name: 'Sun', symbol: '☉', body: Astronomy.Body.Sun },
  { name: 'Moon', symbol: '☽', body: Astronomy.Body.Moon },
  { name: 'Mercury', symbol: '☿', body: Astronomy.Body.Mercury },
  { name: 'Venus', symbol: '♀', body: Astronomy.Body.Venus },
  { name: 'Mars', symbol: '♂', body: Astronomy.Body.Mars },
  { name: 'Jupiter', symbol: '♃', body: Astronomy.Body.Jupiter },
  { name: 'Saturn', symbol: '♄', body: Astronomy.Body.Saturn },
  { name: 'Uranus', symbol: '⛢', body: Astronomy.Body.Uranus },
  { name: 'Neptune', symbol: '♆', body: Astronomy.Body.Neptune },
  { name: 'Pluto', symbol: '⯓', body: Astronomy.Body.Pluto },
];

// Convert a local date/time in a given IANA timezone to a UTC Date
function parseDateInTimezone(dateStr: string, timeStr: string, timezone: string): Date {
  const timeParts = timeStr.split(':');
  const normalized = timeParts.length >= 3
    ? timeParts.slice(0, 3).join(':')
    : `${timeParts[0]}:${timeParts[1]}:00`;

  // Create a UTC date with the same wall-clock numbers
  const utcGuess = new Date(`${dateStr}T${normalized}Z`);

  // Find what that UTC instant looks like in the target timezone
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  const parts: Record<string, string> = {};
  fmt.formatToParts(utcGuess).forEach(p => { if (p.type !== 'literal') parts[p.type] = p.value; });

  // Reconstruct that local time as if it were UTC
  const h = parts.hour === '24' ? '00' : parts.hour;
  const localAsUtc = new Date(`${parts.year}-${parts.month}-${parts.day}T${h}:${parts.minute}:${parts.second}Z`);

  // The offset between UTC and the timezone
  const offsetMs = utcGuess.getTime() - localAsUtc.getTime();

  // Apply offset to get the true UTC time for the given local time
  return new Date(utcGuess.getTime() + offsetMs);
}

export function calculateChart(
  birthDate: string,
  birthTime: string | null,
  birthLat?: number | null,
  birthLng?: number | null,
  birthTimezone?: string | null,
): ChartData | null {
  if (!birthDate) return null;

  const sunSign = getSunSign(birthDate);
  if (!sunSign) return null;

  let date: Date;
  if (birthTime && birthTimezone) {
    // Use the birth location's timezone for accurate UTC conversion
    date = parseDateInTimezone(birthDate, birthTime, birthTimezone);
  } else if (birthTime) {
    // Fallback: parse as browser local time
    const timeParts = birthTime.split(':');
    const normalizedTime = timeParts.length >= 3
      ? timeParts.slice(0, 3).join(':')
      : `${timeParts[0]}:${timeParts[1]}:00`;
    date = new Date(`${birthDate}T${normalizedTime}`);
  } else {
    date = new Date(`${birthDate}T12:00:00Z`);
  }

  // Planet positions
  const planets: PlanetPosition[] = PLANET_LIST.map(({ name, symbol, body }) => {
    const lon = getGeoLon(body, date);
    return { name, symbol, sign: lonToSign(lon), degree: lon };
  });

  const moonSign = lonToSign(getGeoLon(Astronomy.Body.Moon, date));

  // Rising sign requires birth time + geographic coordinates
  let risingSign: ZodiacSign | null = null;
  if (birthTime && birthLat != null && birthLng != null) {
    const ascLon = getAscendant(date, birthLat, birthLng);
    risingSign = lonToSign(ascLon);
    planets.push({ name: 'Ascendant', symbol: 'AC', sign: risingSign, degree: ascLon });
  }

  return { sunSign, moonSign, risingSign, planets };
}

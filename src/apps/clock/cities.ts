export interface CityDef { id: string; name: string; country: string; tz: string; lat: number; lon: number }

const c = (name: string, country: string, tz: string, lat: number, lon: number): CityDef => ({
  id: `${name}-${country}`.toLowerCase().replace(/[^a-z]+/g, '-'), name, country, tz, lat, lon,
});

export const CITIES: CityDef[] = [
  c('Seattle', 'USA', 'America/Los_Angeles', 47.6, -122.3),
  c('Los Angeles', 'USA', 'America/Los_Angeles', 34.05, -118.24),
  c('San Francisco', 'USA', 'America/Los_Angeles', 37.77, -122.42),
  c('Vancouver', 'Canada', 'America/Vancouver', 49.28, -123.12),
  c('Denver', 'USA', 'America/Denver', 39.74, -104.99),
  c('Phoenix', 'USA', 'America/Phoenix', 33.45, -112.07),
  c('Chicago', 'USA', 'America/Chicago', 41.88, -87.63),
  c('Mexico City', 'Mexico', 'America/Mexico_City', 19.43, -99.13),
  c('New York', 'USA', 'America/New_York', 40.71, -74.0),
  c('Toronto', 'Canada', 'America/Toronto', 43.65, -79.38),
  c('Miami', 'USA', 'America/New_York', 25.76, -80.19),
  c('Anchorage', 'USA', 'America/Anchorage', 61.22, -149.9),
  c('Honolulu', 'USA', 'Pacific/Honolulu', 21.31, -157.86),
  c('Bogotá', 'Colombia', 'America/Bogota', 4.71, -74.07),
  c('Lima', 'Peru', 'America/Lima', -12.05, -77.04),
  c('Santiago', 'Chile', 'America/Santiago', -33.45, -70.67),
  c('Buenos Aires', 'Argentina', 'America/Argentina/Buenos_Aires', -34.6, -58.38),
  c('São Paulo', 'Brazil', 'America/Sao_Paulo', -23.55, -46.63),
  c('Rio de Janeiro', 'Brazil', 'America/Sao_Paulo', -22.91, -43.17),
  c('Reykjavík', 'Iceland', 'Atlantic/Reykjavik', 64.15, -21.94),
  c('Dublin', 'Ireland', 'Europe/Dublin', 53.35, -6.26),
  c('London', 'United Kingdom', 'Europe/London', 51.51, -0.13),
  c('Lisbon', 'Portugal', 'Europe/Lisbon', 38.72, -9.14),
  c('Madrid', 'Spain', 'Europe/Madrid', 40.42, -3.7),
  c('Paris', 'France', 'Europe/Paris', 48.86, 2.35),
  c('Amsterdam', 'Netherlands', 'Europe/Amsterdam', 52.37, 4.9),
  c('Brussels', 'Belgium', 'Europe/Brussels', 50.85, 4.35),
  c('Berlin', 'Germany', 'Europe/Berlin', 52.52, 13.4),
  c('Zürich', 'Switzerland', 'Europe/Zurich', 47.38, 8.54),
  c('Rome', 'Italy', 'Europe/Rome', 41.9, 12.5),
  c('Stockholm', 'Sweden', 'Europe/Stockholm', 59.33, 18.07),
  c('Oslo', 'Norway', 'Europe/Oslo', 59.91, 10.75),
  c('Copenhagen', 'Denmark', 'Europe/Copenhagen', 55.68, 12.57),
  c('Warsaw', 'Poland', 'Europe/Warsaw', 52.23, 21.01),
  c('Prague', 'Czechia', 'Europe/Prague', 50.08, 14.44),
  c('Vienna', 'Austria', 'Europe/Vienna', 48.21, 16.37),
  c('Helsinki', 'Finland', 'Europe/Helsinki', 60.17, 24.94),
  c('Athens', 'Greece', 'Europe/Athens', 37.98, 23.73),
  c('Istanbul', 'Türkiye', 'Europe/Istanbul', 41.01, 28.98),
  c('Kyiv', 'Ukraine', 'Europe/Kyiv', 50.45, 30.52),
  c('Moscow', 'Russia', 'Europe/Moscow', 55.76, 37.62),
  c('Cairo', 'Egypt', 'Africa/Cairo', 30.04, 31.24),
  c('Lagos', 'Nigeria', 'Africa/Lagos', 6.52, 3.38),
  c('Nairobi', 'Kenya', 'Africa/Nairobi', -1.29, 36.82),
  c('Johannesburg', 'South Africa', 'Africa/Johannesburg', -26.2, 28.05),
  c('Cape Town', 'South Africa', 'Africa/Johannesburg', -33.92, 18.42),
  c('Casablanca', 'Morocco', 'Africa/Casablanca', 33.57, -7.59),
  c('Dubai', 'United Arab Emirates', 'Asia/Dubai', 25.2, 55.27),
  c('Riyadh', 'Saudi Arabia', 'Asia/Riyadh', 24.71, 46.68),
  c('Tehran', 'Iran', 'Asia/Tehran', 35.69, 51.39),
  c('Karachi', 'Pakistan', 'Asia/Karachi', 24.86, 67.0),
  c('Mumbai', 'India', 'Asia/Kolkata', 19.08, 72.88),
  c('New Delhi', 'India', 'Asia/Kolkata', 28.61, 77.21),
  c('Bengaluru', 'India', 'Asia/Kolkata', 12.97, 77.59),
  c('Kathmandu', 'Nepal', 'Asia/Kathmandu', 27.72, 85.32),
  c('Dhaka', 'Bangladesh', 'Asia/Dhaka', 23.81, 90.41),
  c('Bangkok', 'Thailand', 'Asia/Bangkok', 13.76, 100.5),
  c('Jakarta', 'Indonesia', 'Asia/Jakarta', -6.2, 106.85),
  c('Singapore', 'Singapore', 'Asia/Singapore', 1.35, 103.82),
  c('Kuala Lumpur', 'Malaysia', 'Asia/Kuala_Lumpur', 3.14, 101.69),
  c('Hong Kong', 'China', 'Asia/Hong_Kong', 22.32, 114.17),
  c('Beijing', 'China', 'Asia/Shanghai', 39.9, 116.4),
  c('Shanghai', 'China', 'Asia/Shanghai', 31.23, 121.47),
  c('Taipei', 'Taiwan', 'Asia/Taipei', 25.03, 121.57),
  c('Manila', 'Philippines', 'Asia/Manila', 14.6, 120.98),
  c('Seoul', 'South Korea', 'Asia/Seoul', 37.57, 126.98),
  c('Tokyo', 'Japan', 'Asia/Tokyo', 35.68, 139.69),
  c('Perth', 'Australia', 'Australia/Perth', -31.95, 115.86),
  c('Adelaide', 'Australia', 'Australia/Adelaide', -34.93, 138.6),
  c('Brisbane', 'Australia', 'Australia/Brisbane', -27.47, 153.03),
  c('Sydney', 'Australia', 'Australia/Sydney', -33.87, 151.21),
  c('Melbourne', 'Australia', 'Australia/Melbourne', -37.81, 144.96),
  c('Auckland', 'New Zealand', 'Pacific/Auckland', -36.85, 174.76),
];

/** Best-effort location for a time zone id (used for the "Local time" pin). */
export function cityForTz(tz: string): CityDef | undefined {
  return CITIES.find((x) => x.tz === tz);
}

/* ───────── Time-zone helpers (Intl based) ───────── */

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function partsFmt(tz: string) {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    fmtCache.set(tz, f);
  }
  return f;
}

/** Wall-clock fields of `date` in time zone `tz`. */
export function zoned(date: Date, tz: string) {
  try {
    const p = Object.fromEntries(partsFmt(tz).formatToParts(date).map((x) => [x.type, x.value]));
    return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute, s: +p.second };
  } catch {
    return { y: date.getFullYear(), mo: date.getMonth() + 1, d: date.getDate(), h: date.getHours(), mi: date.getMinutes(), s: date.getSeconds() };
  }
}

/** UTC offset of `tz` at `date`, in minutes. */
export function tzOffset(date: Date, tz: string): number {
  const z = zoned(date, tz);
  const asUtc = Date.UTC(z.y, z.mo - 1, z.d, z.h, z.mi, z.s);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

export function formatClock(h: number, m: number, hour24: boolean) {
  if (hour24) return { time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, ampm: '' };
  const hh = h % 12 === 0 ? 12 : h % 12;
  return { time: `${hh}:${String(m).padStart(2, '0')}`, ampm: h < 12 ? 'AM' : 'PM' };
}

/** "Today, 3 hours ahead" style description of `tz` relative to `localTz`. */
export function relativeDesc(date: Date, tz: string, localTz: string): string {
  const a = zoned(date, tz), b = zoned(date, localTz);
  const dayA = Date.UTC(a.y, a.mo - 1, a.d), dayB = Date.UTC(b.y, b.mo - 1, b.d);
  const dd = Math.round((dayA - dayB) / 86400000);
  const day = dd === 0 ? 'Today' : dd > 0 ? 'Tomorrow' : 'Yesterday';
  const diff = tzOffset(date, tz) - tzOffset(date, localTz);
  if (diff === 0) return `${day}, same time`;
  const abs = Math.abs(diff);
  const h = Math.floor(abs / 60), m = abs % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h} hour${h === 1 ? '' : 's'}`);
  if (m) parts.push(`${m} minutes`);
  return `${day}, ${parts.join(' ')} ${diff > 0 ? 'ahead' : 'behind'}`;
}

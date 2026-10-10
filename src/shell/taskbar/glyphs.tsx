/* Small original glyphs used in the taskbar. */
import { useId } from 'react';

export function TaskViewGlyph({ size = 24 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7dc4ff" />
          <stop offset="1" stopColor="#2a7de1" />
        </linearGradient>
      </defs>
      <rect x="3.5" y="4.5" width="12" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.3" opacity=".85" />
      <rect x="8.5" y="9.5" width="12" height="10" rx="2" fill={`url(#${id}f)`} stroke="currentColor" strokeOpacity=".35" strokeWidth=".8" />
    </svg>
  );
}

export function WeatherGlyph({ size = 24 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}s`} cx=".4" cy=".4" r=".6">
          <stop offset="0" stopColor="#ffe27a" />
          <stop offset="1" stopColor="#ffab2e" />
        </radialGradient>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d6e1ef" />
        </linearGradient>
      </defs>
      <circle cx="9.5" cy="9" r="5.5" fill={`url(#${id}s)`} />
      <path d="M7.8 20.5a4 4 0 0 1-.4-8 5.3 5.3 0 0 1 10.1-.6 4.3 4.3 0 1 1 .6 8.6z" fill={`url(#${id}c)`} stroke="#9fb1c7" strokeWidth=".4" />
    </svg>
  );
}

/** Battery glyph with a live fill level. */
export function BatteryGlyph({ level, charging, saver }: { level: number; charging?: boolean; saver?: boolean }) {
  const w = Math.max(1, Math.round(11 * level));
  return (
    <svg className="tb-glyph-sm" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1.5" y="4.5" width="12" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="14" y="6.5" width="1.2" height="3" rx=".5" fill="currentColor" />
      <rect x="2.5" y="5.5" width={Math.min(10, w)} height="5" rx=".6" fill={saver ? '#e5a400' : 'currentColor'} />
      {charging && <path d="M8.7 3.2 5.8 8.2h2.4l-1 4.6 3-5.2H7.8z" fill="currentColor" stroke="var(--acrylic-taskbar-solid)" strokeWidth=".6" />}
    </svg>
  );
}

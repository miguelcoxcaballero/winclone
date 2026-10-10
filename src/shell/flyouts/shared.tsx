/* Small helpers shared by the shell flyouts and session screens. */
import { useEffect, useRef, useState } from 'react';
import {
  Battery0Regular, Battery1Regular, Battery2Regular, Battery3Regular, Battery4Regular, Battery5Regular,
  Battery6Regular, Battery7Regular, Battery8Regular, Battery9Regular, BatteryChargeRegular, BatterySaverRegular,
  Wifi1Regular, Wifi2Regular, Wifi3Regular, Wifi4Regular, WifiOffRegular, AirplaneRegular,
} from '@fluentui/react-icons';

export interface BatteryInfo { level: number; charging: boolean }

/** Battery level from navigator.getBattery() (falls back to 86 %, not charging). */
export function useBattery(): BatteryInfo {
  const [b, setB] = useState<BatteryInfo>({ level: 0.86, charging: false });
  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<any> };
    if (!nav.getBattery) return;
    let bat: any;
    let alive = true;
    const upd = () => alive && bat && setB({ level: bat.level, charging: bat.charging });
    nav.getBattery().then((x) => {
      bat = x;
      // Headless / desktop browsers report a full, charging battery – keep the laptop-ish fallback then.
      if (x.level === 1 && x.charging) return;
      upd();
      x.addEventListener('levelchange', upd);
      x.addEventListener('chargingchange', upd);
    }).catch(() => undefined);
    return () => { alive = false; bat?.removeEventListener('levelchange', upd); bat?.removeEventListener('chargingchange', upd); };
  }, []);
  return b;
}

const BATT = [Battery0Regular, Battery1Regular, Battery2Regular, Battery3Regular, Battery4Regular, Battery5Regular, Battery6Regular, Battery7Regular, Battery8Regular, Battery9Regular];

export function BatteryIcon({ level, charging, saver, className }: { level: number; charging?: boolean; saver?: boolean; className?: string }) {
  if (charging) return <BatteryChargeRegular className={className} />;
  if (saver) return <BatterySaverRegular className={className} />;
  const I = BATT[Math.max(0, Math.min(9, Math.round(level * 10) - (level >= 0.95 ? 0 : 0)))] ?? Battery9Regular;
  return <I className={className} />;
}

/** Wi-Fi strength glyph (bars 1–4). */
export function WifiIcon({ bars = 4, off, airplane, className }: { bars?: number; off?: boolean; airplane?: boolean; className?: string }) {
  if (airplane) return <AirplaneRegular className={className} />;
  if (off) return <WifiOffRegular className={className} />;
  const I = [Wifi4Regular, Wifi3Regular, Wifi2Regular, Wifi1Regular][4 - Math.max(1, Math.min(4, bars))];
  // Fluent's Wifi1 is the "full" glyph, Wifi4 the weakest.
  return <I className={className} />;
}

/** "Saturday, October 10" */
export function longDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

/** "10:42 AM" (or 24h) */
export function shortTime(d: Date, hour24: boolean) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: !hour24 });
}

/** Relative time as Windows shows it in notifications ("Now", "5m ago", "1:30 PM", "Yesterday"). */
export function relTime(t: number, now = Date.now(), hour24 = false) {
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return 'Now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const d = new Date(t);
  const today = new Date(now);
  if (d.toDateString() === today.toDateString()) return shortTime(d, hour24);
  const y = new Date(now - 86400000);
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
}

/** Run `fn` on Escape while `active`. Registered on window in the capture phase. */
export function useEscape(active: boolean, fn: () => void) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!active) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') ref.current(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [active]);
}

/** Read / write a small JSON value in localStorage (errors ignored). */
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}
export function saveJSON(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ }
}

/** Original "mobile hotspot" glyph: a dot with broadcast arcs. */
export function HotspotGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} width="1em" height="1em" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden="true">
      <circle cx="10" cy="10" r="1.6" fill="currentColor" stroke="none" />
      <path d="M7.2 12.8a4 4 0 0 1 0-5.6M12.8 7.2a4 4 0 0 1 0 5.6" />
      <path d="M5 15a7 7 0 0 1 0-10M15 5a7 7 0 0 1 0 10" />
    </svg>
  );
}

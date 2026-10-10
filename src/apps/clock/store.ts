import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { notify } from '@/core/store/notifications';
import { useSettings } from '@/core/store/settings';
import { openApp } from '@/core/store/windows';
import { playChime, startRinging, stopRinging, type ChimeKind } from './sound';
import { formatClock, zoned } from './cities';

export interface TimerItem {
  id: string;
  name: string;
  duration: number;        // ms
  remaining: number;       // ms (valid while paused)
  endAt: number | null;    // epoch ms while running
  done?: boolean;          // reached zero and is ringing / showing "Time's up"
}

export interface AlarmItem {
  id: string;
  name: string;
  hour: number;            // 0–23
  minute: number;
  days: boolean[];         // index 0 = Monday … 6 = Sunday
  enabled: boolean;
  sound: ChimeKind;
  snooze: number;          // minutes, 0 = disabled
  lastFired?: string;      // "YYYY-MM-DD HH:MM" key so an alarm only fires once per minute
  snoozeUntil?: number | null;
}

export interface FocusSegment { kind: 'focus' | 'break'; ms: number }
export interface FocusRun {
  segments: FocusSegment[];
  index: number;
  endAt: number | null;    // running segment end
  remaining: number;       // ms left in current segment while paused
  startedAt: number;
  focusMsDone: number;     // completed focus time in this run
}

export interface TaskItem { id: string; text: string; done: boolean }

export interface ClockState {
  page: 'focus' | 'timer' | 'alarm' | 'stopwatch' | 'world' | 'settings';
  paneOpen: boolean | null; // null → automatic

  timers: TimerItem[];
  alarms: AlarmItem[];
  sw: { startedAt: number | null; base: number; laps: number[] };
  cities: string[];        // CityDef ids (local time is always shown)

  focusMinutes: number;
  skipBreaks: boolean;
  focusRun: FocusRun | null;
  focusPeriod: number;     // minutes
  breakPeriod: number;     // minutes
  focusEndSound: boolean;
  breakEndSound: boolean;
  focusSound: ChimeKind;
  dailyGoal: number;       // minutes
  history: Record<string, number>; // YYYY-MM-DD → focused minutes
  tasks: TaskItem[];

  ringing: { kind: 'alarm' | 'timer'; id: string } | null;

  set: (p: Partial<ClockState>) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);
export const MIN = 60_000;

const defaultTimers: TimerItem[] = [1, 3, 5, 10].map((m) => ({ id: uid(), name: `${m} min`, duration: m * MIN, remaining: m * MIN, endAt: null }));

export const useClock = create<ClockState>()(
  persist(
    (set) => ({
      page: 'focus',
      paneOpen: null,
      timers: defaultTimers,
      alarms: [{ id: uid(), name: 'Good morning', hour: 7, minute: 0, days: [true, true, true, true, true, false, false], enabled: false, sound: 'chimes', snooze: 10 }],
      sw: { startedAt: null, base: 0, laps: [] },
      cities: ['london-united-kingdom', 'new-york-usa', 'tokyo-japan'],

      focusMinutes: 30,
      skipBreaks: false,
      focusRun: null,
      focusPeriod: 25,
      breakPeriod: 5,
      focusEndSound: true,
      breakEndSound: true,
      focusSound: 'chimes',
      dailyGoal: 60,
      history: {},
      tasks: [],

      ringing: null,
      set: (p) => set(p),
    }),
    {
      name: 'wc.clock',
      version: 1,
      partialize: (s) => {
        const { ringing, set: _s, ...rest } = s;
        void ringing; void _s;
        return rest;
      },
    },
  ),
);

const S = () => useClock.getState();

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/* ───────────────────────── Timers ───────────────────────── */

export const timerLeft = (t: TimerItem, now = Date.now()) => (t.endAt ? Math.max(0, t.endAt - now) : t.remaining);

export const timerActions = {
  add(name: string, duration: number) {
    const n = name.trim() || `Timer (${S().timers.length + 1})`;
    S().set({ timers: [...S().timers, { id: uid(), name: n, duration, remaining: duration, endAt: null }] });
  },
  update(id: string, name: string, duration: number) {
    S().set({ timers: S().timers.map((t) => (t.id === id ? { ...t, name: name.trim() || t.name, duration, remaining: duration, endAt: null, done: false } : t)) });
  },
  remove(id: string) {
    if (S().ringing?.id === id) dismissRinging();
    S().set({ timers: S().timers.filter((t) => t.id !== id) });
  },
  toggle(id: string) {
    const now = Date.now();
    S().set({
      timers: S().timers.map((t) => {
        if (t.id !== id) return t;
        if (t.endAt) return { ...t, remaining: Math.max(0, t.endAt - now), endAt: null };
        const rem = t.remaining <= 0 || t.done ? t.duration : t.remaining;
        return { ...t, endAt: now + rem, remaining: rem, done: false };
      }),
    });
    if (S().ringing?.id === id) dismissRinging();
  },
  reset(id: string) {
    if (S().ringing?.id === id) dismissRinging();
    S().set({ timers: S().timers.map((t) => (t.id === id ? { ...t, remaining: t.duration, endAt: null, done: false } : t)) });
  },
};

/* ───────────────────────── Alarms ───────────────────────── */

export function nextAlarmTime(a: AlarmItem, from = new Date()): Date {
  const d = new Date(from);
  d.setSeconds(0, 0);
  for (let i = 0; i < 8; i++) {
    const cand = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i, a.hour, a.minute, 0, 0);
    if (cand.getTime() <= from.getTime()) continue;
    const wd = (cand.getDay() + 6) % 7;
    if (a.days.some(Boolean) && !a.days[wd]) continue;
    return cand;
  }
  return new Date(from.getTime() + 86400000);
}

export function ringsIn(a: AlarmItem, from = new Date()): string {
  const target = a.snoozeUntil && a.snoozeUntil > from.getTime() ? new Date(a.snoozeUntil) : nextAlarmTime(a, from);
  let mins = Math.max(1, Math.ceil((target.getTime() - from.getTime()) / MIN));
  const days = Math.floor(mins / 1440); mins -= days * 1440;
  const hrs = Math.floor(mins / 60); mins -= hrs * 60;
  const parts: string[] = [];
  if (days) parts.push(`${days} day${days === 1 ? '' : 's'}`);
  if (hrs) parts.push(`${hrs} hour${hrs === 1 ? '' : 's'}`);
  if (mins && !days) parts.push(`${mins} minute${mins === 1 ? '' : 's'}`);
  return `Rings in ${parts.join(', ')}`;
}

export const alarmActions = {
  save(a: Omit<AlarmItem, 'id'> & { id?: string }) {
    if (a.id) S().set({ alarms: S().alarms.map((x) => (x.id === a.id ? { ...x, ...a, id: x.id, lastFired: undefined, snoozeUntil: null } : x)) });
    else S().set({ alarms: [...S().alarms, { ...a, id: uid() }] });
  },
  remove(id: string) {
    if (S().ringing?.id === id) dismissRinging();
    S().set({ alarms: S().alarms.filter((x) => x.id !== id) });
  },
  toggle(id: string, on: boolean) {
    S().set({ alarms: S().alarms.map((x) => (x.id === id ? { ...x, enabled: on, snoozeUntil: null } : x)) });
  },
};

/* ───────────────────────── Stopwatch ───────────────────────── */

export const swElapsed = (sw: ClockState['sw'], now = Date.now()) => sw.base + (sw.startedAt ? now - sw.startedAt : 0);

export const swActions = {
  toggle() {
    const sw = S().sw;
    const now = Date.now();
    S().set({ sw: sw.startedAt ? { ...sw, base: swElapsed(sw, now), startedAt: null } : { ...sw, startedAt: now } });
  },
  lap() {
    const sw = S().sw;
    if (!sw.startedAt) return;
    S().set({ sw: { ...sw, laps: [...sw.laps, swElapsed(sw)] } });
  },
  reset() { S().set({ sw: { startedAt: null, base: 0, laps: [] } }); },
};

/* ───────────────────────── Focus sessions ───────────────────────── */

export function planFocus(total: number, focus: number, brk: number, skip: boolean): FocusSegment[] {
  if (skip || total <= 30) return [{ kind: 'focus', ms: total * MIN }];
  const out: FocusSegment[] = [];
  let left = total;
  while (left > 0) {
    const f = Math.min(focus, left);
    out.push({ kind: 'focus', ms: f * MIN });
    left -= f;
    if (left > brk) { out.push({ kind: 'break', ms: brk * MIN }); left -= brk; }
    else if (left > 0) { out[out.length - 1].ms += left * MIN; left = 0; }
  }
  return out;
}

function addFocusMinutes(ms: number) {
  const k = dayKey();
  const h = { ...S().history };
  h[k] = (h[k] ?? 0) + ms / MIN;
  S().set({ history: h });
}

export const focusActions = {
  start() {
    const s = S();
    const segments = planFocus(s.focusMinutes, s.focusPeriod, s.breakPeriod, s.skipBreaks);
    const now = Date.now();
    s.set({ focusRun: { segments, index: 0, endAt: now + segments[0].ms, remaining: segments[0].ms, startedAt: now, focusMsDone: 0 } });
  },
  pause() {
    const r = S().focusRun;
    if (!r) return;
    const now = Date.now();
    if (r.endAt) S().set({ focusRun: { ...r, remaining: Math.max(0, r.endAt - now), endAt: null } });
    else S().set({ focusRun: { ...r, endAt: now + r.remaining } });
  },
  stop() {
    const r = S().focusRun;
    if (!r) return;
    const seg = r.segments[r.index];
    if (seg?.kind === 'focus') {
      const left = r.endAt ? Math.max(0, r.endAt - Date.now()) : r.remaining;
      addFocusMinutes(seg.ms - left);
    }
    S().set({ focusRun: null });
  },
  skipBreak() {
    const r = S().focusRun;
    if (!r || r.segments[r.index]?.kind !== 'break') return;
    advanceFocus(Date.now(), true);
  },
};

function advanceFocus(now: number, silent = false) {
  const s = S();
  const r = s.focusRun;
  if (!r) return;
  const seg = r.segments[r.index];
  if (seg.kind === 'focus') addFocusMinutes(seg.ms);
  const next = r.index + 1;
  if (next >= r.segments.length) {
    s.set({ focusRun: null });
    if (!silent) {
      notify({ appId: 'clock', title: 'Focus session complete', body: 'Great job! Take a moment to stretch before your next task.', onClick: () => openClockPage('focus') });
      if (s.focusEndSound) playChime(s.focusSound);
    }
    return;
  }
  const ns = r.segments[next];
  s.set({ focusRun: { ...r, index: next, endAt: now + ns.ms, remaining: ns.ms, focusMsDone: r.focusMsDone + (seg.kind === 'focus' ? seg.ms : 0) } });
  if (silent) return;
  if (ns.kind === 'break') {
    notify({ appId: 'clock', title: 'Time for a break', body: `Focus period complete. Enjoy a ${Math.round(ns.ms / MIN)} minute break.`, onClick: () => openClockPage('focus') });
    if (s.focusEndSound) playChime(s.focusSound);
  } else {
    notify({ appId: 'clock', title: 'Break is over', body: 'Time to get back to focusing.', onClick: () => openClockPage('focus') });
    if (s.breakEndSound) playChime(s.focusSound);
  }
}

/* ───────────────────────── Ringing ───────────────────────── */

export function dismissRinging() {
  stopRinging();
  const r = S().ringing;
  if (!r) return;
  if (r.kind === 'timer') S().set({ timers: S().timers.map((t) => (t.id === r.id ? { ...t, done: false, remaining: t.duration, endAt: null } : t)) });
  S().set({ ringing: null });
}

export function snoozeRinging() {
  const r = S().ringing;
  if (!r || r.kind !== 'alarm') return dismissRinging();
  const a = S().alarms.find((x) => x.id === r.id);
  stopRinging();
  if (a) S().set({ alarms: S().alarms.map((x) => (x.id === a.id ? { ...x, enabled: true, snoozeUntil: Date.now() + (a.snooze || 5) * MIN } : x)) });
  S().set({ ringing: null });
}

function openClockPage(page: ClockState['page']) {
  S().set({ page });
  openApp('clock');
}

/* ───────────────────────── Background engine ───────────────────────── */

function tick() {
  const s = S();
  const now = Date.now();

  // Timers
  const finished = s.timers.filter((t) => t.endAt && t.endAt <= now);
  if (finished.length) {
    s.set({ timers: s.timers.map((t) => (finished.includes(t) ? { ...t, endAt: null, remaining: 0, done: true } : t)) });
    const t = finished[0];
    notify({ appId: 'clock', title: t.name, body: "Time's up!", onClick: () => openClockPage('timer') });
    s.set({ ringing: { kind: 'timer', id: t.id } });
    startRinging('chimes', 30_000);
  }

  // Alarms
  const d = new Date(now);
  const key = `${dayKey(d)} ${d.getHours()}:${d.getMinutes()}`;
  const wd = (d.getDay() + 6) % 7;
  for (const a of s.alarms) {
    if (!a.enabled) continue;
    const snoozeDue = a.snoozeUntil && a.snoozeUntil <= now;
    const due = a.hour === d.getHours() && a.minute === d.getMinutes() && (!a.days.some(Boolean) || a.days[wd]) && a.lastFired !== key;
    if (!due && !snoozeDue) continue;
    const once = !a.days.some(Boolean);
    S().set({
      alarms: S().alarms.map((x) => (x.id === a.id ? { ...x, lastFired: key, snoozeUntil: null, enabled: once && !snoozeDue ? false : x.enabled } : x)),
      ringing: { kind: 'alarm', id: a.id },
    });
    const h24 = useSettings.getState().hour24;
    const f = formatClock(a.hour, a.minute, h24);
    notify({ appId: 'clock', title: a.name || 'Alarm', body: `${f.time}${f.ampm ? ' ' + f.ampm : ''}`, onClick: () => openClockPage('alarm') });
    startRinging(a.sound, 60_000);
    break;
  }

  // Focus sessions
  const r = s.focusRun;
  if (r && r.endAt && r.endAt <= now) advanceFocus(now);
}

let engine: number | null = null;
export function ensureEngine() {
  if (engine != null) return;
  engine = window.setInterval(tick, 500);
}

/** Convenience used by world clock & alarms: current wall clock in the user's zone. */
export function localNow(tz: string, date = new Date()) { return zoned(date, tz); }

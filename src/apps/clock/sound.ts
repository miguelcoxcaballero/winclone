/* Original synthesized alert sounds for the Clock app (WebAudio, no samples). */
import { useSettings } from '@/core/store/settings';

let ctx: AudioContext | null = null;
function ac(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
    return ctx;
  } catch {
    return null;
  }
}

export type ChimeKind = 'chimes' | 'xylophone' | 'bells' | 'pulse' | 'none';

export const SOUND_OPTIONS: { value: ChimeKind; label: string }[] = [
  { value: 'chimes', label: 'Chimes' },
  { value: 'xylophone', label: 'Xylophone' },
  { value: 'bells', label: 'Bells' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'none', label: 'None' },
];

function note(c: AudioContext, freq: number, at: number, dur: number, type: OscillatorType, gain: number, out: AudioNode) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(out);
  o.start(at);
  o.stop(at + dur + 0.05);
  // soft overtone for a bell-like timbre
  if (type === 'sine') {
    const o2 = c.createOscillator();
    const g2 = c.createGain();
    o2.frequency.value = freq * 2.76;
    g2.gain.setValueAtTime(0, at);
    g2.gain.linearRampToValueAtTime(gain * 0.18, at + 0.005);
    g2.gain.exponentialRampToValueAtTime(0.0001, at + dur * 0.5);
    o2.connect(g2).connect(out);
    o2.start(at);
    o2.stop(at + dur);
  }
}

/** Play one phrase of the chosen sound. Returns its length in seconds. */
export function playChime(kind: ChimeKind = 'chimes', volume = 0.35): number {
  if (kind === 'none') return 0;
  const c = ac();
  if (!c) return 0;
  const out = c.createGain();
  const settings = useSettings.getState();
  out.gain.value = settings.muted ? 0 : volume * settings.volume / 100;
  out.connect(c.destination);
  const t = c.currentTime + 0.02;
  switch (kind) {
    case 'xylophone': {
      const seq = [784, 988, 1175, 1568, 1175, 1568];
      seq.forEach((f, i) => note(c, f, t + i * 0.13, 0.35, 'triangle', 0.5, out));
      return 1.1;
    }
    case 'bells': {
      [523.25, 659.25, 783.99].forEach((f, i) => note(c, f, t + i * 0.32, 1.6, 'sine', 0.45, out));
      note(c, 1046.5, t + 1.0, 1.8, 'sine', 0.35, out);
      return 2.4;
    }
    case 'pulse': {
      for (let i = 0; i < 4; i++) note(c, 880, t + i * 0.22, 0.12, 'square', 0.12, out);
      return 1.0;
    }
    case 'chimes':
    default: {
      const seq = [659.25, 830.61, 987.77, 1318.5];
      seq.forEach((f, i) => note(c, f, t + i * 0.18, 1.2, 'sine', 0.5, out));
      return 1.6;
    }
  }
}

let loop: number | null = null;
/** Repeat a sound until stopRinging() is called (or maxMs elapses). */
export function startRinging(kind: ChimeKind, maxMs = 60_000) {
  stopRinging();
  if (kind === 'none') return;
  const started = Date.now();
  const tick = () => {
    if (Date.now() - started > maxMs) return stopRinging();
    const len = playChime(kind);
    loop = window.setTimeout(tick, Math.max(1200, len * 1000 + 700));
  };
  tick();
}
export function stopRinging() {
  if (loop != null) clearTimeout(loop);
  loop = null;
}

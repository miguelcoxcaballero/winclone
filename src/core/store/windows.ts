import { create } from 'zustand';
import type { Rect, SnapZone } from '../types';
import { getApp } from '../../apps/registry';

export type WinState = 'normal' | 'maximized' | 'minimized';
export type WinAnim = 'opening' | 'closing' | 'minimizing' | 'restoring' | null;

export interface Win {
  id: string;
  appId: string;
  title: string;
  args?: any;
  rect: Rect;                 // rect when in "normal" (or snapped) state
  restoreRect: Rect | null;   // rect to go back to when un-snapping
  state: WinState;
  prevState: Exclude<WinState, 'minimized'>; // state to return to from minimized
  snap: SnapZone | null;
  z: number;
  anim: WinAnim;
  openedAt: number;
}

interface WindowsStore {
  windows: Win[];
  activeId: string | null;
  zCounter: number;
  /** id → DOM rect of taskbar button, used for minimize animation targets */
  taskbarTargets: Record<string, DOMRect>;

  open: (appId: string, args?: any) => string | null;
  close: (id: string) => void;
  remove: (id: string) => void;
  focus: (id: string | null) => void;
  minimize: (id: string) => void;
  restore: (id: string) => void;
  toggleMaximize: (id: string) => void;
  maximize: (id: string) => void;
  setRect: (id: string, rect: Partial<Rect>) => void;
  setTitle: (id: string, title: string) => void;
  setAnim: (id: string, anim: WinAnim) => void;
  snapTo: (id: string, zone: SnapZone) => void;
  unsnap: (id: string) => void;
  minimizeAll: () => void;
  closeAll: () => void;
  setTaskbarTarget: (appId: string, rect: DOMRect) => void;
}

let idSeq = 0;
const closeGuards = new Map<string, () => boolean | Promise<boolean>>();

/** Register a guard; return false (or resolve false) to cancel closing. */
export function setCloseGuard(winId: string, guard: (() => boolean | Promise<boolean>) | null) {
  if (guard) closeGuards.set(winId, guard);
  else closeGuards.delete(winId);
}

export function desktopSize() {
  return { w: window.innerWidth, h: window.innerHeight - 48 };
}

export function zoneToRect(zone: SnapZone): Rect {
  const { w, h } = desktopSize();
  if (typeof zone === 'object') {
    return { x: Math.round(zone.x * w), y: Math.round(zone.y * h), w: Math.round(zone.w * w), h: Math.round(zone.h * h) };
  }
  const hw = Math.round(w / 2), hh = Math.round(h / 2);
  switch (zone) {
    case 'left': return { x: 0, y: 0, w: hw, h };
    case 'right': return { x: hw, y: 0, w: w - hw, h };
    case 'top-left': return { x: 0, y: 0, w: hw, h: hh };
    case 'top-right': return { x: hw, y: 0, w: w - hw, h: hh };
    case 'bottom-left': return { x: 0, y: hh, w: hw, h: h - hh };
    case 'bottom-right': return { x: hw, y: hh, w: w - hw, h: h - hh };
    case 'top':
    default: return { x: 0, y: 0, w, h };
  }
}

function cascadeRect(appId: string, existing: Win[]): Rect {
  const app = getApp(appId);
  const { w: dw, h: dh } = desktopSize();
  const w = Math.min(app?.defaultSize?.w ?? 900, dw - 40);
  const h = Math.min(app?.defaultSize?.h ?? 600, dh - 40);
  const visible = existing.filter((x) => x.state !== 'minimized' && !x.anim?.startsWith('clos'));
  const n = visible.length % 8;
  const x = Math.max(0, Math.round((dw - w) / 2 - 80 + n * 28 + (appId.length % 5) * 8));
  const y = Math.max(0, Math.round((dh - h) / 2 - 40 + n * 28));
  return { x, y, w, h };
}

export const useWindows = create<WindowsStore>()((set, get) => ({
  windows: [],
  activeId: null,
  zCounter: 10,
  taskbarTargets: {},

  open: (appId, args) => {
    const app = getApp(appId);
    if (!app) return null;
    const { windows } = get();
    if (app.singleInstance) {
      const ex = windows.find((w) => w.appId === appId && w.anim !== 'closing');
      if (ex) {
        if (ex.state === 'minimized') get().restore(ex.id);
        else get().focus(ex.id);
        if (args !== undefined) set({ windows: get().windows.map((w) => (w.id === ex.id ? { ...w, args } : w)) });
        return ex.id;
      }
    }
    const id = `w${++idSeq}`;
    const z = get().zCounter + 1;
    const rect = cascadeRect(appId, windows);
    const win: Win = {
      id, appId, title: app.name, args, rect,
      restoreRect: null,
      state: app.startMaximized ? 'maximized' : 'normal',
      prevState: app.startMaximized ? 'maximized' : 'normal',
      snap: null, z, anim: 'opening', openedAt: Date.now(),
    };
    set({ windows: [...windows, win], activeId: id, zCounter: z });
    return id;
  },

  close: async (id) => {
    const guard = closeGuards.get(id);
    if (guard) {
      const ok = await guard();
      if (!ok) return;
    }
    closeGuards.delete(id);
    const w = get().windows.find((x) => x.id === id);
    if (!w) return;
    set({ windows: get().windows.map((x) => (x.id === id ? { ...x, anim: 'closing' } : x)) });
    if (get().activeId === id) {
      const next = topVisible(get().windows.filter((x) => x.id !== id));
      set({ activeId: next?.id ?? null });
    }
  },

  remove: (id) => set({ windows: get().windows.filter((w) => w.id !== id) }),

  focus: (id) => {
    if (id === null) return set({ activeId: null });
    const { windows, zCounter, activeId } = get();
    const w = windows.find((x) => x.id === id);
    if (!w) return;
    if (activeId === id && w.z === zCounter) return;
    const z = zCounter + 1;
    set({ windows: windows.map((x) => (x.id === id ? { ...x, z } : x)), activeId: id, zCounter: z });
  },

  minimize: (id) => {
    const { windows, activeId } = get();
    const w = windows.find((x) => x.id === id);
    if (!w || w.state === 'minimized') return;
    const updated = windows.map((x) =>
      x.id === id ? { ...x, prevState: x.state as Exclude<WinState, 'minimized'>, state: 'minimized' as const, anim: 'minimizing' as const } : x,
    );
    const next = activeId === id ? topVisible(updated.filter((x) => x.id !== id)) : null;
    set({ windows: updated, activeId: activeId === id ? next?.id ?? null : activeId });
  },

  restore: (id) => {
    const { windows, zCounter } = get();
    const z = zCounter + 1;
    set({
      windows: windows.map((x) =>
        x.id === id ? { ...x, state: x.state === 'minimized' ? x.prevState : 'normal', anim: x.state === 'minimized' ? 'restoring' : x.anim, z } : x,
      ),
      activeId: id,
      zCounter: z,
    });
  },

  toggleMaximize: (id) => {
    const w = get().windows.find((x) => x.id === id);
    if (!w) return;
    if (w.state === 'maximized') {
      set({ windows: get().windows.map((x) => (x.id === id ? { ...x, state: 'normal' } : x)) });
    } else get().maximize(id);
  },

  maximize: (id) => {
    set({
      windows: get().windows.map((x) =>
        x.id === id ? { ...x, state: 'maximized', snap: null, rect: x.snap && x.restoreRect ? x.restoreRect : x.rect, restoreRect: x.snap ? null : x.restoreRect } : x,
      ),
    });
    get().focus(id);
  },

  setRect: (id, r) =>
    set({ windows: get().windows.map((x) => (x.id === id ? { ...x, rect: { ...x.rect, ...r } } : x)) }),

  setTitle: (id, title) => {
    const w = get().windows.find((x) => x.id === id);
    if (!w || w.title === title) return;
    set({ windows: get().windows.map((x) => (x.id === id ? { ...x, title } : x)) });
  },

  setAnim: (id, anim) => {
    const w = get().windows.find((x) => x.id === id);
    if (!w || w.anim === anim) return;
    set({ windows: get().windows.map((x) => (x.id === id ? { ...x, anim } : x)) });
  },

  snapTo: (id, zone) => {
    if (zone === 'top') return get().maximize(id);
    set({
      windows: get().windows.map((x) =>
        x.id === id
          ? { ...x, state: 'normal', snap: zone, restoreRect: x.snap ? x.restoreRect : { ...x.rect }, rect: zoneToRect(zone) }
          : x,
      ),
    });
    get().focus(id);
  },

  unsnap: (id) =>
    set({
      windows: get().windows.map((x) =>
        x.id === id && x.snap ? { ...x, snap: null, rect: x.restoreRect ? { ...x.restoreRect, x: x.rect.x, y: x.rect.y } : x.rect, restoreRect: null } : x,
      ),
    }),

  minimizeAll: () => {
    set({
      windows: get().windows.map((x) =>
        x.state === 'minimized' ? x : { ...x, prevState: x.state as Exclude<WinState, 'minimized'>, state: 'minimized', anim: 'minimizing' },
      ),
      activeId: null,
    });
  },

  closeAll: () => {
    closeGuards.clear();
    set({ windows: [], activeId: null });
  },

  setTaskbarTarget: (appId, rect) => set({ taskbarTargets: { ...get().taskbarTargets, [appId]: rect } }),
}));

function topVisible(ws: Win[]): Win | undefined {
  return ws.filter((w) => w.state !== 'minimized' && w.anim !== 'closing').sort((a, b) => b.z - a.z)[0];
}

/** Convenience helpers usable outside React */
export const openApp = (appId: string, args?: any) => useWindows.getState().open(appId, args);
export const closeWindow = (id: string) => useWindows.getState().close(id);

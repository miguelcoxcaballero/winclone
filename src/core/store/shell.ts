import { create } from 'zustand';
import type { ContextMenuSpec } from '../types';

export type Flyout = 'start' | 'search' | 'quick' | 'notifications' | 'widgets' | 'taskview' | 'tray' | null;
export type Phase = 'boot' | 'lock' | 'login' | 'signing-in' | 'desktop' | 'locking' | 'signing-out' | 'shutting-down' | 'restarting' | 'off' | 'sleep';

interface ShellStore {
  flyout: Flyout;
  /** Start menu sub-view */
  startView: 'pinned' | 'all';
  searchQuery: string;
  contextMenu: ContextMenuSpec | null;
  phase: Phase;
  /** Run dialog visible */
  runOpen: boolean;
  /** Snap preview rectangle while dragging a window */
  snapPreview: { x: number; y: number; w: number; h: number } | null;
  /** Show-desktop peek state */
  peek: boolean;

  open: (f: Exclude<Flyout, null>) => void;
  toggle: (f: Exclude<Flyout, null>) => void;
  closeFlyouts: () => void;
  setStartView: (v: 'pinned' | 'all') => void;
  setSearchQuery: (q: string) => void;
  showContextMenu: (spec: ContextMenuSpec) => void;
  hideContextMenu: () => void;
  setPhase: (p: Phase) => void;
  setRunOpen: (v: boolean) => void;
  setSnapPreview: (r: ShellStore['snapPreview']) => void;
  setPeek: (v: boolean) => void;
}

export const useShell = create<ShellStore>()((set, get) => ({
  flyout: null,
  startView: 'pinned',
  searchQuery: '',
  contextMenu: null,
  phase: 'boot',
  runOpen: false,
  snapPreview: null,
  peek: false,

  open: (f) => set({ flyout: f, contextMenu: null, ...(f === 'start' ? { startView: 'pinned' as const, searchQuery: '' } : {}), ...(f === 'search' ? { searchQuery: get().flyout === 'search' ? get().searchQuery : '' } : {}) }),
  toggle: (f) => (get().flyout === f ? set({ flyout: null }) : get().open(f)),
  closeFlyouts: () => set({ flyout: null }),
  setStartView: (v) => set({ startView: v }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  showContextMenu: (spec) => set({ contextMenu: spec }),
  hideContextMenu: () => set({ contextMenu: null }),
  setPhase: (p) => set({ phase: p, flyout: null, contextMenu: null }),
  setRunOpen: (v) => set({ runOpen: v }),
  setSnapPreview: (r) => set({ snapPreview: r }),
  setPeek: (v) => set({ peek: v }),
}));

/** Show a context menu at the pointer position of a mouse event. */
export function contextMenu(e: { clientX: number; clientY: number; preventDefault?: () => void; stopPropagation?: () => void }, spec: Omit<ContextMenuSpec, 'x' | 'y'>) {
  e.preventDefault?.();
  e.stopPropagation?.();
  useShell.getState().showContextMenu({ ...spec, x: e.clientX, y: e.clientY });
}

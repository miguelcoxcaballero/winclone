import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { setCloseGuard, useWindows } from './store/windows';

export interface WindowApi {
  id: string;
  appId: string;
  args?: any;
  isActive: boolean;
  isMaximized: boolean;
  isMinimized: boolean;
  isSnapped: boolean;
  setTitle: (title: string) => void;
  close: () => void;
  minimize: () => void;
  toggleMaximize: () => void;
  focus: () => void;
  /** Register a function that runs before closing; return false to cancel. */
  setCloseGuard: (guard: (() => boolean | Promise<boolean>) | null) => void;
}

export const WindowContext = createContext<WindowApi | null>(null);

/** Access the window hosting the current app. */
export function useWindow(): WindowApi {
  const ctx = useContext(WindowContext);
  if (!ctx) throw new Error('useWindow must be used inside an app window');
  return ctx;
}

export function makeWindowApi(id: string, appId: string, args: any, flags: { active: boolean; maximized: boolean; minimized: boolean; snapped: boolean }): WindowApi {
  const s = () => useWindows.getState();
  return {
    id, appId, args,
    isActive: flags.active,
    isMaximized: flags.maximized,
    isMinimized: flags.minimized,
    isSnapped: flags.snapped,
    setTitle: (t) => s().setTitle(id, t),
    close: () => s().close(id),
    minimize: () => s().minimize(id),
    toggleMaximize: () => s().toggleMaximize(id),
    focus: () => s().focus(id),
    setCloseGuard: (g) => setCloseGuard(id, g),
  };
}

/* ───────────── Small generic hooks shared by apps ───────────── */

/** Re-render every `ms` milliseconds and return the current Date. */
export function useNow(ms = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export function useInterval(fn: () => void, ms: number | null) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (ms == null) return;
    const t = setInterval(() => ref.current(), ms);
    return () => clearInterval(t);
  }, [ms]);
}

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useShell, type Flyout } from './store/shell';

/**
 * Keep an element mounted while it plays an exit animation.
 *   const { mounted, state } = usePresence(open, 180);
 *   mounted && <div className={state}>…</div>   // state: 'enter' | 'exit'
 */
export function usePresence(open: boolean, exitMs = 200) {
  const [mounted, setMounted] = useState(open);
  const [state, setState] = useState<'enter' | 'exit'>(open ? 'enter' : 'exit');
  useEffect(() => {
    if (open) {
      setMounted(true);
      setState('enter');
      return;
    }
    setState('exit');
    const t = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(t);
  }, [open, exitMs]);
  return { mounted, state };
}

/**
 * Close a shell flyout when the user presses outside of it.
 * `ignore` is a CSS selector for elements that should not close it
 * (typically the taskbar button that toggles the flyout).
 */
export function useFlyoutDismiss(ref: RefObject<HTMLElement | null>, name: Exclude<Flyout, null>, ignore?: string) {
  const open = useShell((s) => s.flyout === name);
  useEffect(() => {
    if (!open) return;
    const h = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (ref.current?.contains(t)) return;
      if (ignore && t.closest(ignore)) return;
      if (t.closest('.ctx-menu, .fl-combo-popup')) return;
      if (useShell.getState().flyout === name) useShell.getState().closeFlyouts();
    };
    const t = setTimeout(() => window.addEventListener('pointerdown', h, true), 0);
    return () => { clearTimeout(t); window.removeEventListener('pointerdown', h, true); };
  }, [open, name, ref, ignore]);
  return open;
}

/** Previous value of a variable (from the last render). */
export function usePrevious<T>(v: T): T | undefined {
  const r = useRef<T | undefined>(undefined);
  useEffect(() => { r.current = v; });
  return r.current;
}

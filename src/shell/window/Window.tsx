import { Component, memo, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useWindows, desktopSize, zoneToRect, type Win } from '@/core/store/windows';
import { useShell } from '@/core/store/shell';
import { useSettings } from '@/core/store/settings';
import { getApp } from '@/apps/registry';
import { WindowContext, makeWindowApi } from '@/core/window-context';
import { CaptionButtons } from './CaptionButtons';
import { TitleBar } from './TitleBar';
import { AppIcon } from '@/icons/AppIcons';
import type { Rect, SnapZone } from '@/core/types';
import './window.css';

const INTERACTIVE = '[data-drag], [data-nodrag], button, input, textarea, select, a, [contenteditable="true"], [role="button"], [role="tab"]';

class AppErrorBoundary extends Component<{ name: string; children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error(error); }
  render() {
    if (this.state.error) {
      return (
        <div className="win-crash">
          <div className="t-subtitle">{this.props.name} isn't responding</div>
          <div className="t-body t-secondary">{String(this.state.error.message || this.state.error)}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

/** The app body is memoised so moving/resizing the window does not re-render the app. */
const Client = memo(function Client({ appId, winId, args }: { appId: string; winId: string; args: any }) {
  const app = getApp(appId)!;
  const C = app.component;
  return (
    <AppErrorBoundary name={app.name}>
      <Suspense fallback={<div className="win-splash"><AppIcon appId={appId} size={64} /></div>}>
        <C windowId={winId} args={args} />
      </Suspense>
    </AppErrorBoundary>
  );
});

function detectZone(px: number, py: number): SnapZone | null {
  const { w, h } = desktopSize();
  const edge = 2, corner = 120;
  if (py <= edge) {
    if (px <= corner) return 'top-left';
    if (px >= w - corner) return 'top-right';
    return 'top';
  }
  if (px <= edge) {
    if (py <= corner) return 'top-left';
    if (py >= h - corner) return 'bottom-left';
    return 'left';
  }
  if (px >= w - edge - 1) {
    if (py <= corner) return 'top-right';
    if (py >= h - corner) return 'bottom-right';
    return 'right';
  }
  return null;
}

export function Window({ win }: { win: Win }) {
  const app = getApp(win.appId)!;
  const activeId = useWindows((s) => s.activeId);
  const target = useWindows((s) => s.taskbarTargets[win.appId]);
  const snapEnabled = useSettings((s) => s.snapWindows);
  const peek = useShell((s) => s.peek);
  const ref = useRef<HTMLDivElement>(null);
  const [animating, setAnimating] = useState(false);
  const [vp, setVp] = useState(() => desktopSize());

  const active = activeId === win.id;
  const maximized = win.state === 'maximized' || (win.state === 'minimized' && win.prevState === 'maximized');
  const minimized = win.state === 'minimized';
  const snapped = !!win.snap && !maximized;

  useEffect(() => {
    const onResize = () => setVp(desktopSize());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Re-apply snapped zone when the viewport changes
  useEffect(() => {
    if (win.snap && !maximized) useWindows.getState().setRect(win.id, zoneToRect(win.snap));
  }, [vp.w, vp.h]); // eslint-disable-line react-hooks/exhaustive-deps

  // Smooth geometry transition when maximizing / restoring / snapping
  const geomKey = `${maximized}|${JSON.stringify(win.snap)}`;
  const firstGeom = useRef(true);
  useLayoutEffect(() => {
    if (firstGeom.current) { firstGeom.current = false; return; }
    setAnimating(true);
    const t = setTimeout(() => setAnimating(false), 260);
    return () => clearTimeout(t);
  }, [geomKey]);

  const rect: Rect = maximized ? { x: 0, y: 0, w: vp.w, h: vp.h } : win.rect;

  const api = useMemo(
    () => makeWindowApi(win.id, win.appId, win.args, { active, maximized, minimized, snapped }),
    [win.id, win.appId, win.args, active, maximized, minimized, snapped],
  );

  /* ─────────── dragging ─────────── */
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const store = useWindows.getState();
    store.focus(win.id);
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;
    const hit = t.closest(INTERACTIVE);
    if (!hit || !hit.hasAttribute('data-drag')) return;
    if (!ref.current?.contains(hit)) return;

    const startX = e.clientX, startY = e.clientY;
    const cur = useWindows.getState().windows.find((w) => w.id === win.id)!;
    const isMax = cur.state === 'maximized';
    const start: Rect = isMax ? { x: 0, y: 0, w: desktopSize().w, h: desktopSize().h } : { ...cur.rect };
    let moved = false;
    let zone: SnapZone | null = null;
    let base = start;
    const el = ref.current!;
    const pointerId = e.pointerId;

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (!moved) {
        if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        moved = true;
        el.classList.add('dragging');
        try { el.setPointerCapture(pointerId); } catch { /* ignore */ }
        const c = useWindows.getState().windows.find((w) => w.id === win.id)!;
        if (c.state === 'maximized' || c.snap) {
          // Restore to the pre-maximize / pre-snap size under the cursor
          const restoreW = c.snap && c.restoreRect ? c.restoreRect.w : c.rect.w;
          const restoreH = c.snap && c.restoreRect ? c.restoreRect.h : c.rect.h;
          const ratio = (startX - start.x) / start.w;
          const nx = Math.round(startX - restoreW * ratio);
          base = { x: nx, y: Math.max(0, start.y), w: restoreW, h: restoreH };
          useWindows.setState({
            windows: useWindows.getState().windows.map((w) =>
              w.id === win.id ? { ...w, state: 'normal', snap: null, restoreRect: null, rect: base } : w,
            ),
          });
        }
      }
      const nx = Math.round(base.x + dx);
      const ny = Math.round(Math.max(0, Math.min(desktopSize().h - 8, base.y + dy)));
      useWindows.getState().setRect(win.id, { x: nx, y: ny });

      if (snapEnabled && app.resizable !== false) {
        const z = detectZone(ev.clientX, ev.clientY);
        if (JSON.stringify(z) !== JSON.stringify(zone)) {
          zone = z;
          useShell.getState().setSnapPreview(z ? zoneToRect(z) : null);
        }
      }
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      el.classList.remove('dragging');
      useShell.getState().setSnapPreview(null);
      if (moved && zone) useWindows.getState().snapTo(win.id, zone);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    void isMax;
  }, [win.id, snapEnabled, app.resizable]);

  const onDoubleClick = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    const hit = t.closest(INTERACTIVE);
    if (hit && hit.hasAttribute('data-drag') && app.maximizable !== false) useWindows.getState().toggleMaximize(win.id);
  };

  const onContextMenu = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    const hit = t.closest(INTERACTIVE);
    if (!hit || !hit.hasAttribute('data-drag')) return;
    if (t.closest('input, textarea, [contenteditable="true"]')) return;
    e.preventDefault();
    const s = useWindows.getState();
    useShell.getState().showContextMenu({
      x: e.clientX, y: e.clientY, legacy: true,
      items: [
        { label: 'Restore', disabled: !maximized && !snapped, onClick: () => (maximized ? s.toggleMaximize(win.id) : s.unsnap(win.id)) },
        { label: 'Move', disabled: maximized },
        { label: 'Size', disabled: maximized || app.resizable === false },
        { label: 'Minimize', disabled: app.minimizable === false, onClick: () => s.minimize(win.id) },
        { label: 'Maximize', disabled: maximized || app.maximizable === false, onClick: () => s.maximize(win.id) },
        { separator: true },
        { label: 'Close', shortcut: 'Alt+F4', bold: true, onClick: () => s.close(win.id) },
      ],
    });
  };

  /* ─────────── resizing ─────────── */
  const startResize = (dir: string) => (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const store = useWindows.getState();
    store.focus(win.id);
    const c = store.windows.find((w) => w.id === win.id)!;
    if (c.snap) useWindows.setState({ windows: store.windows.map((w) => (w.id === win.id ? { ...w, snap: null, restoreRect: null } : w)) });
    const s0 = { ...c.rect };
    const sx = e.clientX, sy = e.clientY;
    const min = app.minSize ?? { w: 360, h: 240 };
    ref.current?.classList.add('resizing');
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      const r = { ...s0 };
      if (dir.includes('e')) r.w = Math.max(min.w, s0.w + dx);
      if (dir.includes('s')) r.h = Math.max(min.h, Math.min(desktopSize().h - s0.y, s0.h + dy));
      if (dir.includes('w')) { r.w = Math.max(min.w, s0.w - dx); r.x = s0.x + s0.w - r.w; }
      if (dir.includes('n')) { const ny = Math.max(0, s0.y + dy); r.h = Math.max(min.h, s0.h - (ny - s0.y)); r.y = s0.y + s0.h - r.h; }
      useWindows.getState().setRect(win.id, r);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      ref.current?.classList.remove('resizing');
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  /* ─────────── open / close / minimize animations ─────────── */
  const onAnimationEnd = (e: React.AnimationEvent) => {
    if (e.target !== ref.current) return;
    const s = useWindows.getState();
    if (win.anim === 'closing') s.remove(win.id);
    else if (win.anim) s.setAnim(win.id, null);
  };

  // Safety: never get stuck in an animation state (e.g. when animations are disabled)
  useEffect(() => {
    if (!win.anim) return;
    const t = setTimeout(() => {
      const s = useWindows.getState();
      const w = s.windows.find((x) => x.id === win.id);
      if (!w || w.anim !== win.anim) return;
      if (w.anim === 'closing') s.remove(win.id);
      else s.setAnim(win.id, null);
    }, 600);
    return () => clearTimeout(t);
  }, [win.anim, win.id]);

  // Minimize animation target: centre of the taskbar button
  const cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
  const tx = target ? target.left + target.width / 2 - cx : 0;
  const ty = target ? target.top + target.height / 2 - cy : vp.h - cy;

  const material = app.material ?? 'mica';
  const radius = maximized || snapped ? 0 : undefined;
  const hiddenByMin = minimized && win.anim !== 'minimizing';

  const style = {
    left: rect.x,
    top: rect.y,
    width: rect.w,
    height: rect.h,
    zIndex: win.z,
    borderRadius: radius,
    '--wx': `${rect.x}px`,
    '--wy': `${rect.y}px`,
    '--min-tx': `${tx}px`,
    '--min-ty': `${ty}px`,
  } as React.CSSProperties;

  const classes = [
    'win',
    `mat-${material}`,
    active ? 'active' : 'inactive',
    maximized ? 'maximized' : '',
    snapped ? 'snapped' : '',
    animating ? 'geom-anim' : '',
    win.anim ? `anim-${win.anim}` : '',
    hiddenByMin ? 'min-hidden' : '',
    peek ? 'peek' : '',
  ].join(' ');

  return (
    <WindowContext.Provider value={api}>
      <div
        ref={ref}
        className={classes}
        style={style}
        data-win-id={win.id}
        data-app={win.appId}
        onPointerDown={onPointerDown}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
        onAnimationEnd={onAnimationEnd}
        aria-hidden={hiddenByMin}
      >
        <div className="win-bg" />
        <div className="win-body">
          {app.titlebar !== 'custom' && <TitleBar title={win.title} appId={win.appId} />}
          <div className="win-client">
            <Client appId={win.appId} winId={win.id} args={win.args} />
          </div>
        </div>
        <CaptionButtons
          winId={win.id}
          height={app.captionHeight ?? 32}
          maximized={maximized}
          active={active}
          minimizable={app.minimizable !== false}
          maximizable={app.maximizable !== false}
          theme={app.captionTheme}
        />
        {!maximized && app.resizable !== false && (
          <>
            {['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map((d) => (
              <div key={d} className={`rz rz-${d}`} onPointerDown={startResize(d)} />
            ))}
          </>
        )}
      </div>
    </WindowContext.Provider>
  );
}

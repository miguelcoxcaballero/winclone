import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  SearchRegular, ChevronUpRegular, Wifi1Regular, WifiOffRegular, Speaker2Regular, SpeakerMuteRegular, Speaker0Regular, Speaker1Regular,
  AlertRegular, AlertSnoozeRegular, PinRegular, PinOffRegular, DismissRegular, SettingsRegular, ArrowSyncRegular, AirplaneRegular,
  BluetoothRegular, ShieldCheckmarkRegular, UsbStickRegular, CloudRegular, WindowRegular,
} from '@fluentui/react-icons';
import { useWindows, type Win } from '@/core/store/windows';
import { useShell } from '@/core/store/shell';
import { useSettings } from '@/core/store/settings';
import { useNotifications } from '@/core/store/notifications';
import { getApp, preloadApp } from '@/apps/registry';
import { AppIcon } from '@/icons/AppIcons';
import { StartGlyph } from '@/icons/ShellIcons';
import { useNow } from '@/core/window-context';
import { snapshotWindow } from '../thumbnail';
import { BatteryGlyph, TaskViewGlyph, WeatherGlyph } from './glyphs';
import './taskbar.css';

function useBattery() {
  const [b, setB] = useState<{ level: number; charging: boolean }>({ level: 0.86, charging: false });
  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<any> };
    if (!nav.getBattery) return;
    let bat: any;
    const upd = () => setB({ level: bat.level, charging: bat.charging });
    nav.getBattery().then((x) => { bat = x; upd(); x.addEventListener('levelchange', upd); x.addEventListener('chargingchange', upd); }).catch(() => undefined);
    return () => { bat?.removeEventListener('levelchange', upd); bat?.removeEventListener('chargingchange', upd); };
  }, []);
  return b;
}
export { useBattery };

export function formatTime(d: Date, hour24: boolean, seconds = false) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', ...(seconds ? { second: '2-digit' } : {}), hour12: !hour24 });
}
export function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
}

/* ───────────────────────── Task button ───────────────────────── */
function TaskButton({ appId, wins, pinned }: { appId: string; wins: Win[]; pinned: boolean }) {
  const activeId = useWindows((s) => s.activeId);
  const ref = useRef<HTMLButtonElement>(null);
  const [preview, setPreview] = useState(false);
  const [bounce, setBounce] = useState(0);
  const hoverT = useRef<number>(0);
  const prevCount = useRef(wins.length);
  const app = getApp(appId)!;
  const running = wins.length > 0;
  const active = wins.some((w) => w.id === activeId);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const upd = () => useWindows.getState().setTaskbarTarget(appId, el.getBoundingClientRect());
    upd();
    const ro = new ResizeObserver(upd);
    ro.observe(document.body);
    const t = setInterval(upd, 1000);
    return () => { ro.disconnect(); clearInterval(t); };
  }, [appId]);

  useEffect(() => {
    if (wins.length > prevCount.current) setBounce((b) => b + 1);
    prevCount.current = wins.length;
  }, [wins.length]);

  const onClick = () => {
    setPreview(false);
    useShell.getState().closeFlyouts();
    const s = useWindows.getState();
    if (!running) { s.open(appId); return; }
    if (wins.length === 1) {
      const w = wins[0];
      if (w.state === 'minimized') s.restore(w.id);
      else if (w.id === activeId) s.minimize(w.id);
      else s.focus(w.id);
      return;
    }
    // multiple windows: cycle / show previews
    const top = [...wins].sort((a, b) => b.z - a.z);
    const cur = top.findIndex((w) => w.id === activeId);
    const next = top[(cur + 1) % top.length];
    if (next.state === 'minimized') s.restore(next.id); else s.focus(next.id);
  };

  const onContext = (e: React.MouseEvent) => {
    e.preventDefault();
    setPreview(false);
    const r = ref.current!.getBoundingClientRect();
    const st = useSettings.getState();
    const isPinned = st.pinnedTaskbar.includes(appId);
    useShell.getState().showContextMenu({
      x: r.left + r.width / 2 - 100, y: r.top - 8, placement: 'top',
      items: [
        { label: app.name, icon: <AppIcon appId={appId} size={16} />, onClick: () => useWindows.getState().open(appId) },
        isPinned
          ? { label: 'Unpin from taskbar', icon: <PinOffRegular />, onClick: () => st.set({ pinnedTaskbar: st.pinnedTaskbar.filter((x) => x !== appId) }) }
          : { label: 'Pin to taskbar', icon: <PinRegular />, onClick: () => st.set({ pinnedTaskbar: [...st.pinnedTaskbar, appId] }) },
        ...(running ? [{ label: wins.length > 1 ? 'Close all windows' : 'Close window', icon: <DismissRegular />, onClick: () => wins.forEach((w) => useWindows.getState().close(w.id)) }] : []),
      ],
    });
  };

  return (
    <div
      className="tb-task-wrap"
      onMouseEnter={() => { preloadApp(appId); clearTimeout(hoverT.current); hoverT.current = window.setTimeout(() => setPreview(true), running ? 350 : 700); }}
      onMouseLeave={() => { clearTimeout(hoverT.current); hoverT.current = window.setTimeout(() => setPreview(false), 150); }}
    >
      <button
        ref={ref}
        className={`tb-btn tb-task ${running ? 'running' : ''} ${active ? 'active' : ''}`}
        onClick={onClick}
        onContextMenu={onContext}
        aria-label={app.name}
        data-pinned={pinned}
      >
        <span key={bounce} className={`tb-icon ${bounce ? 'bounce' : ''}`}><AppIcon appId={appId} size={24} /></span>
        <span className="tb-ind" />
      </button>
      {preview && (
        running
          ? <TaskPreview wins={wins} anchor={ref.current!} onDone={() => setPreview(false)} />
          : <div className="tb-tooltip" style={{ left: '50%' }}>{app.name}</div>
      )}
    </div>
  );
}

function TaskPreview({ wins, anchor, onDone }: { wins: Win[]; anchor: HTMLElement; onDone: () => void }) {
  const r = anchor.getBoundingClientRect();
  const activeId = useWindows((s) => s.activeId);
  return (
    <div className="tb-preview" style={{ left: r.left + r.width / 2 }} onMouseDown={(e) => e.stopPropagation()}>
      {wins.map((w) => (
        <div
          key={w.id}
          className={`tb-preview-card ${w.id === activeId ? 'current' : ''}`}
          onClick={() => {
            const s = useWindows.getState();
            if (w.state === 'minimized') s.restore(w.id); else s.focus(w.id);
            onDone();
          }}
        >
          <div className="tb-preview-head">
            <AppIcon appId={w.appId} size={16} />
            <span className="tb-preview-title">{w.title}</span>
            <button className="tb-preview-close" onClick={(e) => { e.stopPropagation(); useWindows.getState().close(w.id); }}>
              <DismissRegular />
            </button>
          </div>
          <PreviewThumb winId={w.id} />
        </div>
      ))}
    </div>
  );
}

function PreviewThumb({ winId }: { winId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const snap = snapshotWindow(winId, 200, 112);
    el.innerHTML = '';
    if (snap) el.appendChild(snap);
  }, [winId]);
  return <div ref={ref} className="tb-preview-thumb" />;
}

/* ───────────────────────── Taskbar ───────────────────────── */
export function Taskbar() {
  const s = useSettings();
  const windows = useWindows((st) => st.windows);
  const flyout = useShell((st) => st.flyout);
  const now = useNow(1000);
  const battery = useBattery();
  const notifCount = useNotifications((n) => n.items.length);
  const [trayOpen, setTrayOpen] = useState(false);
  const [showDesktopState, setShowDesktopState] = useState<string[] | null>(null);

  const live = windows.filter((w) => w.anim !== 'closing');
  const order: string[] = [...s.pinnedTaskbar];
  live.forEach((w) => { if (!order.includes(w.appId)) order.push(w.appId); });

  const toggle = (f: Parameters<ReturnType<typeof useShell.getState>['toggle']>[0]) => useShell.getState().toggle(f);

  const onTaskbarContext = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.tb-btn, .tb-search')) return;
    e.preventDefault();
    useShell.getState().showContextMenu({
      x: e.clientX, y: e.clientY - 4, placement: 'top',
      items: [
        { label: 'Task Manager', icon: <WindowRegular />, onClick: () => useWindows.getState().open('taskmgr') },
        { separator: true },
        { label: 'Taskbar settings', icon: <SettingsRegular />, onClick: () => useWindows.getState().open('settings', { page: 'taskbar' }) },
      ],
    });
  };

  const showDesktop = () => {
    useShell.getState().closeFlyouts();
    const st = useWindows.getState();
    if (showDesktopState) {
      showDesktopState.forEach((id) => st.restore(id));
      setShowDesktopState(null);
    } else {
      const vis = st.windows.filter((w) => w.state !== 'minimized').map((w) => w.id);
      st.minimizeAll();
      setShowDesktopState(vis);
    }
  };
  // Any window activity cancels the "show desktop" toggle state
  useEffect(() => { if (showDesktopState && windows.some((w) => w.state !== 'minimized')) setShowDesktopState(null); }, [windows]); // eslint-disable-line

  const volIcon = s.muted || s.volume === 0 ? <SpeakerMuteRegular /> : s.volume < 34 ? <Speaker0Regular /> : s.volume < 67 ? <Speaker1Regular /> : <Speaker2Regular />;
  const center = s.taskbarAlign === 'center';

  const widgets = s.taskbarWidgets && (
    <button className={`tb-btn tb-widgets ${center ? 'wide' : ''} ${flyout === 'widgets' ? 'pressed' : ''}`} onClick={() => toggle('widgets')} aria-label="Widgets">
      <WeatherGlyph size={24} />
      {center && (
        <span className="tb-widgets-text">
          <span className="tb-widgets-temp">72°F</span>
          <span className="tb-widgets-cond">Mostly sunny</span>
        </span>
      )}
    </button>
  );

  return (
    <div className={`taskbar ${center ? 'centered' : 'left'}`} onContextMenu={onTaskbarContext} onPointerDown={(e) => { if (e.target === e.currentTarget) useShell.getState().closeFlyouts(); }}>
      {center && <div className="tb-left">{widgets}</div>}
      <div className="tb-center">
        <button className={`tb-btn tb-start ${flyout === 'start' ? 'pressed' : ''}`} onClick={() => toggle('start')} aria-label="Start">
          <span className="tb-icon"><StartGlyph size={24} /></span>
        </button>
        {s.taskbarSearch === 'box' && (
          <button className={`tb-search ${flyout === 'search' ? 'pressed' : ''}`} onClick={() => toggle('search')}>
            <SearchRegular className="tb-search-ic" />
            <span>Search</span>
          </button>
        )}
        {(s.taskbarSearch === 'icon' || s.taskbarSearch === 'iconlabel') && (
          <button className={`tb-btn ${s.taskbarSearch === 'iconlabel' ? 'tb-search-label' : ''} ${flyout === 'search' ? 'pressed' : ''}`} onClick={() => toggle('search')} aria-label="Search">
            <span className="tb-icon"><SearchRegular className="tb-glyph" /></span>
            {s.taskbarSearch === 'iconlabel' && <span className="tb-label">Search</span>}
          </button>
        )}
        {s.taskbarTaskView && (
          <button className={`tb-btn ${flyout === 'taskview' ? 'pressed' : ''}`} onClick={() => toggle('taskview')} aria-label="Task View">
            <span className="tb-icon"><TaskViewGlyph size={24} /></span>
          </button>
        )}
        {!center && widgets}
        {order.map((appId) => (
          <TaskButton key={appId} appId={appId} wins={live.filter((w) => w.appId === appId)} pinned={s.pinnedTaskbar.includes(appId)} />
        ))}
      </div>

      <div className="tb-right">
        <div className="tb-tray-wrap">
          <button className={`tb-btn tb-chevron ${trayOpen ? 'pressed' : ''}`} onClick={() => setTrayOpen((o) => !o)} aria-label="Show hidden icons">
            <ChevronUpRegular className={`tb-glyph-sm ${trayOpen ? 'flip' : ''}`} />
          </button>
          {trayOpen && <TrayOverflow onClose={() => setTrayOpen(false)} />}
        </div>
        <button className={`tb-btn tb-status ${flyout === 'quick' ? 'pressed' : ''}`} onClick={() => toggle('quick')} aria-label="Network, Volume, Battery">
          {s.airplane ? <AirplaneRegular className="tb-glyph-sm" /> : s.wifi ? <Wifi1Regular className="tb-glyph-sm" /> : <WifiOffRegular className="tb-glyph-sm" />}
          <span className="tb-glyph-sm">{volIcon}</span>
          <BatteryGlyph level={battery.level} charging={battery.charging} saver={s.batterySaver || s.energySaver} />
        </button>
        <button className={`tb-btn tb-clock ${flyout === 'notifications' ? 'pressed' : ''}`} onClick={() => toggle('notifications')} aria-label="Clock and notifications">
          <span className="tb-clock-text">
            <span>{formatTime(now, s.hour24, s.showSecondsInClock)}</span>
            <span>{formatDate(now)}</span>
          </span>
          {s.doNotDisturb ? <AlertSnoozeRegular className="tb-glyph-sm tb-bell" /> : notifCount > 0 ? <span className="tb-badge">{notifCount}</span> : <AlertRegular className="tb-glyph-sm tb-bell" />}
        </button>
        <button className="tb-show-desktop" onClick={showDesktop} aria-label="Show desktop" title="Show desktop" />
      </div>
    </div>
  );
}

function TrayOverflow({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const h = (e: PointerEvent) => { if (!(e.target as HTMLElement).closest('.tb-tray-wrap')) onClose(); };
    window.addEventListener('pointerdown', h, true);
    return () => window.removeEventListener('pointerdown', h, true);
  }, [onClose]);
  const icons = [
    { icon: <ShieldCheckmarkRegular />, label: 'Security: No actions needed' },
    { icon: <CloudRegular />, label: 'Cloud storage – Up to date' },
    { icon: <BluetoothRegular />, label: 'Bluetooth Devices' },
    { icon: <UsbStickRegular />, label: 'Safely Remove Hardware and Eject Media' },
    { icon: <ArrowSyncRegular />, label: 'Sync – Up to date' },
  ];
  return (
    <div className="tb-tray-flyout">
      {icons.map((i) => (
        <button key={i.label} className="tb-tray-item" title={i.label}>{i.icon}</button>
      ))}
    </div>
  );
}

import { useEffect } from 'react';
import { ThemeManager, DisplayFilters } from './ThemeManager';
import { Desktop } from './desktop/Desktop';
import { Taskbar } from './taskbar/Taskbar';
import { StartMenu } from './start/StartMenu';
import { Window } from './window/Window';
import { ContextMenuLayer } from './ContextMenu';
import { QuickSettings } from './flyouts/QuickSettings';
import { NotificationCenter } from './flyouts/NotificationCenter';
import { Widgets } from './flyouts/Widgets';
import { SearchPanel } from './flyouts/SearchPanel';
import { TaskView } from './flyouts/TaskView';
import { Toasts } from './flyouts/Toasts';
import { LockScreen } from './screens/LockScreen';
import { LoginScreen } from './screens/LoginScreen';
import { PowerScreens } from './screens/PowerScreens';
import { RunDialog } from './screens/RunDialog';
import { useWindows } from '@/core/store/windows';
import { useShell } from '@/core/store/shell';
import { useSettings } from '@/core/store/settings';
import './shell.css';

function WindowLayer() {
  const windows = useWindows((s) => s.windows);
  return (
    <div className="window-layer">
      {windows.map((w) => <Window key={w.id} win={w} />)}
    </div>
  );
}

function SnapPreview() {
  const r = useShell((s) => s.snapPreview);
  if (!r) return null;
  return <div className="snap-preview" style={{ left: r.x + 6, top: r.y + 6, width: r.w - 12, height: r.h - 12 }} />;
}

function useGlobalShortcuts() {
  useEffect(() => {
    let metaAlone = false;
    const down = (e: KeyboardEvent) => {
      const shell = useShell.getState();
      const wins = useWindows.getState();
      if (shell.phase !== 'desktop') return;
      if (e.key === 'Meta' || e.key === 'OS') { metaAlone = true; return; }
      if (e.metaKey) metaAlone = false;
      const k = e.key.toLowerCase();
      const active = wins.activeId;
      if (e.ctrlKey && e.shiftKey && e.key === 'Escape') { e.preventDefault(); wins.open('taskmgr'); return; }
      if (e.ctrlKey && e.key === 'Escape') { e.preventDefault(); shell.toggle('start'); return; }
      if (e.key === 'Escape' && shell.flyout) { shell.closeFlyouts(); return; }
      if (!e.metaKey) return;
      const handled = () => { e.preventDefault(); e.stopPropagation(); };
      switch (k) {
        case 'd': handled(); wins.minimizeAll(); break;
        case 'm': handled(); wins.minimizeAll(); break;
        case 'e': handled(); wins.open('explorer'); break;
        case 'r': handled(); shell.setRunOpen(true); break;
        case 'i': handled(); wins.open('settings'); break;
        case 'a': handled(); shell.toggle('quick'); break;
        case 'n': handled(); shell.toggle('notifications'); break;
        case 'w': handled(); shell.toggle('widgets'); break;
        case 's': handled(); shell.toggle('search'); break;
        case 'tab': handled(); shell.toggle('taskview'); break;
        case 'l': handled(); shell.setPhase('lock'); break;
        case 'arrowup': if (active) { handled(); wins.maximize(active); } break;
        case 'arrowdown': if (active) {
          handled();
          const w = wins.windows.find((x) => x.id === active);
          if (w?.state === 'maximized' || w?.snap) { if (w.snap) wins.unsnap(active); else wins.toggleMaximize(active); } else wins.minimize(active);
        } break;
        case 'arrowleft': if (active) { handled(); wins.snapTo(active, 'left'); } break;
        case 'arrowright': if (active) { handled(); wins.snapTo(active, 'right'); } break;
      }
    };
    const up = (e: KeyboardEvent) => {
      if ((e.key === 'Meta' || e.key === 'OS') && metaAlone && useShell.getState().phase === 'desktop') {
        useShell.getState().toggle('start');
      }
      metaAlone = false;
    };
    window.addEventListener('keydown', down, true);
    window.addEventListener('keyup', up, true);
    return () => { window.removeEventListener('keydown', down, true); window.removeEventListener('keyup', up, true); };
  }, []);
}

export function App() {
  const phase = useShell((s) => s.phase);
  const animations = useSettings((s) => s.animations);
  useGlobalShortcuts();
  void animations;

  // Block the browser's own context menu everywhere except text inputs
  useEffect(() => {
    const h = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, [contenteditable="true"], iframe')) return;
      e.preventDefault();
    };
    window.addEventListener('contextmenu', h);
    return () => window.removeEventListener('contextmenu', h);
  }, []);

  const desktopVisible = phase === 'desktop' || phase === 'locking' || phase === 'signing-out' || phase === 'shutting-down' || phase === 'restarting' || phase === 'lock' || phase === 'login' || phase === 'signing-in';

  return (
    <div className={`shell phase-${phase}`}>
      <ThemeManager />
      {desktopVisible && (
        <div className="session">
          <Desktop />
          <WindowLayer />
          <SnapPreview />
          <Widgets />
          <TaskView />
          <Taskbar />
          <StartMenu />
          <SearchPanel />
          <QuickSettings />
          <NotificationCenter />
          <Toasts />
          <RunDialog />
        </div>
      )}
      <LockScreen />
      <LoginScreen />
      <PowerScreens />
      <ContextMenuLayer />
      <div id="overlay-root" />
      <DisplayFilters />
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SearchRegular, PowerRegular, ChevronRightRegular, ChevronLeftRegular, LockClosedRegular, ArrowExitRegular,
  PersonRegular, WeatherMoonRegular, ArrowClockwiseRegular, PinRegular, PinOffRegular, SettingsRegular, DeleteRegular,
  ArrowUpRegular, FolderOpenRegular, ShieldRegular, MoreHorizontalRegular, KeyRegular,
} from '@fluentui/react-icons';
import { useShell } from '@/core/store/shell';
import { useSettings } from '@/core/store/settings';
import { useFS, FS, type FSNode } from '@/core/store/fs';
import { openApp } from '@/core/store/windows';
import { openNode } from '@/core/launch';
import { usePresence, useFlyoutDismiss } from '@/core/hooks';
import { getApp, listApps, preloadApp } from '@/apps/registry';
import { AppIcon } from '@/icons/AppIcons';
import { AvatarIcon, NodeIcon } from '@/icons/ShellIcons';
import type { MenuItem } from '@/core/types';
import './start.css';

function relTime(t: number) {
  const diff = Date.now() - t;
  const m = Math.round(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = new Date(t);
  const now = new Date();
  if (now.getFullYear() === d.getFullYear()) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function StartMenu() {
  const ref = useRef<HTMLDivElement>(null);
  const open = useFlyoutDismiss(ref, 'start', '.tb-start');
  const { mounted, state } = usePresence(open, 170);
  const view = useShell((s) => s.startView);
  const align = useSettings((s) => s.taskbarAlign);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as HTMLElement).closest('input, textarea')) return;
      if (e.key.length === 1 && /\S/.test(e.key)) {
        e.preventDefault();
        useShell.getState().setSearchQuery(e.key);
        useShell.getState().open('search');
        useShell.getState().setSearchQuery(e.key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!mounted) return null;
  return (
    <div ref={ref} className={`sm ${state} ${align === 'left' ? 'sm-left' : ''}`} onContextMenu={(e) => e.preventDefault()}>
      <div className="sm-top">
        <button
          className="sm-search"
          onClick={() => { useShell.getState().open('search'); }}
        >
          <SearchRegular className="sm-search-ic" />
          <span>Search for apps, settings, and documents</span>
        </button>
      </div>
      <div className="sm-views">
        <div className={`sm-view sm-main ${view === 'pinned' ? 'shown' : 'hidden-left'}`} aria-hidden={view !== 'pinned'}>
          <PinnedSection />
          <RecommendedSection />
        </div>
        <div className={`sm-view sm-all ${view === 'all' ? 'shown' : 'hidden-right'}`} aria-hidden={view !== 'all'}>
          {view === 'all' && <AllApps />}
        </div>
      </div>
      <Footer />
    </div>
  );
}

/* ───────────────────────── Pinned ───────────────────────── */
function PinnedSection() {
  const pinned = useSettings((s) => s.pinnedStart).filter((id) => getApp(id));
  const layout = useSettings((s) => s.startLayout);
  const showRec = useSettings((s) => s.startShowRecommended || s.startShowRecentlyAdded);
  const rows = layout === 'more-pins' ? 4 : layout === 'more-recs' ? 2 : 3;
  const perPage = 6 * (showRec ? rows : rows + 2);
  const pages = Math.max(1, Math.ceil(pinned.length / perPage));
  const [page, setPage] = useState(0);
  const wheelLock = useRef(0);
  const p = Math.min(page, pages - 1);

  const onWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - wheelLock.current < 450 || Math.abs(e.deltaY) < 4) return;
    wheelLock.current = now;
    setPage((x) => Math.max(0, Math.min(pages - 1, x + (e.deltaY > 0 ? 1 : -1))));
  };

  const menuFor = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const s = useSettings.getState();
    const onTaskbar = s.pinnedTaskbar.includes(id);
    useShell.getState().showContextMenu({
      x: e.clientX, y: e.clientY,
      items: [
        { label: 'Unpin from Start', icon: <PinOffRegular />, onClick: () => s.set({ pinnedStart: s.pinnedStart.filter((x) => x !== id) }) },
        { label: 'Move to front', icon: <ArrowUpRegular />, disabled: s.pinnedStart[0] === id, onClick: () => s.set({ pinnedStart: [id, ...s.pinnedStart.filter((x) => x !== id)] }) },
        onTaskbar
          ? { label: 'Unpin from taskbar', icon: <PinOffRegular />, onClick: () => s.set({ pinnedTaskbar: s.pinnedTaskbar.filter((x) => x !== id) }) }
          : { label: 'Pin to taskbar', icon: <PinRegular />, onClick: () => s.set({ pinnedTaskbar: [...s.pinnedTaskbar, id] }) },
        { separator: true },
        { label: 'App settings', icon: <SettingsRegular />, onClick: () => { useShell.getState().closeFlyouts(); openApp('settings', { page: 'installed-apps' }); } },
        { label: 'Uninstall', icon: <DeleteRegular />, disabled: true },
      ],
    });
  };

  return (
    <section className={`sm-pinned rows-${showRec ? rows : rows + 2}`}>
      <div className="sm-head">
        <span className="sm-head-title">Pinned</span>
        <button className="sm-head-btn" onClick={() => useShell.getState().setStartView('all')}>
          All <ChevronRightRegular />
        </button>
      </div>
      <div className="sm-pin-pages" onWheel={onWheel}>
        <div className="sm-pin-track" style={{ transform: `translateY(${-p * 100}%)` }}>
          {Array.from({ length: pages }, (_, i) => (
            <div key={i} className="sm-pin-grid">
              {pinned.slice(i * perPage, (i + 1) * perPage).map((id) => {
                const app = getApp(id)!;
                return (
                  <button
                    key={id}
                    className="sm-tile"
                    onClick={() => { useShell.getState().closeFlyouts(); openApp(id); }}
                    onContextMenu={(e) => menuFor(e, id)}
                    onMouseEnter={() => preloadApp(id)}
                    title={app.name}
                  >
                    <AppIcon appId={id} size={32} />
                    <span className="sm-tile-label">{app.name}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        {pages > 1 && (
          <div className="sm-dots">
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} className={`sm-dot ${i === p ? 'on' : ''}`} onClick={() => setPage(i)} aria-label={`Page ${i + 1}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ───────────────────────── Recommended ───────────────────────── */
function RecommendedSection() {
  const nodes = useFS((s) => s.nodes);
  const show = useSettings((s) => s.startShowRecommended || s.startShowRecentlyAdded);
  const layout = useSettings((s) => s.startLayout);
  const max = layout === 'more-recs' ? 8 : layout === 'more-pins' ? 2 : 6;

  const recent: FSNode[] = useMemo(() => {
    const isInRecycle = (n: FSNode) => n.parent === FS.recycle;
    return Object.values(nodes)
      .filter((n) => n.type === 'file' && !n.system && !isInRecycle(n) && !n.hidden)
      .sort((a, b) => b.modified - a.modified)
      .slice(0, max);
  }, [nodes, max]);

  if (!show) {
    return (
      <section className="sm-rec">
        <div className="sm-head"><span className="sm-head-title">Recommended</span></div>
        <div className="sm-rec-empty">
          To show your recent files and new apps, turn them on in Settings.
          <button className="sm-link" onClick={() => { useShell.getState().closeFlyouts(); openApp('settings', { page: 'start' }); }}>Launch Start settings.</button>
        </div>
      </section>
    );
  }

  return (
    <section className="sm-rec">
      <div className="sm-head">
        <span className="sm-head-title">Recommended</span>
        <button className="sm-head-btn" onClick={() => { useShell.getState().closeFlyouts(); openApp('explorer', { folderId: FS.documents }); }}>
          More <ChevronRightRegular />
        </button>
      </div>
      <div className="sm-rec-grid">
        {recent.map((n) => (
          <button
            key={n.id}
            className="sm-rec-item"
            onClick={() => { useShell.getState().closeFlyouts(); openNode(n); }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              useShell.getState().showContextMenu({
                x: e.clientX, y: e.clientY,
                items: [
                  { label: 'Open file location', icon: <FolderOpenRegular />, onClick: () => { useShell.getState().closeFlyouts(); openApp('explorer', { folderId: n.parent }); } },
                  { label: 'Remove from list', icon: <DeleteRegular />, onClick: () => undefined },
                ],
              });
            }}
          >
            <NodeIcon node={n} size={32} />
            <span className="sm-rec-text">
              <span className="sm-rec-name">{n.name}</span>
              <span className="sm-rec-sub">{relTime(n.modified)}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── All apps ───────────────────────── */
function AllApps() {
  const apps = listApps();
  const [jump, setJump] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const groups = useMemo(() => {
    const m = new Map<string, typeof apps>();
    apps.forEach((a) => {
      const ch = a.name[0].toUpperCase();
      const k = /[A-Z]/.test(ch) ? ch : '#';
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(a);
    });
    return [...m.entries()];
  }, [apps]);

  const menuFor = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const s = useSettings.getState();
    const pinned = s.pinnedStart.includes(id);
    const onTaskbar = s.pinnedTaskbar.includes(id);
    const more: MenuItem[] = [
      onTaskbar
        ? { label: 'Unpin from taskbar', icon: <PinOffRegular />, onClick: () => s.set({ pinnedTaskbar: s.pinnedTaskbar.filter((x) => x !== id) }) }
        : { label: 'Pin to taskbar', icon: <PinRegular />, onClick: () => s.set({ pinnedTaskbar: [...s.pinnedTaskbar, id] }) },
      { label: 'App settings', icon: <SettingsRegular />, onClick: () => { useShell.getState().closeFlyouts(); openApp('settings', { page: 'installed-apps' }); } },
      { label: 'Run as administrator', icon: <ShieldRegular />, onClick: () => { useShell.getState().closeFlyouts(); openApp(id); } },
      { label: 'Open file location', icon: <FolderOpenRegular />, onClick: () => { useShell.getState().closeFlyouts(); openApp('explorer', { folderId: FS.programFiles }); } },
    ];
    useShell.getState().showContextMenu({
      x: e.clientX, y: e.clientY,
      items: [
        pinned
          ? { label: 'Unpin from Start', icon: <PinOffRegular />, onClick: () => s.set({ pinnedStart: s.pinnedStart.filter((x) => x !== id) }) }
          : { label: 'Pin to Start', icon: <PinRegular />, onClick: () => s.set({ pinnedStart: [...s.pinnedStart, id] }) },
        { label: 'More', icon: <MoreHorizontalRegular />, submenu: more },
        { label: 'Uninstall', icon: <DeleteRegular />, disabled: true },
      ],
    });
  };

  return (
    <section className="sm-allapps">
      <div className="sm-head">
        <span className="sm-head-title">All</span>
        <button className="sm-head-btn back" onClick={() => useShell.getState().setStartView('pinned')}>
          <ChevronLeftRegular /> Back
        </button>
      </div>
      {jump ? (
        <div className="sm-jump">
          {['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((L) => {
            const has = groups.some(([k]) => k === L);
            return (
              <button
                key={L}
                className="sm-jump-letter"
                disabled={!has}
                onClick={() => {
                  setJump(false);
                  requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-letter="${L}"]`)?.scrollIntoView({ block: 'start' }));
                }}
              >
                {L}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="sm-applist" ref={listRef}>
          {groups.map(([letter, list]) => (
            <div key={letter}>
              <button className="sm-letter" data-letter={letter} onClick={() => setJump(true)}>{letter}</button>
              {list.map((a) => (
                <button
                  key={a.id}
                  className="sm-app"
                  onClick={() => { useShell.getState().closeFlyouts(); openApp(a.id); }}
                  onContextMenu={(e) => menuFor(e, a.id)}
                  onMouseEnter={() => preloadApp(a.id)}
                >
                  <AppIcon appId={a.id} size={24} />
                  <span>{a.name}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ───────────────────────── Footer ───────────────────────── */
function Footer() {
  const userName = useSettings((s) => s.userName);
  const avatar = useSettings((s) => s.userAvatar);
  const [menu, setMenu] = useState<'user' | 'power' | null>(null);
  const userRef = useRef<HTMLButtonElement>(null);
  const powerRef = useRef<HTMLButtonElement>(null);

  const go = (phase: Parameters<ReturnType<typeof useShell.getState>['setPhase']>[0]) => {
    setMenu(null);
    useShell.getState().closeFlyouts();
    setTimeout(() => useShell.getState().setPhase(phase), 120);
  };

  const showMenu = (which: 'user' | 'power') => {
    const el = (which === 'user' ? userRef : powerRef).current!;
    const r = el.getBoundingClientRect();
    setMenu(which);
    const items: MenuItem[] = which === 'power'
      ? [
        { label: 'Sign-in options', icon: <KeyRegular />, onClick: () => { useShell.getState().closeFlyouts(); openApp('settings', { page: 'signin' }); } },
        { separator: true },
        { label: 'Lock', icon: <LockClosedRegular />, onClick: () => go('lock') },
        { label: 'Sleep', icon: <WeatherMoonRegular />, onClick: () => go('sleep') },
        { label: 'Shut down', icon: <PowerRegular />, onClick: () => go('shutting-down') },
        { label: 'Restart', icon: <ArrowClockwiseRegular />, onClick: () => go('restarting') },
      ]
      : [
        { label: 'Change account settings', icon: <PersonRegular />, onClick: () => { useShell.getState().closeFlyouts(); openApp('settings', { page: 'your-info' }); } },
        { label: 'Lock', icon: <LockClosedRegular />, onClick: () => go('lock') },
        { label: 'Sign out', icon: <ArrowExitRegular />, onClick: () => go('signing-out') },
      ];
    useShell.getState().showContextMenu({ x: which === 'power' ? r.right - 220 : r.left, y: r.top - 4, placement: 'top', items });
  };

  const cm = useShell((s) => s.contextMenu);
  useEffect(() => { if (!cm) setMenu(null); }, [cm]);

  return (
    <div className="sm-footer">
      <button ref={userRef} className={`sm-user ${menu === 'user' ? 'pressed' : ''}`} onClick={() => showMenu('user')}>
        {avatar ? <img src={avatar} alt="" className="sm-avatar" /> : <AvatarIcon size={32} />}
        <span>{userName}</span>
      </button>
      <button ref={powerRef} className={`sm-power ${menu === 'power' ? 'pressed' : ''}`} onClick={() => showMenu('power')} aria-label="Power">
        <PowerRegular />
      </button>
    </div>
  );
}

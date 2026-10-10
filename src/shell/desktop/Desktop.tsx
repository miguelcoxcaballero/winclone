import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CutRegular, CopyRegular, RenameRegular, ShareRegular, DeleteRegular, GridRegular, ArrowSortRegular,
  ArrowClockwiseRegular, AddCircleRegular, DesktopRegular, PaintBrushRegular, WindowConsoleRegular,
  ArrowExportUpRegular, FolderRegular, DocumentTextRegular, OpenRegular, PinRegular, InfoRegular,
  ClipboardPasteRegular, FolderZipRegular, LinkRegular, ImageRegular, AppsListRegular,
} from '@fluentui/react-icons';
import { useSettings } from '@/core/store/settings';
import { useFS, FS, type FSNode } from '@/core/store/fs';
import { useShell } from '@/core/store/shell';
import { openApp } from '@/core/store/windows';
import { openNode } from '@/core/launch';
import { NodeIcon, RecycleBinIcon, ThisPCIcon, NetworkIcon, ControlPanelIcon, SpecialFolderIcon } from '@/icons/ShellIcons';
import type { MenuItem } from '@/core/types';
import './desktop.css';

interface DItem {
  key: string;
  name: string;
  node?: FSNode;
  system?: 'recycle' | 'computer' | 'user' | 'network' | 'control';
}

const SIZES = {
  small: { cellW: 76, cellH: 62, icon: 32 },
  medium: { cellW: 76, cellH: 94, icon: 48 },
  large: { cellW: 116, cellH: 134, icon: 96 },
};

export function Desktop() {
  const settings = useSettings();
  const nodes = useFS((s) => s.nodes);
  const fsApi = useFS.getState;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [renaming, setRenaming] = useState<string | null>(null);
  const [marquee, setMarquee] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [dragging, setDragging] = useState<{ keys: string[]; dx: number; dy: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const size = SIZES[settings.desktopIconSize];

  const recycleFull = useMemo(() => Object.values(nodes).some((n) => n.parent === FS.recycle), [nodes]);

  const items: DItem[] = useMemo(() => {
    const sys = settings.desktopSystemIcons;
    const out: DItem[] = [];
    if (sys.computer) out.push({ key: 'sys:computer', name: 'This PC', system: 'computer' });
    if (sys.user) out.push({ key: 'sys:user', name: settings.userName, system: 'user' });
    if (sys.network) out.push({ key: 'sys:network', name: 'Network', system: 'network' });
    if (sys.recycle) out.push({ key: 'sys:recycle', name: 'Recycle Bin', system: 'recycle' });
    if (sys.control) out.push({ key: 'sys:control', name: 'Control Panel', system: 'control' });
    const files = Object.values(nodes).filter((n) => n.parent === FS.desktop && !n.hidden);
    files.sort((a, b) => a.created - b.created || a.name.localeCompare(b.name));
    files.forEach((n) => out.push({ key: n.id, name: n.name, node: n }));
    return out;
  }, [nodes, settings.desktopSystemIcons, settings.userName]);

  // Compute grid positions: stored ones first, then fill free cells column-major.
  const rows = Math.max(1, Math.floor((window.innerHeight - 48 - 4) / size.cellH));
  const positions = useMemo(() => {
    const taken = new Set<string>();
    const pos: Record<string, { col: number; row: number }> = {};
    const stored = settings.desktopAutoArrange ? {} : settings.desktopPositions;
    items.forEach((it) => {
      const p = stored[it.key];
      if (p && p.row < rows && !taken.has(`${p.col},${p.row}`)) {
        pos[it.key] = p;
        taken.add(`${p.col},${p.row}`);
      }
    });
    let c = 0, r = 0;
    items.forEach((it) => {
      if (pos[it.key]) return;
      while (taken.has(`${c},${r}`)) { r++; if (r >= rows) { r = 0; c++; } }
      pos[it.key] = { col: c, row: r };
      taken.add(`${c},${r}`);
    });
    return pos;
  }, [items, settings.desktopPositions, settings.desktopAutoArrange, rows]);

  const openItem = (it: DItem) => {
    if (it.system === 'recycle') return openApp('explorer', { folderId: FS.recycle });
    if (it.system === 'computer') return openApp('explorer', { folderId: FS.root });
    if (it.system === 'user') return openApp('explorer', { folderId: FS.user });
    if (it.system === 'network') return openApp('explorer', { folderId: FS.root });
    if (it.system === 'control') return openApp('settings');
    if (it.node) openNode(it.node);
  };

  const deleteSel = useCallback(() => {
    selected.forEach((k) => { if (!k.startsWith('sys:')) fsApi().remove(k); });
    setSelected(new Set());
  }, [selected, fsApi]);

  // Keyboard handling when the desktop has focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement !== ref.current) return;
      if (e.key === 'Delete') deleteSel();
      if (e.key === 'F2' && selected.size === 1) setRenaming([...selected][0]);
      if (e.key === 'Enter') items.filter((i) => selected.has(i.key)).forEach(openItem);
      if (e.key === 'F5') setRefreshKey((k) => k + 1);
      if (e.ctrlKey && e.key.toLowerCase() === 'a') { e.preventDefault(); setSelected(new Set(items.map((i) => i.key))); }
      if (e.ctrlKey && e.key.toLowerCase() === 'c') fsApi().setClipboard({ ids: [...selected].filter((k) => !k.startsWith('sys:')), mode: 'copy' });
      if (e.ctrlKey && e.key.toLowerCase() === 'x') fsApi().setClipboard({ ids: [...selected].filter((k) => !k.startsWith('sys:')), mode: 'cut' });
      if (e.ctrlKey && e.key.toLowerCase() === 'v') fsApi().paste(FS.desktop);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  /* ───────── background pointer: marquee selection ───────── */
  const onBgPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.d-item')) return;
    useShell.getState().closeFlyouts();
    ref.current?.focus();
    if (e.button !== 0) return;
    if (!e.ctrlKey) setSelected(new Set());
    setRenaming(null);
    const x0 = e.clientX, y0 = e.clientY;
    const base = e.ctrlKey ? new Set(selected) : new Set<string>();
    const move = (ev: PointerEvent) => {
      const m = { x0, y0, x1: ev.clientX, y1: ev.clientY };
      setMarquee(m);
      const l = Math.min(m.x0, m.x1), r = Math.max(m.x0, m.x1), t = Math.min(m.y0, m.y1), b = Math.max(m.y0, m.y1);
      const sel = new Set(base);
      items.forEach((it) => {
        const p = positions[it.key];
        const ix = 2 + p.col * size.cellW + 4, iy = 2 + p.row * size.cellH + 2;
        const iw = size.cellW - 8, ih = size.icon + 30;
        if (ix < r && ix + iw > l && iy < b && iy + ih > t) sel.add(it.key);
      });
      setSelected(sel);
    };
    const up = () => {
      setMarquee(null);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  /* ───────── item pointer: select + drag to move ───────── */
  const onItemPointerDown = (e: React.PointerEvent, it: DItem) => {
    e.stopPropagation();
    useShell.getState().closeFlyouts();
    ref.current?.focus();
    if (renaming === it.key) return;
    let sel = selected;
    if (e.ctrlKey) {
      sel = new Set(selected);
      if (sel.has(it.key)) sel.delete(it.key); else sel.add(it.key);
      setSelected(sel);
    } else if (!selected.has(it.key)) {
      sel = new Set([it.key]);
      setSelected(sel);
    }
    if (e.button !== 0) return;
    const sx = e.clientX, sy = e.clientY;
    let moved = false;
    const keys = [...sel];
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      moved = true;
      setDragging({ keys, dx, dy });
      // drop target detection
      const el = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.d-item') as HTMLElement | null;
      const k = el?.dataset.key;
      const target = items.find((i) => i.key === k);
      setDropTarget(target && !keys.includes(target.key) && (target.system === 'recycle' || target.node?.type === 'folder') ? target.key : null);
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setDragging(null);
      setDropTarget(null);
      if (!moved) {
        if (!e.ctrlKey && !e.shiftKey) setSelected(new Set([it.key]));
        return;
      }
      const el = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.d-item') as HTMLElement | null;
      const tk = el?.dataset.key;
      const target = items.find((i) => i.key === tk);
      if (target && !keys.includes(target.key)) {
        if (target.system === 'recycle') { keys.forEach((k) => !k.startsWith('sys:') && fsApi().remove(k)); setSelected(new Set()); return; }
        if (target.node?.type === 'folder') { keys.forEach((k) => !k.startsWith('sys:') && fsApi().move(k, target.node!.id)); setSelected(new Set()); return; }
      }
      // Reposition on the grid
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      const newPos = { ...settings.desktopPositions };
      Object.entries(positions).forEach(([k, p]) => { if (!newPos[k]) newPos[k] = p; });
      const occupied = new Map<string, string>();
      Object.entries(newPos).forEach(([k, p]) => { if (!keys.includes(k)) occupied.set(`${p.col},${p.row}`, k); });
      const maxCol = Math.max(0, Math.floor(window.innerWidth / size.cellW) - 1);
      keys.forEach((k) => {
        const p = positions[k];
        let col = Math.max(0, Math.min(maxCol, Math.round((p.col * size.cellW + dx) / size.cellW)));
        let row = Math.max(0, Math.min(rows - 1, Math.round((p.row * size.cellH + dy) / size.cellH)));
        while (occupied.has(`${col},${row}`)) { row++; if (row >= rows) { row = 0; col++; } }
        occupied.set(`${col},${row}`, k);
        newPos[k] = { col, row };
      });
      useSettings.getState().set({ desktopPositions: newPos, desktopAutoArrange: false });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  /* ───────── context menus ───────── */
  const newItems: MenuItem[] = [
    { label: 'Folder', icon: <FolderRegular />, onClick: () => { const id = fsApi().createFolder(FS.desktop); setSelected(new Set([id])); setRenaming(id); } },
    { label: 'Shortcut', icon: <LinkRegular />, onClick: () => fsApi().createShortcut(FS.desktop, 'Notepad', 'notepad') },
    { separator: true },
    { label: 'Bitmap image', icon: <ImageRegular />, onClick: () => { const id = fsApi().createFile(FS.desktop, 'New Bitmap image.bmp', ''); setSelected(new Set([id])); setRenaming(id); } },
    { label: 'Text Document', icon: <DocumentTextRegular />, onClick: () => { const id = fsApi().createFile(FS.desktop, 'New Text Document.txt', ''); setSelected(new Set([id])); setRenaming(id); } },
    { label: 'Compressed (zipped) Folder', icon: <FolderZipRegular />, onClick: () => fsApi().createFile(FS.desktop, 'New Compressed (zipped) Folder.zip', '') },
  ];

  const onBgContext = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.d-item')) return;
    e.preventDefault();
    setSelected(new Set());
    const s = useSettings.getState();
    const cb = fsApi().clipboard;
    useShell.getState().showContextMenu({
      x: e.clientX, y: e.clientY,
      items: [
        {
          label: 'View', icon: <GridRegular />, submenu: [
            { label: 'Large icons', checked: s.desktopIconSize === 'large', radio: true, shortcut: 'Ctrl+Shift+2', onClick: () => s.set({ desktopIconSize: 'large' }) },
            { label: 'Medium icons', checked: s.desktopIconSize === 'medium', radio: true, shortcut: 'Ctrl+Shift+3', onClick: () => s.set({ desktopIconSize: 'medium' }) },
            { label: 'Small icons', checked: s.desktopIconSize === 'small', radio: true, shortcut: 'Ctrl+Shift+4', onClick: () => s.set({ desktopIconSize: 'small' }) },
            { separator: true },
            { label: 'Auto arrange icons', checked: s.desktopAutoArrange, onClick: () => s.set({ desktopAutoArrange: !s.desktopAutoArrange, desktopPositions: {} }) },
            { label: 'Align icons to grid', checked: s.desktopAlignToGrid, onClick: () => s.set({ desktopAlignToGrid: !s.desktopAlignToGrid }) },
            { separator: true },
            { label: 'Show desktop icons', checked: s.desktopIconsVisible, onClick: () => s.set({ desktopIconsVisible: !s.desktopIconsVisible }) },
          ],
        },
        {
          label: 'Sort by', icon: <ArrowSortRegular />, submenu: [
            { label: 'Name', onClick: () => sortBy('name') },
            { label: 'Size', onClick: () => sortBy('size') },
            { label: 'Item type', onClick: () => sortBy('type') },
            { label: 'Date modified', onClick: () => sortBy('date') },
          ],
        },
        { label: 'Refresh', icon: <ArrowClockwiseRegular />, onClick: () => setRefreshKey((k) => k + 1) },
        { separator: true },
        ...(cb ? [{ label: 'Paste', icon: <ClipboardPasteRegular />, shortcut: 'Ctrl+V', onClick: () => fsApi().paste(FS.desktop) } as MenuItem] : []),
        { label: 'New', icon: <AddCircleRegular />, submenu: newItems },
        { separator: true },
        { label: 'Display settings', icon: <DesktopRegular />, onClick: () => openApp('settings', { page: 'display' }) },
        { label: 'Personalize', icon: <PaintBrushRegular />, onClick: () => openApp('settings', { page: 'personalization' }) },
        { separator: true },
        { label: 'Open in Terminal', icon: <WindowConsoleRegular />, onClick: () => openApp('terminal', { cwd: FS.desktop }) },
        { separator: true },
        { label: 'Show more options', icon: <ArrowExportUpRegular />, shortcut: 'Shift+F10', onClick: () => undefined },
      ],
    });
  };

  const sortBy = (k: 'name' | 'size' | 'type' | 'date') => {
    const sorted = [...items].sort((a, b) => {
      if (a.system && !b.system) return -1;
      if (!a.system && b.system) return 1;
      if (k === 'size') return (a.node?.size ?? 0) - (b.node?.size ?? 0);
      if (k === 'date') return (b.node?.modified ?? 0) - (a.node?.modified ?? 0);
      if (k === 'type') return (a.node?.type ?? '').localeCompare(b.node?.type ?? '') || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
    const pos: Record<string, { col: number; row: number }> = {};
    sorted.forEach((it, i) => { pos[it.key] = { col: Math.floor(i / rows), row: i % rows }; });
    useSettings.getState().set({ desktopPositions: pos });
  };

  const onItemContext = (e: React.MouseEvent, it: DItem) => {
    e.preventDefault();
    e.stopPropagation();
    const sel = selected.has(it.key) ? selected : new Set([it.key]);
    setSelected(sel);
    const isSys = !!it.system;
    if (it.system === 'recycle') {
      useShell.getState().showContextMenu({
        x: e.clientX, y: e.clientY,
        items: [
          { label: 'Open', bold: true, icon: <OpenRegular />, shortcut: 'Enter', onClick: () => openItem(it) },
          { label: 'Empty Recycle Bin', icon: <DeleteRegular />, disabled: !recycleFull, onClick: () => fsApi().emptyRecycle() },
          { label: 'Pin to Start', icon: <PinRegular />, onClick: () => undefined },
          { separator: true },
          { label: 'Properties', icon: <InfoRegular />, shortcut: 'Alt+Enter', onClick: () => openItem(it) },
          { separator: true },
          { label: 'Show more options', icon: <ArrowExportUpRegular />, shortcut: 'Shift+F10' },
        ],
      });
      return;
    }
    const node = it.node;
    const nonSys = [...sel].filter((k) => !k.startsWith('sys:'));
    useShell.getState().showContextMenu({
      x: e.clientX, y: e.clientY,
      quickActions: isSys ? [] : [
        { icon: <CutRegular />, label: 'Cut', onClick: () => fsApi().setClipboard({ ids: nonSys, mode: 'cut' }) },
        { icon: <CopyRegular />, label: 'Copy', onClick: () => fsApi().setClipboard({ ids: nonSys, mode: 'copy' }) },
        { icon: <RenameRegular />, label: 'Rename', onClick: () => setRenaming(it.key) },
        { icon: <ShareRegular />, label: 'Share', onClick: () => undefined },
        { icon: <DeleteRegular />, label: 'Delete', onClick: deleteSel },
      ],
      items: [
        { label: 'Open', bold: true, icon: <OpenRegular />, shortcut: 'Enter', onClick: () => items.filter((i) => sel.has(i.key)).forEach(openItem) },
        ...(node && node.type === 'file'
          ? [{
            label: 'Open with', icon: <AppsListRegular />, submenu: [
              { label: 'Notepad', onClick: () => openApp('notepad', { fileId: node.id }) },
              { label: 'Photos', onClick: () => openApp('photos', { fileId: node.id }) },
              { label: 'Paint', onClick: () => openApp('paint', { fileId: node.id }) },
              { label: 'Microsoft Edge', onClick: () => openApp('edge', { fileId: node.id }) },
            ],
          } as MenuItem]
          : []),
        ...(node?.type === 'folder' ? [{ label: 'Open in new window', icon: <OpenRegular />, onClick: () => openNode(node) } as MenuItem] : []),
        { label: 'Pin to Start', icon: <PinRegular />, onClick: () => undefined },
        ...(!isSys ? [{ label: 'Compress to ZIP file', icon: <FolderZipRegular />, onClick: () => node && fsApi().createFile(FS.desktop, node.name.replace(/\.[^.]+$/, '') + '.zip', '') } as MenuItem] : []),
        ...(!isSys ? [{ label: 'Copy as path', icon: <LinkRegular />, shortcut: 'Ctrl+Shift+C', onClick: () => node && navigator.clipboard?.writeText(`"C:\\Users\\${useSettings.getState().userName}\\Desktop\\${node.name}"`).catch(() => undefined) } as MenuItem] : []),
        { label: 'Properties', icon: <InfoRegular />, shortcut: 'Alt+Enter', onClick: () => node && openApp('explorer', { folderId: FS.desktop }) },
        { separator: true },
        { label: 'Show more options', icon: <ArrowExportUpRegular />, shortcut: 'Shift+F10' },
      ],
    });
  };

  const renderIcon = (it: DItem) => {
    const s = size.icon;
    switch (it.system) {
      case 'recycle': return <RecycleBinIcon size={s} full={recycleFull} />;
      case 'computer': return <ThisPCIcon size={s} />;
      case 'network': return <NetworkIcon size={s} />;
      case 'control': return <ControlPanelIcon size={s} />;
      case 'user': return <SpecialFolderIcon kind="user" size={s} />;
      default: return <NodeIcon node={it.node!} size={s} />;
    }
  };

  const fit = settings.wallpaperFit;
  const bgSize = fit === 'fill' ? 'cover' : fit === 'fit' ? 'contain' : fit === 'stretch' ? '100% 100%' : fit === 'tile' ? 'auto' : fit === 'center' ? 'auto' : 'cover';

  return (
    <div
      ref={ref}
      className="desktop"
      tabIndex={-1}
      onPointerDown={onBgPointerDown}
      onContextMenu={onBgContext}
      style={{ backgroundSize: bgSize, backgroundRepeat: fit === 'tile' ? 'repeat' : 'no-repeat' }}
      key={refreshKey}
    >
      {settings.desktopIconsVisible && items.map((it) => {
        const p = positions[it.key];
        const isSel = selected.has(it.key);
        const isDrag = dragging?.keys.includes(it.key);
        const cut = useFS.getState().clipboard?.mode === 'cut' && useFS.getState().clipboard?.ids.includes(it.key);
        return (
          <div
            key={it.key}
            data-key={it.key}
            className={`d-item size-${settings.desktopIconSize} ${isSel ? 'selected' : ''} ${dropTarget === it.key ? 'drop' : ''} ${isDrag ? 'dragging' : ''} ${cut ? 'cut' : ''}`}
            style={{
              left: 2 + p.col * size.cellW,
              top: 2 + p.row * size.cellH,
              width: size.cellW - 2,
              transform: isDrag ? `translate(${dragging!.dx}px, ${dragging!.dy}px)` : undefined,
            }}
            onPointerDown={(e) => onItemPointerDown(e, it)}
            onDoubleClick={() => openItem(it)}
            onContextMenu={(e) => onItemContext(e, it)}
          >
            <div className="d-icon" style={{ width: size.icon, height: size.icon }}>{renderIcon(it)}</div>
            {renaming === it.key && it.node ? (
              <RenameBox
                initial={it.name}
                onDone={(v) => { if (v != null) fsApi().rename(it.key, v); setRenaming(null); }}
              />
            ) : (
              <div className="d-label">{it.name}</div>
            )}
          </div>
        );
      })}
      {marquee && (
        <div
          className="d-marquee"
          style={{
            left: Math.min(marquee.x0, marquee.x1),
            top: Math.min(marquee.y0, marquee.y1),
            width: Math.abs(marquee.x1 - marquee.x0),
            height: Math.abs(marquee.y1 - marquee.y0),
          }}
        />
      )}
    </div>
  );
}

function RenameBox({ initial, onDone }: { initial: string; onDone: (v: string | null) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [v, setV] = useState(initial);
  useEffect(() => {
    const el = ref.current!;
    el.focus();
    const dot = initial.lastIndexOf('.');
    el.setSelectionRange(0, dot > 0 ? dot : initial.length);
  }, [initial]);
  return (
    <textarea
      ref={ref}
      className="d-rename"
      value={v}
      rows={1}
      onChange={(e) => setV(e.target.value.replace(/\n/g, ''))}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Enter') { e.preventDefault(); onDone(v); }
        if (e.key === 'Escape') onDone(null);
      }}
      onBlur={() => onDone(v)}
    />
  );
}

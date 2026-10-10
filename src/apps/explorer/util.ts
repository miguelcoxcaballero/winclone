import { useFS, FS, fileKind, typeLabel, formatSize, extOf, type FSNode } from '@/core/store/fs';
import type { GroupKey, SortKey, ViewMode, FolderViewPrefs } from './prefs';

/** Virtual locations that are not file-system folders. */
export const HOME = 'home';
export const GALLERY = 'gallery';
export const NETWORK = 'network';
export const SEARCH_PREFIX = 'search:';

export type Loc = string;

export const USER_FOLDERS = [FS.desktop, FS.downloads, FS.documents, FS.pictures, FS.music, FS.videos] as const;

export function locName(loc: Loc, nodes = useFS.getState().nodes): string {
  if (loc === HOME) return 'Home';
  if (loc === GALLERY) return 'Gallery';
  if (loc === NETWORK) return 'Network';
  return nodes[loc]?.name ?? 'Unknown';
}

export function isFolderLoc(loc: Loc, nodes = useFS.getState().nodes) {
  const n = nodes[loc];
  return !!n && (n.type === 'folder' || n.type === 'drive');
}

/** Can items be created / pasted into this location? */
export function isWritable(loc: Loc, nodes = useFS.getState().nodes) {
  if (loc === FS.root || loc === FS.recycle) return false;
  return isFolderLoc(loc, nodes);
}

/** Path of nodes from the top of the breadcrumb (This PC / Home) to `loc`. */
export function crumbs(loc: Loc, nodes = useFS.getState().nodes): Loc[] {
  if (loc === HOME || loc === GALLERY || loc === NETWORK || loc === FS.recycle) return [loc];
  const out: Loc[] = [];
  let cur = nodes[loc];
  while (cur) {
    out.unshift(cur.id);
    cur = cur.parent ? nodes[cur.parent] : (undefined as unknown as FSNode);
  }
  return out;
}

/** Children of a node (live view of the store). */
export function childrenOf(id: string, nodes: Record<string, FSNode>, hidden = false): FSNode[] {
  const out: FSNode[] = [];
  for (const k in nodes) {
    const n = nodes[k];
    if (n.parent === id && (hidden || !n.hidden)) out.push(n);
  }
  return out;
}

export function isContainer(n: FSNode) {
  return n.type === 'folder' || n.type === 'drive';
}

export function hasSubfolders(id: string, nodes: Record<string, FSNode>, hidden = false) {
  for (const k in nodes) {
    const n = nodes[k];
    if (n.parent === id && isContainer(n) && (hidden || !n.hidden)) return true;
  }
  return false;
}

/** Is `id` inside (or equal to) `ancestor`? */
export function isWithin(id: string, ancestor: string, nodes: Record<string, FSNode>) {
  let cur: FSNode | undefined = nodes[id];
  while (cur) {
    if (cur.id === ancestor) return true;
    cur = cur.parent ? nodes[cur.parent] : undefined;
  }
  return false;
}

/** Recursive descendants of a folder. */
export function descendants(id: string, nodes: Record<string, FSNode>, hidden = false): FSNode[] {
  const byParent = new Map<string, FSNode[]>();
  for (const k in nodes) {
    const n = nodes[k];
    if (!n.parent) continue;
    if (!hidden && n.hidden) continue;
    const arr = byParent.get(n.parent);
    if (arr) arr.push(n); else byParent.set(n.parent, [n]);
  }
  const out: FSNode[] = [];
  const walk = (pid: string) => {
    for (const c of byParent.get(pid) ?? []) {
      out.push(c);
      if (isContainer(c)) walk(c.id);
    }
  };
  walk(id);
  return out;
}

export function folderSize(id: string, nodes: Record<string, FSNode>): { bytes: number; files: number; folders: number } {
  let bytes = 0, files = 0, folders = 0;
  for (const d of descendants(id, nodes, true)) {
    if (isContainer(d)) folders++;
    else { files++; bytes += d.size ?? 0; }
  }
  return { bytes, files, folders };
}

/* ───────────── formatting ───────────── */

export function fmtDate(t?: number): string {
  if (!t) return '';
  const d = new Date(t);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

export function fmtLongDate(t?: number): string {
  if (!t) return '';
  const d = new Date(t);
  return `${d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}`;
}

export function fmtBytesLong(bytes: number): string {
  return `${formatBytes(bytes)} (${bytes.toLocaleString('en-US')} bytes)`;
}

/** "2.04 MB" style sizes used by the status bar and properties. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let v = bytes / 1024, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  const s = v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
  return `${s} ${units[i]}`;
}

export function sizeText(n: FSNode) {
  if (isContainer(n)) return '';
  return formatSize(n.size ?? (n.content?.length ?? 0));
}

export function displayName(n: FSNode, showExt: boolean) {
  if (showExt || n.type !== 'file') return n.name;
  const dot = n.name.lastIndexOf('.');
  return dot > 0 ? n.name.slice(0, dot) : n.name;
}

export function pathOf(id: string) {
  return useFS.getState().path(id);
}

/** Full Windows-like path used by "Copy as path" and the address box. */
export function fullPath(loc: Loc): string {
  if (loc === HOME) return 'Home';
  if (loc === GALLERY) return 'Gallery';
  if (loc === NETWORK) return 'Network';
  return useFS.getState().path(loc);
}

/* ───────────── sorting / grouping ───────────── */

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

export function defaultFolderPrefs(loc: Loc, nodes: Record<string, FSNode>): Required<FolderViewPrefs> {
  if (loc === FS.root) return { view: 'tiles', sort: 'name', desc: false, group: 'type' };
  if (loc === FS.recycle) return { view: 'details', sort: 'deleted', desc: true, group: 'none' };
  if (loc === FS.downloads) return { view: 'details', sort: 'modified', desc: true, group: 'modified' };
  if (isWithin(loc, FS.pictures, nodes) || isWithin(loc, 'wallpaperdir', nodes)) return { view: 'large', sort: 'name', desc: false, group: 'none' };
  if (isWithin(loc, FS.videos, nodes)) return { view: 'large', sort: 'name', desc: false, group: 'none' };
  return { view: 'details', sort: 'name', desc: false, group: 'none' };
}

export function sortItems(items: FSNode[], key: SortKey, desc: boolean): FSNode[] {
  const dir = desc ? -1 : 1;
  const val = (n: FSNode): string | number => {
    switch (key) {
      case 'modified': return n.modified;
      case 'deleted': return n.deletedAt ?? 0;
      case 'size': return isContainer(n) ? -1 : n.size ?? 0;
      case 'type': return typeLabel(n);
      case 'origin': return n.deletedFrom ? pathOf(n.deletedFrom) : '';
      case 'location': return n.parent ? pathOf(n.parent) : '';
      default: return n.name;
    }
  };
  return [...items].sort((a, b) => {
    // Folders are always listed before files when sorting by name / type
    if (key === 'name' || key === 'type' || key === 'location' || key === 'origin') {
      const fa = isContainer(a) ? 0 : 1, fb = isContainer(b) ? 0 : 1;
      if (fa !== fb) return fa - fb;
    }
    const va = val(a), vb = val(b);
    let c = typeof va === 'number' && typeof vb === 'number' ? va - vb : collator.compare(String(va), String(vb));
    if (c === 0) c = collator.compare(a.name, b.name);
    return c * dir;
  });
}

export function dateGroup(t: number, now = Date.now()): string {
  const d = new Date(t);
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const day = 86400000;
  const diffDays = Math.floor((today.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / day);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  const dow = today.getDay();
  if (diffDays <= dow) return 'Earlier this week';
  if (diffDays <= dow + 7) return 'Last week';
  if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) return 'Earlier this month';
  const lm = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  if (d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()) return 'Last month';
  if (d.getFullYear() === today.getFullYear()) return 'Earlier this year';
  return 'A long time ago';
}

const DATE_ORDER = ['Today', 'Yesterday', 'Earlier this week', 'Last week', 'Earlier this month', 'Last month', 'Earlier this year', 'A long time ago'];
const SIZE_GROUPS: [number, string][] = [
  [16 * 1024, 'Tiny (0 - 16 KB)'],
  [1024 * 1024, 'Small (16 KB - 1 MB)'],
  [128 * 1024 * 1024, 'Medium (1 - 128 MB)'],
  [1024 * 1024 * 1024, 'Large (128 MB - 1 GB)'],
  [4 * 1024 * 1024 * 1024, 'Huge (1 - 4 GB)'],
  [Infinity, 'Gigantic (> 4 GB)'],
];

export function groupLabel(n: FSNode, key: GroupKey): string {
  switch (key) {
    case 'name': {
      const c = n.name[0]?.toUpperCase() ?? '';
      if (/[0-9]/.test(c)) return '0 - 9';
      if (c >= 'A' && c <= 'H') return 'A - H';
      if (c >= 'I' && c <= 'P') return 'I - P';
      if (c >= 'Q' && c <= 'Z') return 'Q - Z';
      return 'Other';
    }
    case 'modified': return dateGroup(n.modified);
    case 'deleted': return dateGroup(n.deletedAt ?? n.modified);
    case 'type':
      if (n.type === 'drive') return 'Devices and drives';
      return typeLabel(n);
    case 'size': {
      if (isContainer(n)) return 'Unspecified';
      const s = n.size ?? 0;
      return SIZE_GROUPS.find(([lim]) => s < lim)![1];
    }
    case 'origin': return n.deletedFrom ? pathOf(n.deletedFrom) : '';
    case 'location': return n.parent ? pathOf(n.parent) : '';
    default: return '';
  }
}

export interface Group { label: string; items: FSNode[] }

export function groupItems(items: FSNode[], key: GroupKey, desc: boolean): Group[] {
  if (key === 'none') return [{ label: '', items }];
  const map = new Map<string, FSNode[]>();
  for (const it of items) {
    const g = groupLabel(it, key);
    const arr = map.get(g);
    if (arr) arr.push(it); else map.set(g, [it]);
  }
  let groups = [...map.entries()].map(([label, its]) => ({ label, items: its }));
  if (key === 'modified' || key === 'deleted') groups.sort((a, b) => DATE_ORDER.indexOf(a.label) - DATE_ORDER.indexOf(b.label));
  else if (key === 'size') {
    const order = ['Unspecified', ...SIZE_GROUPS.map((s) => s[1])];
    groups.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
  } else groups.sort((a, b) => collator.compare(a.label, b.label));
  if (desc && key !== 'modified' && key !== 'deleted') groups = groups.reverse();
  return groups;
}

export const VIEW_LABEL: Record<ViewMode, string> = {
  xl: 'Extra large icons', large: 'Large icons', medium: 'Medium icons', small: 'Small icons',
  list: 'List', details: 'Details', tiles: 'Tiles', content: 'Content',
};

export const VIEW_ORDER: ViewMode[] = ['xl', 'large', 'medium', 'small', 'list', 'details', 'tiles', 'content'];

export const SORT_LABEL: Record<SortKey, string> = {
  name: 'Name', modified: 'Date modified', type: 'Type', size: 'Size',
  origin: 'Original Location', deleted: 'Date Deleted', location: 'Folder path',
};

/* ───────────── drives ───────────── */

export const DRIVE_TOTAL: Record<string, number> = { 'C:': 475.6 * 1024 ** 3, 'D:': 931.5 * 1024 ** 3 };
const DRIVE_BASE_USED: Record<string, number> = { 'C:': 187.3 * 1024 ** 3, 'D:': 402.8 * 1024 ** 3 };

export function driveUsage(n: FSNode, nodes: Record<string, FSNode>) {
  const letter = n.target ?? 'C:';
  const total = DRIVE_TOTAL[letter] ?? 256 * 1024 ** 3;
  const used = Math.min(total, (DRIVE_BASE_USED[letter] ?? 20 * 1024 ** 3) + folderSize(n.id, nodes).bytes);
  return { total, free: total - used, used, pct: used / total };
}

export function fmtGB(bytes: number) {
  const gb = bytes / 1024 ** 3;
  return `${gb >= 100 ? gb.toFixed(0) : gb.toFixed(1)} GB`;
}

/* ───────────── misc ───────────── */

export function kindOf(n: FSNode) { return fileKind(n); }
export { extOf };

export function isImage(n: FSNode) { return n.type === 'file' && fileKind(n) === 'image'; }

/** Month label used by Gallery groups, e.g. "October 2026". */
export function monthLabel(t: number) {
  return new Date(t).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

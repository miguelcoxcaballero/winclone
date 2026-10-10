import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { assetUrl } from '../assets';

/**
 * A tiny persistent virtual file system.
 * Nodes live in a flat map keyed by id; folders reference their parent.
 * Deleted nodes are moved into the Recycle Bin (parent = 'recycle').
 */
export interface FSNode {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'drive' | 'shortcut';
  parent: string | null;
  /** Text content, or a URL / data URL for binary files */
  content?: string;
  /** For shortcuts: app id to launch; for drives: label */
  target?: string;
  created: number;
  modified: number;
  size?: number;
  hidden?: boolean;
  system?: boolean;
  /** Recycle bin bookkeeping */
  deletedFrom?: string;
  deletedAt?: number;
}

export const FS = {
  root: 'thispc',
  c: 'c',
  users: 'users',
  user: 'user',
  desktop: 'desktop',
  documents: 'documents',
  downloads: 'downloads',
  pictures: 'pictures',
  music: 'music',
  videos: 'videos',
  screenshots: 'screenshots',
  recycle: 'recycle',
  windows: 'windows',
  programFiles: 'programfiles',
} as const;

const now = Date.UTC(2026, 9, 1, 9, 30);
const base = import.meta.env.BASE_URL;

function seed(): Record<string, FSNode> {
  const n = (id: string, name: string, parent: string | null, extra: Partial<FSNode> = {}): FSNode => ({
    id, name, parent, type: 'folder', created: now, modified: now, ...extra,
  });
  const nodes: FSNode[] = [
    n(FS.root, 'This PC', null, { system: true }),
    n(FS.recycle, 'Recycle Bin', null, { system: true }),
    n(FS.c, 'Local Disk (C:)', FS.root, { type: 'drive', target: 'C:' }),
    n('d', 'Data (D:)', FS.root, { type: 'drive', target: 'D:' }),
    n(FS.programFiles, 'Program Files', FS.c),
    n('programfilesx86', 'Program Files (x86)', FS.c),
    n(FS.users, 'Users', FS.c),
    n(FS.windows, 'Windows', FS.c),
    n('perflogs', 'PerfLogs', FS.c),
    n('sys32', 'System32', FS.windows),
    n('web', 'Web', FS.windows),
    n('wallpaperdir', 'Wallpaper', 'web'),
    n('publicuser', 'Public', FS.users),
    n(FS.user, 'User', FS.users),
    n(FS.desktop, 'Desktop', FS.user),
    n(FS.documents, 'Documents', FS.user),
    n(FS.downloads, 'Downloads', FS.user),
    n(FS.music, 'Music', FS.user),
    n(FS.pictures, 'Pictures', FS.user),
    n(FS.videos, 'Videos', FS.user),
    n('appdata', 'AppData', FS.user, { hidden: true }),
    n('camroll', 'Camera Roll', FS.pictures),
    n('savedpics', 'Saved Pictures', FS.pictures),
    n(FS.screenshots, 'Screenshots', FS.pictures),
    n('captures', 'Captures', FS.videos),
    n('d-projects', 'Projects', 'd'),
    n('d-backup', 'Backup', 'd'),
    n('edge-lnk', 'Microsoft Edge', FS.desktop, { type: 'shortcut', target: 'edge', size: 2348 }),
    n('doc-welcome', 'Welcome.txt', FS.documents, {
      type: 'file',
      content:
        'Welcome to WinClone!\r\n\r\nThis is a text file stored in the virtual file system of this browser desktop.\r\nEdit it in Notepad and press Ctrl+S to save your changes.\r\n',
      size: 190,
    }),
    n('doc-notes', 'Shopping list.txt', FS.documents, {
      type: 'file', content: '- Coffee\r\n- Bread\r\n- Apples\r\n- Batteries (AA)\r\n', size: 48,
    }),
    n('d-readme', 'readme.txt', 'd-projects', { type: 'file', content: 'Project notes go here.\r\n', size: 24 }),
  ];
  const pics = ['flow-light', 'flow-dark', 'glow', 'aurora', 'dune', 'lagoon', 'ember', 'mist'];
  pics.forEach((p, i) => {
    nodes.push(n(`wp-${p}`, `img${i}.jpg`, 'wallpaperdir', { type: 'file', content: assetUrl(`${base}wallpapers/${p}.jpg`), size: 400_000 + i * 37_123 }));
  });
  ['dune', 'lagoon', 'aurora', 'lock-coast', 'lock-ridge'].forEach((p, i) => {
    nodes.push(n(`pic-${p}`, `IMG_2026100${i + 1}_0${i + 8}1532.jpg`, i < 3 ? 'camroll' : 'savedpics', {
      type: 'file', content: assetUrl(`${base}wallpapers/${p}.jpg`), size: 2_100_000 + i * 113_456, created: now - i * 86400000, modified: now - i * 86400000,
    }));
  });
  ['notepad.exe', 'calc.exe', 'mspaint.exe', 'cmd.exe', 'explorer.exe', 'taskmgr.exe'].forEach((f, i) =>
    nodes.push(n(`sys-${i}`, f, 'sys32', { type: 'file', content: '', size: 200_000 + i * 51_234, system: true })),
  );
  return Object.fromEntries(nodes.map((x) => [x.id, x]));
}

let seq = Date.now() % 100000;
const uid = () => `f${(++seq).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

interface FSStore {
  nodes: Record<string, FSNode>;
  /** Clipboard for cut/copy/paste in Explorer and on the Desktop */
  clipboard: { ids: string[]; mode: 'cut' | 'copy' } | null;

  get: (id: string) => FSNode | undefined;
  children: (id: string, includeHidden?: boolean) => FSNode[];
  path: (id: string) => string;
  breadcrumb: (id: string) => FSNode[];
  resolve: (path: string) => FSNode | undefined;
  uniqueName: (parent: string, name: string) => string;
  createFolder: (parent: string, name?: string) => string;
  createFile: (parent: string, name: string, content?: string) => string;
  createShortcut: (parent: string, name: string, appId: string) => string;
  writeFile: (id: string, content: string) => void;
  rename: (id: string, name: string) => void;
  move: (id: string, parent: string) => void;
  copy: (id: string, parent: string) => string;
  remove: (id: string) => void;      // → recycle bin
  restore: (id: string) => void;
  purge: (id: string) => void;       // permanent
  emptyRecycle: () => void;
  setClipboard: (c: FSStore['clipboard']) => void;
  paste: (parent: string) => void;
  reset: () => void;
}

export const useFS = create<FSStore>()(
  persist(
    (set, get) => ({
      nodes: seed(),
      clipboard: null,

      get: (id) => get().nodes[id],

      children: (id, includeHidden = false) =>
        Object.values(get().nodes)
          .filter((x) => x.parent === id && (includeHidden || !x.hidden))
          .sort((a, b) => {
            const fa = a.type === 'file' || a.type === 'shortcut' ? 1 : 0;
            const fb = b.type === 'file' || b.type === 'shortcut' ? 1 : 0;
            return fa - fb || a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
          }),

      path: (id) => {
        const parts: string[] = [];
        let cur = get().nodes[id];
        while (cur) {
          if (cur.type === 'drive') { parts.unshift(cur.target ?? cur.name); break; }
          if (cur.id === FS.root || cur.id === FS.recycle) { parts.unshift(cur.name); break; }
          parts.unshift(cur.name);
          cur = cur.parent ? get().nodes[cur.parent] : undefined!;
        }
        const p = parts.join('\\');
        return /^[A-Z]:$/.test(p) ? p + '\\' : p;
      },

      breadcrumb: (id) => {
        const out: FSNode[] = [];
        let cur = get().nodes[id];
        while (cur) {
          out.unshift(cur);
          cur = cur.parent ? get().nodes[cur.parent] : undefined!;
        }
        return out;
      },

      resolve: (path) => {
        const p = path.trim().replace(/\//g, '\\').replace(/\\+$/, '');
        if (!p) return undefined;
        const lower = p.toLowerCase();
        const aliases: Record<string, string> = {
          'this pc': FS.root, 'recycle bin': FS.recycle, desktop: FS.desktop, documents: FS.documents,
          downloads: FS.downloads, pictures: FS.pictures, music: FS.music, videos: FS.videos,
          '%userprofile%': FS.user, '~': FS.user, home: FS.user,
        };
        if (aliases[lower]) return get().nodes[aliases[lower]];
        const parts = p.split('\\');
        const drive = Object.values(get().nodes).find((x) => x.type === 'drive' && x.target?.toLowerCase() === parts[0].toLowerCase());
        let cur: FSNode | undefined = drive;
        if (!cur) return undefined;
        for (const part of parts.slice(1)) {
          if (!part || part === '.') continue;
          if (part === '..') { cur = cur?.parent ? get().nodes[cur.parent] : cur; continue; }
          cur = Object.values(get().nodes).find((x) => x.parent === cur!.id && x.name.toLowerCase() === part.toLowerCase());
          if (!cur) return undefined;
        }
        return cur;
      },

      uniqueName: (parent, name) => {
        const sib = new Set(get().children(parent, true).map((x) => x.name.toLowerCase()));
        if (!sib.has(name.toLowerCase())) return name;
        const dot = name.lastIndexOf('.');
        const stem = dot > 0 ? name.slice(0, dot) : name;
        const ext = dot > 0 ? name.slice(dot) : '';
        for (let i = 2; ; i++) {
          const cand = `${stem} (${i})${ext}`;
          if (!sib.has(cand.toLowerCase())) return cand;
        }
      },

      createFolder: (parent, name = 'New folder') => {
        const id = uid();
        const t = Date.now();
        const node: FSNode = { id, name: get().uniqueName(parent, name), type: 'folder', parent, created: t, modified: t };
        set({ nodes: { ...get().nodes, [id]: node } });
        return id;
      },

      createFile: (parent, name, content = '') => {
        const id = uid();
        const t = Date.now();
        const node: FSNode = { id, name: get().uniqueName(parent, name), type: 'file', parent, content, created: t, modified: t, size: content.length };
        set({ nodes: { ...get().nodes, [id]: node } });
        return id;
      },

      createShortcut: (parent, name, appId) => {
        const id = uid();
        const t = Date.now();
        const node: FSNode = { id, name: get().uniqueName(parent, name), type: 'shortcut', target: appId, parent, created: t, modified: t, size: 2048 };
        set({ nodes: { ...get().nodes, [id]: node } });
        return id;
      },

      writeFile: (id, content) => {
        const node = get().nodes[id];
        if (!node) return;
        set({ nodes: { ...get().nodes, [id]: { ...node, content, modified: Date.now(), size: content.length } } });
      },

      rename: (id, name) => {
        const node = get().nodes[id];
        const clean = name.trim().replace(/[\\/:*?"<>|]/g, '');
        if (!node || !clean || clean === node.name) return;
        const finalName = node.parent ? get().uniqueName(node.parent, clean) : clean;
        set({ nodes: { ...get().nodes, [id]: { ...node, name: finalName, modified: Date.now() } } });
      },

      move: (id, parent) => {
        const node = get().nodes[id];
        if (!node || node.parent === parent || id === parent) return;
        // prevent moving a folder into its own descendant
        let cur: FSNode | undefined = get().nodes[parent];
        while (cur) { if (cur.id === id) return; cur = cur.parent ? get().nodes[cur.parent] : undefined; }
        set({ nodes: { ...get().nodes, [id]: { ...node, parent, name: get().uniqueName(parent, node.name) } } });
      },

      copy: (id, parent) => {
        const src = get().nodes[id];
        if (!src) return id;
        const nodes = { ...get().nodes };
        const clone = (nodeId: string, newParent: string, rename: boolean): string => {
          const s = nodes[nodeId];
          const nid = uid();
          let name = s.name;
          if (rename) {
            const sib = new Set(Object.values(nodes).filter((x) => x.parent === newParent).map((x) => x.name.toLowerCase()));
            if (sib.has(name.toLowerCase())) {
              const dot = name.lastIndexOf('.');
              const stem = dot > 0 && s.type === 'file' ? name.slice(0, dot) : name;
              const ext = dot > 0 && s.type === 'file' ? name.slice(dot) : '';
              name = `${stem} - Copy${ext}`;
              for (let i = 2; sib.has(name.toLowerCase()); i++) name = `${stem} - Copy (${i})${ext}`;
            }
          }
          nodes[nid] = { ...s, id: nid, parent: newParent, name, created: Date.now(), modified: Date.now(), system: false };
          Object.values(get().nodes).filter((x) => x.parent === nodeId).forEach((c) => clone(c.id, nid, false));
          return nid;
        };
        const nid = clone(id, parent, true);
        set({ nodes });
        return nid;
      },

      remove: (id) => {
        const node = get().nodes[id];
        if (!node || node.system || node.type === 'drive') return;
        if (node.parent === FS.recycle) return get().purge(id);
        set({ nodes: { ...get().nodes, [id]: { ...node, parent: FS.recycle, deletedFrom: node.parent ?? undefined, deletedAt: Date.now() } } });
      },

      restore: (id) => {
        const node = get().nodes[id];
        if (!node || node.parent !== FS.recycle) return;
        const target = node.deletedFrom && get().nodes[node.deletedFrom] ? node.deletedFrom : FS.desktop;
        set({ nodes: { ...get().nodes, [id]: { ...node, parent: target, name: get().uniqueName(target, node.name), deletedFrom: undefined, deletedAt: undefined } } });
      },

      purge: (id) => {
        const nodes = { ...get().nodes };
        const kill = (nid: string) => {
          Object.values(nodes).filter((x) => x.parent === nid).forEach((c) => kill(c.id));
          delete nodes[nid];
        };
        kill(id);
        set({ nodes });
      },

      emptyRecycle: () => {
        get().children(FS.recycle, true).forEach((c) => get().purge(c.id));
      },

      setClipboard: (c) => set({ clipboard: c }),

      paste: (parent) => {
        const cb = get().clipboard;
        if (!cb) return;
        if (cb.mode === 'cut') {
          cb.ids.forEach((id) => get().move(id, parent));
          set({ clipboard: null });
        } else cb.ids.forEach((id) => get().copy(id, parent));
      },

      reset: () => set({ nodes: seed(), clipboard: null }),
    }),
    { name: 'wc.fs', version: 1, partialize: (s) => ({ nodes: s.nodes }) },
  ),
);

export const fs = () => useFS.getState();

export function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(i + 1).toLowerCase() : '';
}

export const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'];
export const AUDIO_EXT = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'wma'];
export const VIDEO_EXT = ['mp4', 'webm', 'mkv', 'mov', 'avi', 'wmv'];
export const TEXT_EXT = ['txt', 'log', 'md', 'json', 'xml', 'csv', 'ini', 'cfg', 'js', 'ts', 'html', 'css', 'bat', 'ps1', 'py'];

export function fileKind(node: FSNode): 'folder' | 'drive' | 'image' | 'audio' | 'video' | 'text' | 'shortcut' | 'exe' | 'zip' | 'pdf' | 'file' {
  if (node.type === 'folder') return 'folder';
  if (node.type === 'drive') return 'drive';
  if (node.type === 'shortcut') return 'shortcut';
  const e = extOf(node.name);
  if (IMAGE_EXT.includes(e)) return 'image';
  if (AUDIO_EXT.includes(e)) return 'audio';
  if (VIDEO_EXT.includes(e)) return 'video';
  if (TEXT_EXT.includes(e)) return 'text';
  if (e === 'exe' || e === 'msi') return 'exe';
  if (e === 'zip' || e === '7z' || e === 'rar') return 'zip';
  if (e === 'pdf') return 'pdf';
  return 'file';
}

export function typeLabel(node: FSNode): string {
  const k = fileKind(node);
  const e = extOf(node.name).toUpperCase();
  switch (k) {
    case 'folder': return 'File folder';
    case 'drive': return 'Local Disk';
    case 'shortcut': return 'Shortcut';
    case 'text': return e === 'TXT' ? 'Text Document' : `${e} File`;
    case 'image': return `${e} File`;
    case 'audio': return `${e} File`;
    case 'video': return `${e} File`;
    case 'exe': return 'Application';
    case 'zip': return 'Compressed (zipped) Folder';
    case 'pdf': return 'Microsoft Edge PDF Document';
    default: return e ? `${e} File` : 'File';
  }
}

export function formatSize(bytes?: number): string {
  if (bytes == null) return '';
  if (bytes < 1024) return `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
  const kb = Math.ceil(bytes / 1024);
  if (kb < 1024 * 10) return `${kb.toLocaleString()} KB`;
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(mb < 100 ? 1 : 0)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}

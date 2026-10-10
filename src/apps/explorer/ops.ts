/*
 * File operations with an undo history shared by all Explorer windows.
 */
import { create } from 'zustand';
import { useFS, FS } from '@/core/store/fs';

interface UndoEntry { label: string; undo: () => void }

interface UndoStore {
  stack: UndoEntry[];
  push: (e: UndoEntry) => void;
  undo: () => void;
}

export const useUndo = create<UndoStore>()((set, get) => ({
  stack: [],
  push: (e) => set({ stack: [...get().stack.slice(-49), e] }),
  undo: () => {
    const s = get().stack;
    const last = s[s.length - 1];
    if (!last) return;
    set({ stack: s.slice(0, -1) });
    try { last.undo(); } catch { /* ignore */ }
  },
}));

const fs = () => useFS.getState();
const exists = (id: string) => !!fs().nodes[id];

export function newFolder(parent: string, name = 'New folder'): string {
  const id = fs().createFolder(parent, name);
  useUndo.getState().push({ label: 'Undo New', undo: () => exists(id) && fs().purge(id) });
  return id;
}

export function newFile(parent: string, name: string, content = ''): string {
  const id = fs().createFile(parent, name, content);
  useUndo.getState().push({ label: 'Undo New', undo: () => exists(id) && fs().purge(id) });
  return id;
}

export function newShortcut(parent: string, name: string, appId: string): string {
  const id = fs().createShortcut(parent, name, appId);
  useUndo.getState().push({ label: 'Undo New', undo: () => exists(id) && fs().purge(id) });
  return id;
}

export function renameItem(id: string, name: string) {
  const old = fs().nodes[id]?.name;
  if (!old) return;
  fs().rename(id, name);
  const now = fs().nodes[id]?.name;
  if (now && now !== old) useUndo.getState().push({ label: 'Undo Rename', undo: () => exists(id) && fs().rename(id, old) });
}

export function moveItems(ids: string[], parent: string): string[] {
  const from: [string, string | null][] = [];
  const moved: string[] = [];
  ids.forEach((id) => {
    const n = fs().nodes[id];
    if (!n || n.system || n.type === 'drive' || n.parent === parent) return;
    const before = n.parent;
    fs().move(id, parent);
    if (fs().nodes[id]?.parent === parent) { from.push([id, before]); moved.push(id); }
  });
  if (from.length) {
    useUndo.getState().push({ label: 'Undo Move', undo: () => from.forEach(([id, p]) => p && exists(id) && fs().move(id, p)) });
  }
  return moved;
}

export function copyItems(ids: string[], parent: string): string[] {
  const created = ids.filter(exists).map((id) => fs().copy(id, parent));
  if (created.length) useUndo.getState().push({ label: 'Undo Copy', undo: () => created.forEach((id) => exists(id) && fs().purge(id)) });
  return created;
}

export function deleteItems(ids: string[]) {
  const recycled: string[] = [];
  ids.forEach((id) => {
    const n = fs().nodes[id];
    if (!n || n.system || n.type === 'drive') return;
    if (n.parent === FS.recycle) { fs().purge(id); return; }
    fs().remove(id);
    recycled.push(id);
  });
  if (recycled.length) useUndo.getState().push({ label: 'Undo Delete', undo: () => recycled.forEach((id) => fs().restore(id)) });
}

export function purgeItems(ids: string[]) {
  ids.forEach((id) => exists(id) && fs().purge(id));
}

export function restoreItems(ids: string[]) {
  const restored = ids.filter((id) => fs().nodes[id]?.parent === FS.recycle);
  restored.forEach((id) => fs().restore(id));
  if (restored.length) useUndo.getState().push({ label: 'Undo Restore', undo: () => restored.forEach((id) => exists(id) && fs().remove(id)) });
}

export function canDelete(id: string) {
  const n = fs().nodes[id];
  return !!n && !n.system && n.type !== 'drive';
}

/** Paste the clipboard into `parent`, returning the ids of the pasted items. */
export function pasteInto(parent: string): string[] {
  const cb = fs().clipboard;
  if (!cb) return [];
  if (cb.mode === 'cut') {
    const moved = moveItems(cb.ids, parent);
    fs().setClipboard(null);
    return moved;
  }
  return copyItems(cb.ids, parent);
}

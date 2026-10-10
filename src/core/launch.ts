import { openApp } from './store/windows';
import { useFS, fileKind, FS, type FSNode } from './store/fs';

/** Open a file-system node with its associated app (like double-clicking it). */
export function openNode(nodeOrId: FSNode | string) {
  const node = typeof nodeOrId === 'string' ? useFS.getState().get(nodeOrId) : nodeOrId;
  if (!node) return;
  if (node.id === FS.recycle) return openApp('explorer', { folderId: FS.recycle });
  switch (fileKind(node)) {
    case 'folder':
    case 'drive':
      return openApp('explorer', { folderId: node.id });
    case 'shortcut':
      return node.target ? openApp(node.target) : undefined;
    case 'image':
      return openApp('photos', { fileId: node.id });
    case 'audio':
    case 'video':
      return openApp('mediaplayer', { fileId: node.id });
    case 'pdf':
      return openApp('edge', { fileId: node.id });
    case 'text':
    case 'file':
    default:
      if (node.name.toLowerCase().endsWith('.exe')) {
        const map: Record<string, string> = { 'notepad.exe': 'notepad', 'calc.exe': 'calculator', 'mspaint.exe': 'paint', 'cmd.exe': 'terminal', 'explorer.exe': 'explorer', 'taskmgr.exe': 'taskmgr' };
        const app = map[node.name.toLowerCase()];
        if (app) return openApp(app);
      }
      return openApp('notepad', { fileId: node.id });
  }
}

/** Commands understood by the Run dialog, Terminal and the search box. */
export const COMMANDS: Record<string, string> = {
  notepad: 'notepad', 'notepad.exe': 'notepad',
  calc: 'calculator', 'calc.exe': 'calculator', calculator: 'calculator',
  mspaint: 'paint', 'mspaint.exe': 'paint', paint: 'paint',
  explorer: 'explorer', 'explorer.exe': 'explorer',
  cmd: 'terminal', 'cmd.exe': 'terminal', powershell: 'terminal', 'powershell.exe': 'terminal', wt: 'terminal', terminal: 'terminal',
  taskmgr: 'taskmgr', 'taskmgr.exe': 'taskmgr',
  msedge: 'edge', edge: 'edge',
  'ms-settings:': 'settings', control: 'settings', settings: 'settings',
  snippingtool: 'snippingtool', winver: 'winver', 'ms-photos:': 'photos', wmplayer: 'mediaplayer',
};

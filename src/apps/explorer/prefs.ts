import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FS } from '@/core/store/fs';

export type ViewMode = 'xl' | 'large' | 'medium' | 'small' | 'list' | 'details' | 'tiles' | 'content';
export type SortKey = 'name' | 'modified' | 'type' | 'size' | 'origin' | 'deleted' | 'location';
export type GroupKey = SortKey | 'none';

export interface FolderViewPrefs {
  view?: ViewMode;
  sort?: SortKey;
  desc?: boolean;
  group?: GroupKey;
}

interface ExplorerPrefs {
  navPane: boolean;
  detailsPane: boolean;
  previewPane: boolean;
  checkBoxes: boolean;
  extensions: boolean;
  hidden: boolean;
  compact: boolean;
  navWidth: number;
  paneWidth: number;
  pinned: string[];
  favorites: string[];
  folders: Record<string, FolderViewPrefs>;
  columns: Record<string, number>;
  /** Files opened from Explorer (id → time) used for the Home "Recent" list */
  recent: Record<string, number>;
  homeQuickOpen: boolean;
  homeTab: 'recent' | 'favorites' | 'shared';

  set: (p: Partial<Omit<ExplorerPrefs, 'set' | 'setFolder' | 'togglePin' | 'toggleFav' | 'touch' | 'setColumn'>>) => void;
  setFolder: (loc: string, p: FolderViewPrefs) => void;
  setColumn: (key: string, w: number) => void;
  togglePin: (id: string) => void;
  toggleFav: (id: string) => void;
  touch: (id: string) => void;
}

export const DEFAULT_PINNED = [FS.desktop, FS.downloads, FS.documents, FS.pictures, FS.music, FS.videos];

export const useExplorerPrefs = create<ExplorerPrefs>()(
  persist(
    (set, get) => ({
      navPane: true,
      detailsPane: false,
      previewPane: false,
      checkBoxes: false,
      extensions: true,
      hidden: false,
      compact: false,
      navWidth: 220,
      paneWidth: 300,
      pinned: DEFAULT_PINNED,
      favorites: [],
      folders: {},
      columns: {},
      recent: {},
      homeQuickOpen: true,
      homeTab: 'recent',

      set: (p) => set(p),
      setFolder: (loc, p) => set({ folders: { ...get().folders, [loc]: { ...get().folders[loc], ...p } } }),
      setColumn: (key, w) => set({ columns: { ...get().columns, [key]: w } }),
      togglePin: (id) => {
        const p = get().pinned;
        set({ pinned: p.includes(id) ? p.filter((x) => x !== id) : [...p, id] });
      },
      toggleFav: (id) => {
        const f = get().favorites;
        set({ favorites: f.includes(id) ? f.filter((x) => x !== id) : [...f, id] });
      },
      touch: (id) => set({ recent: { ...get().recent, [id]: Date.now() } }),
    }),
    { name: 'wc.explorer', version: 1, partialize: ({ set: _s, setFolder: _f, togglePin: _p, toggleFav: _v, touch: _t, setColumn: _c, ...rest }) => rest },
  ),
);

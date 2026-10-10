import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_WALLPAPER_ID, DEFAULT_LOCK_WALLPAPER_ID } from '../wallpapers';

export type Wallpaper =
  | { type: 'image'; id: string }
  | { type: 'color'; color: string }
  | { type: 'custom'; url: string; name?: string };

export interface SettingsState {
  theme: 'light' | 'dark';
  appTheme: 'light' | 'dark';
  accent: string;
  accentAuto: boolean;
  transparency: boolean;
  animations: boolean;
  accentOnStartTaskbar: boolean;
  accentOnTitleBars: boolean;
  wallpaper: Wallpaper;
  wallpaperFit: 'fill' | 'fit' | 'stretch' | 'tile' | 'center' | 'span';
  lockWallpaper: string;
  recentWallpapers: string[];

  taskbarAlign: 'center' | 'left';
  taskbarSearch: 'hidden' | 'icon' | 'box' | 'iconlabel';
  taskbarTaskView: boolean;
  taskbarWidgets: boolean;
  taskbarAutoHide: boolean;
  taskbarBadges: boolean;
  showSecondsInClock: boolean;
  pinnedTaskbar: string[];
  pinnedStart: string[];
  startLayout: 'default' | 'more-pins' | 'more-recs';
  startShowRecentlyAdded: boolean;
  startShowRecommended: boolean;

  desktopIconsVisible: boolean;
  desktopIconSize: 'small' | 'medium' | 'large';
  desktopAutoArrange: boolean;
  desktopAlignToGrid: boolean;
  desktopSystemIcons: { computer: boolean; user: boolean; network: boolean; recycle: boolean; control: boolean };
  desktopPositions: Record<string, { col: number; row: number }>;

  brightness: number;
  nightLight: boolean;
  nightLightStrength: number;
  volume: number;
  muted: boolean;
  wifi: boolean;
  wifiNetwork: string | null;
  bluetooth: boolean;
  airplane: boolean;
  batterySaver: boolean;
  energySaver: boolean;
  accessibility: { magnifier: boolean; colorFilters: boolean; narrator: boolean; mono: boolean; stickyKeys: boolean; liveCaptions: boolean };
  hotspot: boolean;
  doNotDisturb: boolean;
  location: boolean;

  hour24: boolean;
  timeZone: string;
  autoTime: boolean;
  language: string;
  region: string;

  userName: string;
  userEmail: string;
  userAvatar: string | null;
  password: string;
  deviceName: string;

  notificationsEnabled: boolean;
  textSize: number;
  displayScale: number;
  orientation: 'landscape' | 'portrait';
  hdr: boolean;
  refreshRate: number;
  mouseSpeed: number;
  primaryButton: 'left' | 'right';
  powerMode: 'efficiency' | 'balanced' | 'performance';
  screenOff: number;
  sleepAfter: number;
  clipboardHistory: boolean;
  snapWindows: boolean;
  gameMode: boolean;
  storageSense: boolean;
  defaultBrowser: string;

  set: (patch: Partial<SettingsState>) => void;
  toggle: (key: BoolKeys) => void;
  reset: () => void;
}

type BoolKeys = { [K in keyof SettingsState]: SettingsState[K] extends boolean ? K : never }[keyof SettingsState];

export const DEFAULT_SETTINGS = {
  theme: 'light' as const,
  appTheme: 'light' as const,
  accent: '#0078D4',
  accentAuto: false,
  transparency: true,
  animations: true,
  accentOnStartTaskbar: false,
  accentOnTitleBars: false,
  wallpaper: { type: 'image', id: DEFAULT_WALLPAPER_ID } as Wallpaper,
  wallpaperFit: 'fill' as const,
  lockWallpaper: DEFAULT_LOCK_WALLPAPER_ID,
  recentWallpapers: ['flow-light', 'flow-dark', 'glow', 'aurora', 'dune'],

  taskbarAlign: 'center' as const,
  taskbarSearch: 'box' as const,
  taskbarTaskView: true,
  taskbarWidgets: true,
  taskbarAutoHide: false,
  taskbarBadges: true,
  showSecondsInClock: false,
  pinnedTaskbar: ['explorer', 'edge', 'store'],
  pinnedStart: [
    'edge', 'mail', 'calendar', 'store', 'photos', 'settings',
    'calculator', 'clock', 'notepad', 'paint', 'explorer', 'mediaplayer',
    'terminal', 'todo', 'weather', 'camera', 'snippingtool', 'taskmgr',
  ],
  startLayout: 'default' as const,
  startShowRecentlyAdded: true,
  startShowRecommended: true,

  desktopIconsVisible: true,
  desktopIconSize: 'medium' as const,
  desktopAutoArrange: false,
  desktopAlignToGrid: true,
  desktopSystemIcons: { computer: false, user: false, network: false, recycle: true, control: false },
  desktopPositions: {} as Record<string, { col: number; row: number }>,

  brightness: 100,
  nightLight: false,
  nightLightStrength: 48,
  volume: 50,
  muted: false,
  wifi: true,
  wifiNetwork: 'HomeNetwork' as string | null,
  bluetooth: true,
  airplane: false,
  batterySaver: false,
  energySaver: false,
  accessibility: { magnifier: false, colorFilters: false, narrator: false, mono: false, stickyKeys: false, liveCaptions: false },
  hotspot: false,
  doNotDisturb: false,
  location: true,

  hour24: false,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  autoTime: true,
  language: 'English (United States)',
  region: 'United States',

  userName: 'User',
  userEmail: 'user@outlook.com',
  userAvatar: null as string | null,
  password: '',
  deviceName: 'DESKTOP-WC11',

  notificationsEnabled: true,
  textSize: 100,
  displayScale: 100,
  orientation: 'landscape' as const,
  hdr: false,
  refreshRate: 60,
  mouseSpeed: 10,
  primaryButton: 'left' as const,
  powerMode: 'balanced' as const,
  screenOff: 5,
  sleepAfter: 15,
  clipboardHistory: false,
  snapWindows: true,
  gameMode: true,
  storageSense: false,
  defaultBrowser: 'edge',
};

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      set: (patch) => set(patch),
      toggle: (key) => set({ [key]: !get()[key] } as Partial<SettingsState>),
      reset: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: 'wc.settings',
      version: 1,
      merge: (persisted, current) => ({ ...current, ...(persisted as object) }),
    },
  ),
);

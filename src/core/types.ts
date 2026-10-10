import type { ComponentType, ReactNode } from 'react';

export interface Rect { x: number; y: number; w: number; h: number; }

export type SnapZone =
  | 'left' | 'right' | 'top'
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  | { x: number; y: number; w: number; h: number }; // fractional layout zone (0..1)

/** Props every app component receives. */
export interface AppProps {
  windowId: string;
  /** Arguments passed to openApp(appId, args) – e.g. { fileId } or { path } */
  args?: any;
}

export interface AppIconProps { size?: number; className?: string; }

export interface AppMeta {
  id: string;
  name: string;
  /** Short publisher / description shown in Start search details. */
  publisher?: string;
  /** Extra keywords for search */
  keywords?: string[];
  defaultSize?: { w: number; h: number };
  minSize?: { w: number; h: number };
  resizable?: boolean;
  maximizable?: boolean;
  minimizable?: boolean;
  /** Open maximized by default */
  startMaximized?: boolean;
  /**
   * 'default' → the Window renders a standard 32px title bar (icon + title).
   * 'custom'  → the app renders its own title bar area. Mark draggable
   *             regions with the `data-drag` attribute; caption buttons are
   *             drawn by the Window in the top-right corner.
   */
  titlebar?: 'default' | 'custom';
  /** Height of the caption (min/max/close) buttons. Default 32. */
  captionHeight?: number;
  /** Window background material. Default 'mica'. */
  material?: 'mica' | 'mica-alt' | 'solid' | 'acrylic' | 'none';
  /** Only one window of this app may exist; reopening focuses it. */
  singleInstance?: boolean;
  /** Hide from Start "All apps" list */
  hidden?: boolean;
  /** Folder in the All apps list, e.g. 'Windows Tools' */
  folder?: string;
  /** Caption buttons drawn light (e.g. on dark custom title bars) */
  captionTheme?: 'auto' | 'dark';
}

export interface AppDef extends AppMeta {
  icon: ComponentType<AppIconProps>;
  component: ComponentType<AppProps>;
}

export interface MenuItem {
  id?: string;
  label?: string;
  icon?: ReactNode;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
  checked?: boolean;
  /** Render a radio bullet instead of a checkmark when checked */
  radio?: boolean;
  submenu?: MenuItem[];
  separator?: boolean;
  /** Bold label (default action) */
  bold?: boolean;
}

export interface ContextMenuSpec {
  x: number;
  y: number;
  items: MenuItem[];
  /** Icon-only quick actions row (Cut / Copy / Rename / Share / Delete) */
  quickActions?: { icon: ReactNode; label: string; onClick: () => void; disabled?: boolean }[];
  /** Prefer opening upward (taskbar menus) */
  placement?: 'auto' | 'top';
  /** Use the legacy (Windows 10 style "Show more options") look */
  legacy?: boolean;
}

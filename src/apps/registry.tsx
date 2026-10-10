import { lazy, type ComponentType } from 'react';
import type { AppDef, AppMeta, AppProps } from '@/core/types';
import { APP_ICONS } from '@/icons/AppIcons';

import explorerMeta from './explorer/meta';
import edgeMeta from './edge/meta';
import storeMeta from './store/meta';
import settingsMeta from './settings/meta';
import notepadMeta from './notepad/meta';
import calculatorMeta from './calculator/meta';
import paintMeta from './paint/meta';
import photosMeta from './photos/meta';
import mediaplayerMeta from './mediaplayer/meta';
import clockMeta from './clock/meta';
import terminalMeta from './terminal/meta';
import cameraMeta from './camera/meta';
import weatherMeta from './weather/meta';
import taskmgrMeta from './taskmgr/meta';
import snippingtoolMeta from './snippingtool/meta';
import todoMeta from './todo/meta';
import mailMeta from './mail/meta';
import calendarMeta from './calendar/meta';
import winverMeta from './winver/meta';

const loaders: Record<string, () => Promise<{ default: ComponentType<AppProps> }>> = {
  explorer: () => import('./explorer'),
  edge: () => import('./edge'),
  store: () => import('./store'),
  settings: () => import('./settings'),
  notepad: () => import('./notepad'),
  calculator: () => import('./calculator'),
  paint: () => import('./paint'),
  photos: () => import('./photos'),
  mediaplayer: () => import('./mediaplayer'),
  clock: () => import('./clock'),
  terminal: () => import('./terminal'),
  camera: () => import('./camera'),
  weather: () => import('./weather'),
  taskmgr: () => import('./taskmgr'),
  snippingtool: () => import('./snippingtool'),
  todo: () => import('./todo'),
  mail: () => import('./mail'),
  calendar: () => import('./calendar'),
  winver: () => import('./winver'),
};

const metas: AppMeta[] = [explorerMeta, edgeMeta, storeMeta, settingsMeta, notepadMeta, calculatorMeta, paintMeta, photosMeta, mediaplayerMeta, clockMeta, terminalMeta, cameraMeta, weatherMeta, taskmgrMeta, snippingtoolMeta, todoMeta, mailMeta, calendarMeta, winverMeta];

const DEFAULTS: Partial<AppMeta> = {
  resizable: true,
  maximizable: true,
  minimizable: true,
  titlebar: 'default',
  captionHeight: 32,
  material: 'mica',
  minSize: { w: 360, h: 240 },
};

export const APPS: Record<string, AppDef> = Object.fromEntries(
  metas.map((m) => [
    m.id,
    {
      ...DEFAULTS,
      ...m,
      icon: APP_ICONS[m.id] ?? APP_ICONS.generic,
      component: lazy(loaders[m.id]),
    } as AppDef,
  ]),
);

export function getApp(id: string): AppDef | undefined {
  return APPS[id];
}

/** Apps listed in Start › All, sorted alphabetically */
export function listApps(): AppDef[] {
  return Object.values(APPS)
    .filter((a) => !a.hidden)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Preload an app's code (e.g. on hover) */
export function preloadApp(id: string) {
  loaders[id]?.();
}

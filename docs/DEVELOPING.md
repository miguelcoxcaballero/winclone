# Developing WinClone

WinClone is a browser recreation of a Windows 11 style desktop built with
**Vite + React 19 + TypeScript + zustand**. There is no backend; everything
(settings, files) is persisted to `localStorage`.

```
npm install
npm run dev          # http://localhost:5173
npm run typecheck
npm run build        # static site in dist/
```

## Assets & licensing rules (important)

* App and system images are bundled under `src/assets/windows` to match the Windows reference interface requested for this project. Record the source, revision where available, and hashes in `sources.json`; see `docs/ICON_ASSETS.md`. Preserve reference pixels instead of redrawing brand icons. Default Bloom wallpapers use reference images; the other wallpapers remain original. Microsoft fonts are not bundled.
* Interface glyphs come from **Fluent UI System Icons** (`@fluentui/react-icons`,
  MIT licensed). Import the *unsized* names, e.g.
  `import { SearchRegular, SettingsFilled } from '@fluentui/react-icons'`.
  They render at `1em`, so size them with CSS (`font-size` or `width/height`
  on the `svg`).
* The UI font stack references *Segoe UI Variable* / *Segoe UI* locally (it is
  not bundled) and falls back to system fonts.
* Sample content (emails, news, store listings, songs, contacts…) must be
  original / fictional. Don't use third-party brand logos or real news text.

## Directory layout

```
src/
  core/            stores + framework (no UI)
    store/windows.ts       window manager (open/close/minimize/maximize/snap)
    store/settings.ts      persisted user settings (theme, accent, wallpaper…)
    store/shell.ts         shell state: open flyout, context menu, session phase
    store/fs.ts            persistent virtual file system
    store/notifications.ts notifications + toasts
    window-context.ts      useWindow(), useNow(), useInterval()
    hooks.ts               usePresence(), useFlyoutDismiss()
    launch.ts              openNode() (open file with associated app), COMMANDS
    types.ts               AppMeta, AppProps, MenuItem, ContextMenuSpec…
  components/controls.tsx  Fluent controls (Button, Toggle, Slider, TextBox,
                           ComboBox, Checkbox, Radio, SettingsCard, Expander,
                           InfoBar, Dialog, NavItem, Pivot, MenuBar, Tooltip,
                           ProgressBar, ProgressRing, DotsSpinner…)
  icons/AppIcons.tsx       app icon registry: <AppIcon appId="notepad" size={24} />
  icons/ShellIcons.tsx     folder / file / drive / recycle bin icons, <NodeIcon node={…} />
  shell/                   desktop, taskbar, start menu, flyouts, lock screen, window frame
  apps/<id>/meta.ts        app metadata (name, default size, title bar height…)
  apps/<id>/index.tsx      default-exported app component (lazy loaded)
  apps/registry.tsx        builds APPS from all meta files
  styles/tokens.css        design tokens (colours, type ramp, motion) for light & dark
```

## Writing an app

```tsx
// src/apps/myapp/index.tsx
import type { AppProps } from '@/core/types';
import { useWindow } from '@/core/window-context';
import { TitleBar } from '@/shell/window/TitleBar';
import './myapp.css';

export default function MyApp({ windowId, args }: AppProps) {
  const win = useWindow();          // { id, isActive, isMaximized, setTitle, close, setCloseGuard … }
  return (
    <div className="myapp">
      <TitleBar title="My App" appId="myapp" height={48} variant="winui" />
      …
    </div>
  );
}
```

* `meta.ts` sets `titlebar: 'custom'` for every built-in app. The app draws
  its own title bar; anything with the `data-drag` attribute moves the window
  (buttons/inputs inside it stay clickable; add `data-nodrag` to opt out).
  Double-clicking a drag region maximizes. The window frame draws the
  minimize / maximize / close buttons in the top-right corner, each 46px wide
  and `captionHeight` tall (from `meta.ts`) – leave **138px** free on the
  right of your title bar.
* The window background is Mica (`material` in meta). Leave your root
  transparent where the Mica should show (title bar, nav pane) and use the
  token colours for content layers (`--layer-fill`, `--card-fill`,
  `--solid-base`, …).
* Use CSS variables from `tokens.css` only – both themes must work. Prefix
  every CSS class with your app id (e.g. `.calc-…`) and import the CSS file
  from your component.
* Apps stay mounted while minimized.
* `win.setCloseGuard(async () => boolean)` lets an app cancel closing (e.g.
  "Do you want to save changes?").

### Useful APIs

```ts
import { openApp, useWindows } from '@/core/store/windows';   // openApp('notepad', { fileId })
import { useSettings } from '@/core/store/settings';          // const theme = useSettings(s => s.theme); useSettings.getState().set({...})
import { useFS, FS, fileKind, extOf, formatSize, typeLabel } from '@/core/store/fs';
import { openNode, COMMANDS } from '@/core/launch';
import { notify } from '@/core/store/notifications';          // notify({ appId, title, body })
import { contextMenu, useShell } from '@/core/store/shell';   // contextMenu(e, { items: MenuItem[] })
```

File system (`useFS`): `children(id)`, `get(id)`, `path(id)`, `resolve('C:\\Users')`,
`createFolder(parent, name?)`, `createFile(parent, name, content)`,
`writeFile(id, content)`, `rename`, `move`, `copy`, `remove` (to Recycle Bin),
`restore`, `purge`, `emptyRecycle`, `setClipboard`, `paste`. Well-known ids live
in `FS` (`FS.documents`, `FS.pictures`, `FS.recycle`, `FS.root` = This PC …).
Binary files store a URL / data URL in `content`.

App launch arguments used across the shell:

| app | args |
|---|---|
| explorer | `{ folderId }` |
| notepad | `{ fileId }` |
| photos | `{ fileId }` |
| mediaplayer | `{ fileId }` |
| paint | `{ fileId }` |
| edge | `{ url?, fileId? }` |
| settings | `{ page? }` – e.g. `'display'`, `'personalization'`, `'background'`, `'colors'`, `'taskbar'`, `'about'` |
| terminal | `{ cwd? }` (folder id) |

## Shell session phases

`useShell().phase` drives the session: `boot → lock → login → signing-in →
desktop`, plus `locking`, `signing-out`, `shutting-down`, `restarting`,
`off` and `sleep`. The desktop and windows stay mounted behind the lock,
login and sleep screens.

## Dev helpers

* URL params: `?reset=1` (clear storage), `?skip=1` (straight to desktop),
  `?theme=dark|light`, `?app=calculator` (open app; comma separated),
  `?args={"page":"colors"}` and `?max=1`.
* `node scripts/shot.mjs "app=calculator&theme=dark" out.png --port 5173`
  takes a Playwright screenshot of a running dev server.
* `window.wc` exposes the stores in the browser console.

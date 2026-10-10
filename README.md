# WinClone

A Windows 11–style desktop that runs entirely in the browser: lock screen,
sign-in, desktop icons, taskbar, Start menu, Quick Settings, notification
center, widgets, Task View, snap layouts and a set of working default apps,
all in light and dark themes.

> WinClone is an unofficial, fan-made recreation for learning purposes. It is
> not affiliated with, endorsed by, or sponsored by Microsoft. Windows and the
> names of the apps it recreates are trademarks of Microsoft Corporation.

## Running it

```bash
npm install
npm run dev        # → http://localhost:5173
npm run build      # static site in dist/ (deployable to any static host)
```

Useful URL parameters: `?skip=1` jumps straight to the desktop, `?theme=dark`,
`?app=notepad` opens an app, `?reset=1` clears all saved state.

## What's included

| Shell | Apps |
|---|---|
| Boot, lock, sign-in, sleep, shut down and restart screens | File Explorer (tabs, details/icon views, drag & drop, Recycle Bin) |
| Desktop icons (drag, marquee select, rename, context menus) | Microsoft Edge (tabs, real browsing in an iframe, history & favorites) |
| Centered taskbar with live indicators, previews and jump lists | Settings (personalization, display, taskbar, accounts, update…) |
| Start menu (pinned pages, Recommended, All apps) and search | Notepad, Calculator, Paint, Terminal |
| Quick Settings, notification center + calendar, widgets | Photos, Media Player, Camera, Clock, Snipping Tool, Task Manager |
| Window manager: drag, resize, snap, snap layouts, Task View | Outlook, Calendar, Microsoft To Do, Microsoft Store, Weather |
| Keyboard shortcuts (Win, Win+D/E/R/I/A/N/W/Tab/arrows, Ctrl+Shift+Esc) | About (winver) |

Everything you change — settings, files, wallpapers, pins — is saved in your
browser's `localStorage` and a virtual file system.

## Artwork and fonts

All icons, illustrations and wallpapers in this repository are **original
artwork** made for this project. Interface glyphs come from the MIT-licensed
[Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons).
Microsoft's own icons, wallpapers, sounds and fonts are copyrighted and are
**not** included. The UI uses *Segoe UI Variable* when it is installed on your
computer (it is on Windows) and falls back to your system font elsewhere.

### Using your own icons and wallpapers

If you have your own copies of other icons or wallpapers (for example from your
own Windows installation, in `C:\Windows\Web\Wallpaper\`), put them in the
git-ignored folder `src/custom-assets/` and they replace the built-in artwork
locally. See [`src/custom-assets/README.md`](src/custom-assets/README.md) for
the file names. You can also pick any picture as your background from
**Settings › Personalization › Background › Browse photos**.

## Development

See [docs/DEVELOPING.md](docs/DEVELOPING.md) for the architecture, the app API
and the design-token system.

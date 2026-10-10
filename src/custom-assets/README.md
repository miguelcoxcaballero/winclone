# Local asset overrides (not committed)

Everything in this folder except this README is ignored by git.

WinClone bundles Windows reference icons and original wallpapers. If you own copies of other images – for
example the icons or wallpapers from **your own** Windows installation – you can
place them here for personal, local use and they will replace the built-in art:

| Put files in | Effect |
|---|---|
| `icons/<id>.png` (or `.svg`, `.webp`, `.ico`) | Replaces an icon. App ids: `explorer`, `edge`, `store`, `settings`, `notepad`, `calculator`, `paint`, `photos`, `mediaplayer`, `clock`, `terminal`, `camera`, `weather`, `taskmgr`, `snippingtool`, `todo`, `mail`, `calendar`, `winver`. Shell: `start`, `recycle-bin`, `recycle-bin-full`, `this-pc`, `folder`, `drive`, `network`. |
| `wallpapers/*.jpg` | Added to Settings › Personalization › Background. The first file (alphabetical) becomes the default desktop background. |
| `lockscreen/*.jpg` | Added to the lock screen pictures; the first one becomes the default. |

On Windows the stock wallpapers live in `C:\Windows\Web\Wallpaper\` and
`C:\Windows\Web\4K\Wallpaper\`. Restart `npm run dev` (or rebuild) after adding
files. Don't publish a build that contains files you don't have the rights to
redistribute.

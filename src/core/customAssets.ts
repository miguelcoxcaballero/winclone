/**
 * Optional local asset overrides.
 *
 * WinClone bundles reference icons, Bloom wallpapers and original backgrounds. Additional icons or
 * wallpapers (for example from your own Windows installation) can be dropped
 * into `src/custom-assets/` for personal, local use – that folder is
 * git-ignored, so the files are never committed or redistributed.
 *
 *   src/custom-assets/icons/<appId>.png|svg|webp|ico   → replaces that app's icon
 *       app ids: explorer, edge, store, settings, notepad, calculator, paint, photos,
 *                mediaplayer, clock, terminal, camera, weather, taskmgr, snippingtool,
 *                todo, mail, calendar, winver
 *       shell:   start, recycle-bin, recycle-bin-full, this-pc, folder, drive, network
 *   src/custom-assets/wallpapers/*.jpg|png|webp         → added to Settings › Background
 *                                                         (the first one becomes the default)
 *   src/custom-assets/lockscreen/*.jpg|png|webp         → lock screen pictures
 *
 * Restart `npm run dev` after adding files.
 */

const iconFiles = import.meta.glob('/src/custom-assets/icons/*.{png,svg,webp,ico,jpg,jpeg,gif}', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;

const wallpaperFiles = import.meta.glob('/src/custom-assets/wallpapers/*.{png,webp,jpg,jpeg}', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;

const lockFiles = import.meta.glob('/src/custom-assets/lockscreen/*.{png,webp,jpg,jpeg}', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;

const baseName = (p: string) => p.split('/').pop()!.replace(/\.[^.]+$/, '');

export const CUSTOM_ICONS: Record<string, string> = Object.fromEntries(
  Object.entries(iconFiles).map(([path, url]) => [baseName(path).toLowerCase(), url]),
);

export interface CustomImage { id: string; name: string; url: string }

const toImages = (files: Record<string, string>, prefix: string): CustomImage[] =>
  Object.entries(files)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([path, url]) => ({ id: `${prefix}-${baseName(path)}`, name: baseName(path), url }));

export const CUSTOM_WALLPAPERS = toImages(wallpaperFiles, 'custom');
export const CUSTOM_LOCK_WALLPAPERS = toImages(lockFiles, 'customlock');

export function customIcon(name: string): string | undefined {
  return CUSTOM_ICONS[name.toLowerCase()];
}

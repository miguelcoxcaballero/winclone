/** Locally bundled reference assets. Provenance: src/assets/windows/sources.json. */
import { customIcon } from '@/core/customAssets';
const files = import.meta.glob('/src/assets/windows/*.{png,svg}', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;
export const WINDOWS_ICONS: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace(/\.[^.]+$/, ''), url]),
);
export const iconUrl = (name: string): string | undefined => customIcon(name) ?? WINDOWS_ICONS[name];

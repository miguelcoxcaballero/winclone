import type { ComponentType, ReactNode } from 'react';
import type { AppIconProps } from '@/core/types';
import { iconUrl, WINDOWS_ICONS } from './windowsAssets';

/** Keep reference image pixels intact; CSS determines only their displayed size. */
export function imageIcon(url: string): ComponentType<AppIconProps> {
  return function ImageIcon({ size = 24, className }: AppIconProps) {
    return <img src={url} width={size} height={size} className={className} alt="" aria-hidden="true" draggable={false} style={{ objectFit: 'contain' }} />;
  };
}

function Generic({ size = 24, className }: AppIconProps) {
  return <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true"><rect x="5" y="8" width="38" height="32" rx="4" fill="#f4f6f9" stroke="#9aa5b1" /><path d="M5 12a4 4 0 0 1 4-4h30a4 4 0 0 1 4 4v4H5z" fill="#687889" /></svg>;
}

export function FolderIcon({ size = 24, className, badge }: AppIconProps & { badge?: ReactNode }) {
  const url = iconUrl('folder');
  if (!url) return <Generic size={size} className={className} />;
  if (!badge) return <img src={url} width={size} height={size} className={className} alt="" aria-hidden="true" draggable={false} />;
  return <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true"><image href={url} width="48" height="48" />{badge}</svg>;
}

export const APP_ICONS: Record<string, ComponentType<AppIconProps>> = { generic: Generic };
for (const id of Object.keys(WINDOWS_ICONS)) APP_ICONS[id] = imageIcon(iconUrl(id)!);

export function AppIcon({ appId, size = 24, className }: { appId: string; size?: number; className?: string }) {
  const override = iconUrl(appId);
  if (override) return <img src={override} width={size} height={size} className={className} alt="" aria-hidden="true" draggable={false} style={{ objectFit: 'contain' }} />;
  const C = APP_ICONS[appId] ?? Generic;
  return <C size={size} className={className} />;
}

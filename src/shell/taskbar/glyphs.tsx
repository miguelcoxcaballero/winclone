/** Reference taskbar imagery and the dynamic battery indicator. */
import { AppIcon } from '@/icons/AppIcons';
import { iconUrl } from '@/icons/windowsAssets';
export function TaskViewGlyph({ size = 24 }: { size?: number }) {
  return <img src={iconUrl('taskview')} width={size} height={size} alt="" aria-hidden="true" draggable={false} />;
}
export function WeatherGlyph({ size = 24 }: { size?: number }) {
  return <AppIcon appId="weather" size={size} />;
}

/** Battery glyph with a live fill level. */
export function BatteryGlyph({ level, charging, saver }: { level: number; charging?: boolean; saver?: boolean }) {
  const w = Math.max(1, Math.round(11 * level));
  return (
    <svg className="tb-glyph-sm" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1.5" y="4.5" width="12" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="14" y="6.5" width="1.2" height="3" rx=".5" fill="currentColor" />
      <rect x="2.5" y="5.5" width={Math.min(10, w)} height="5" rx=".6" fill={saver ? '#e5a400' : 'currentColor'} />
      {charging && <path d="M8.7 3.2 5.8 8.2h2.4l-1 4.6 3-5.2H7.8z" fill="currentColor" stroke="var(--acrylic-taskbar-solid)" strokeWidth=".6" />}
    </svg>
  );
}

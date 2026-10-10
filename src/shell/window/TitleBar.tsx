import type { ReactNode } from 'react';
import { AppIcon } from '@/icons/AppIcons';
import { ArrowLeftRegular } from '@fluentui/react-icons';
import './window.css';

interface TitleBarProps {
  title: string;
  /** App id whose icon is shown; pass `null` to hide the icon */
  appId?: string | null;
  /** Custom icon node (overrides appId) */
  icon?: ReactNode;
  height?: number;
  /** Optional back button (WinUI style) */
  onBack?: () => void;
  backDisabled?: boolean;
  /** Extra content rendered after the title (e.g. a search box). */
  children?: ReactNode;
  /** Reserve space on the right for caption buttons (default true) */
  reserveCaption?: boolean;
  className?: string;
  /** WinUI-style spacing (icon 16px from left, title 16px after icon) */
  variant?: 'win32' | 'winui';
}

/**
 * Standard draggable title bar. Apps with `titlebar: 'custom'` can render this
 * themselves (optionally with extra content) – everything marked `data-drag`
 * moves the window; buttons/inputs inside remain interactive.
 */
export function TitleBar({ title, appId, icon, height = 32, onBack, backDisabled, children, reserveCaption = true, className = '', variant = 'win32' }: TitleBarProps) {
  return (
    <div className={`titlebar tb-${variant} ${className}`} style={{ height, paddingRight: reserveCaption ? 138 : 0 }} data-drag>
      {onBack && (
        <button className="tb-back" onClick={onBack} disabled={backDisabled} title="Back" style={{ height: Math.min(height - 4, 36) }}>
          <ArrowLeftRegular />
        </button>
      )}
      {(icon || appId) && <span className="tb-icon">{icon ?? <AppIcon appId={appId!} size={16} />}</span>}
      <span className="tb-title">{title}</span>
      {children}
    </div>
  );
}

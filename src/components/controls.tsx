/*
 * Fluent / WinUI 3 style controls shared by every app.
 * Import from '@/components/controls'.
 */
import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownRegular, ChevronRightRegular, CheckmarkFilled, DismissRegular, SearchRegular, InfoFilled, ErrorCircleFilled, WarningFilled, CheckmarkCircleFilled } from '@fluentui/react-icons';
import './controls.css';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ───────────── Button ───────────── */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'standard' | 'accent' | 'subtle' | 'hyperlink';
  icon?: ReactNode;
  iconAfter?: ReactNode;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'standard', icon, iconAfter, className, children, ...rest }, ref,
) {
  return (
    <button ref={ref} className={cx('fl-btn', `fl-btn-${variant}`, !children && icon ? 'fl-btn-icon' : '', className)} {...rest}>
      {icon && <span className="fl-btn-ic">{icon}</span>}
      {children != null && <span className="fl-btn-label">{children}</span>}
      {iconAfter && <span className="fl-btn-ic">{iconAfter}</span>}
    </button>
  );
});

/* ───────────── Toggle switch ───────────── */
export function Toggle({ checked, onChange, disabled, label, onText = 'On', offText = 'Off', showText = true, labelPosition = 'left' }: {
  checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean; label?: ReactNode;
  onText?: string; offText?: string; showText?: boolean; labelPosition?: 'left' | 'right';
}) {
  return (
    <label className={cx('fl-toggle', disabled && 'disabled', labelPosition === 'right' && 'text-right')}>
      {label && <span className="fl-toggle-label">{label}</span>}
      {showText && labelPosition === 'left' && <span className="fl-toggle-text">{checked ? onText : offText}</span>}
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={cx('fl-switch', checked && 'on')}
        onClick={(e) => { e.preventDefault(); onChange?.(!checked); }}
      >
        <span className="fl-knob" />
      </button>
      {showText && labelPosition === 'right' && <span className="fl-toggle-text">{checked ? onText : offText}</span>}
    </label>
  );
}

/* ───────────── Checkbox ───────────── */
export function Checkbox({ checked, onChange, label, disabled, indeterminate }: { checked: boolean; onChange?: (v: boolean) => void; label?: ReactNode; disabled?: boolean; indeterminate?: boolean }) {
  return (
    <label className={cx('fl-check', disabled && 'disabled')} onClick={(e) => { e.preventDefault(); if (!disabled) onChange?.(!checked); }}>
      <span className={cx('fl-check-box', (checked || indeterminate) && 'on')}>
        {checked && !indeterminate && <CheckmarkFilled />}
        {indeterminate && <span className="fl-check-ind" />}
      </span>
      {label && <span className="fl-check-label">{label}</span>}
    </label>
  );
}

/* ───────────── Radio ───────────── */
export function Radio({ checked, onChange, label, disabled }: { checked: boolean; onChange?: () => void; label?: ReactNode; disabled?: boolean }) {
  return (
    <label className={cx('fl-radio', disabled && 'disabled')} onClick={(e) => { e.preventDefault(); if (!disabled) onChange?.(); }}>
      <span className={cx('fl-radio-dot', checked && 'on')} />
      {label && <span className="fl-radio-label">{label}</span>}
    </label>
  );
}

/* ───────────── Slider ───────────── */
export function Slider({ value, onChange, min = 0, max = 100, step = 1, disabled, width, vertical, ariaLabel, showTooltip = true, className }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; disabled?: boolean;
  width?: number | string; vertical?: boolean; ariaLabel?: string; showTooltip?: boolean; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);
  const pct = ((value - min) / (max - min)) * 100;
  const setFrom = (clientX: number, clientY: number) => {
    const r = ref.current!.getBoundingClientRect();
    let f = vertical ? 1 - (clientY - r.top) / r.height : (clientX - r.left) / r.width;
    f = Math.max(0, Math.min(1, f));
    const v = Math.round((min + f * (max - min)) / step) * step;
    onChange(Math.max(min, Math.min(max, +v.toFixed(4))));
  };
  const down = (e: React.PointerEvent) => {
    if (disabled || e.button !== 0) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag(true);
    setFrom(e.clientX, e.clientY);
  };
  return (
    <div
      ref={ref}
      className={cx('fl-slider', vertical && 'vertical', disabled && 'disabled', drag && 'dragging', className)}
      style={vertical ? { height: width } : { width }}
      onPointerDown={down}
      onPointerMove={(e) => drag && setFrom(e.clientX, e.clientY)}
      onPointerUp={() => setDrag(false)}
      onPointerCancel={() => setDrag(false)}
      role="slider"
      aria-label={ariaLabel}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(Math.min(max, value + step));
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(Math.max(min, value - step));
      }}
      data-nodrag
    >
      <div className="fl-slider-track" />
      <div className="fl-slider-fill" style={vertical ? { height: `${pct}%` } : { width: `${pct}%` }} />
      <div className="fl-slider-thumb" style={vertical ? { bottom: `${pct}%` } : { left: `${pct}%` }}>
        {drag && showTooltip && <div className="fl-slider-tip">{Math.round(value)}</div>}
      </div>
    </div>
  );
}

/* ───────────── Text box ───────────── */
export interface TextBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  value: string;
  onChange?: (v: string) => void;
  onEnter?: () => void;
  icon?: ReactNode;
  clearable?: boolean;
  width?: number | string;
}
export const TextBox = forwardRef<HTMLInputElement, TextBoxProps>(function TextBox(
  { value, onChange, onEnter, icon, clearable = true, width, className, style, ...rest }, ref,
) {
  return (
    <div className={cx('fl-textbox', rest.disabled && 'disabled', className)} style={{ width, ...style }}>
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onEnter?.(); rest.onKeyDown?.(e); }}
        spellCheck={false}
        {...rest}
      />
      {clearable && value && !rest.readOnly && (
        <button className="fl-textbox-clear" tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => onChange?.('')}>
          <DismissRegular />
        </button>
      )}
      {icon && <span className="fl-textbox-icon">{icon}</span>}
    </div>
  );
});

export function SearchBox(props: Omit<TextBoxProps, 'icon'>) {
  return <TextBox placeholder="Search" {...props} icon={<SearchRegular />} />;
}

/* ───────────── Text area ───────────── */
export function TextArea({ value, onChange, rows = 4, placeholder, className }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; className?: string }) {
  return (
    <div className={cx('fl-textbox fl-textarea', className)}>
      <textarea value={value} rows={rows} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/* ───────────── Combo box / dropdown ───────────── */
export interface Option<T extends string | number = string> { value: T; label: ReactNode; icon?: ReactNode }

export function ComboBox<T extends string | number>({ value, options, onChange, width, disabled, placeholder, className }: {
  value: T | null; options: Option<T>[]; onChange: (v: T) => void; width?: number | string; disabled?: boolean; placeholder?: string; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null);
  const cur = options.find((o) => o.value === value);
  const selIndex = Math.max(0, options.findIndex((o) => o.value === value));

  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const r = btn.current.getBoundingClientRect();
    const itemH = 36;
    const listH = Math.min(options.length * itemH + 8, 360);
    // WinUI places the popup so the selected item overlaps the box
    let top = r.top - 4 - selIndex * itemH + (r.height - itemH) / 2;
    top = Math.max(8, Math.min(top, window.innerHeight - listH - 8));
    setPos({ left: r.left - 0, top, width: r.width });
  }, [open, options.length, selIndex]);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if ((e.target as HTMLElement).closest?.('.fl-combo-popup')) return;
      setOpen(false);
    };
    const t = setTimeout(() => window.addEventListener('pointerdown', close, true), 0);
    return () => { clearTimeout(t); window.removeEventListener('pointerdown', close, true); };
  }, [open]);

  return (
    <>
      <button
        ref={btn}
        className={cx('fl-combo', open && 'open', className)}
        style={{ width }}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        data-nodrag
      >
        <span className="fl-combo-value">{cur?.icon}{cur ? cur.label : <span className="t-secondary">{placeholder}</span>}</span>
        <ChevronDownRegular className="fl-combo-chev" />
      </button>
      {open && pos && createPortal(
        <div className="fl-combo-popup" style={{ left: pos.left, top: pos.top, minWidth: pos.width }} data-theme-scope>
          {options.map((o) => (
            <button
              key={String(o.value)}
              className={cx('fl-combo-item', o.value === value && 'selected')}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.icon}<span>{o.label}</span>
            </button>
          ))}
        </div>,
        document.getElementById('overlay-root') ?? document.body,
      )}
    </>
  );
}

/* ───────────── Progress ───────────── */
export function ProgressBar({ value, indeterminate, className }: { value?: number; indeterminate?: boolean; className?: string }) {
  return (
    <div className={cx('fl-progress', indeterminate && 'indeterminate', className)}>
      <div className="fl-progress-fill" style={indeterminate ? undefined : { width: `${value ?? 0}%` }} />
    </div>
  );
}

export function ProgressRing({ size = 32, value, className, strokeWidth }: { size?: number; value?: number; className?: string; strokeWidth?: number }) {
  const sw = strokeWidth ?? Math.max(2, size / 10);
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const det = value != null;
  return (
    <svg className={cx('fl-ring', !det && 'spin', className)} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={det ? 'var(--control-strong-stroke-disabled)' : 'none'} strokeWidth={sw} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent-fill)" strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={det ? `${(c * (value ?? 0)) / 100} ${c}` : `${c * 0.3} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className={!det ? 'fl-ring-arc' : ''}
      />
    </svg>
  );
}

/** The classic Windows boot / shutdown "dots" spinner. */
export function DotsSpinner({ size = 40, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <div className="fl-dots" style={{ width: size, height: size, ['--dot-color' as string]: color, ['--dot-size' as string]: `${Math.max(3, size / 9)}px` }}>
      {Array.from({ length: 5 }, (_, i) => <span key={i} style={{ animationDelay: `${i * 0.15}s` }}><i /></span>)}
    </div>
  );
}

/* ───────────── Settings-style card ───────────── */
export function SettingsCard({ icon, title, description, children, onClick, chevron, className, expanded, external }: {
  icon?: ReactNode; title: ReactNode; description?: ReactNode; children?: ReactNode; onClick?: () => void;
  chevron?: boolean | 'down' | 'up'; className?: string; expanded?: boolean; external?: boolean;
}) {
  return (
    <div className={cx('fl-card', onClick && 'clickable', expanded && 'expanded', className)} onClick={onClick} role={onClick ? 'button' : undefined}>
      {icon && <span className="fl-card-icon">{icon}</span>}
      <div className="fl-card-text">
        <div className="fl-card-title">{title}</div>
        {description && <div className="fl-card-desc">{description}</div>}
      </div>
      {children != null && <div className="fl-card-action" onClick={(e) => onClick && e.stopPropagation()}>{children}</div>}
      {chevron && (
        <span className={cx('fl-card-chev', chevron === 'up' && 'up')}>
          {chevron === true ? <ChevronRightRegular /> : <ChevronDownRegular />}
        </span>
      )}
      {external && <span className="fl-card-chev">↗</span>}
    </div>
  );
}

/** A card that expands to reveal nested rows (WinUI Expander). */
export function Expander({ icon, title, description, header, children, defaultOpen = false }: {
  icon?: ReactNode; title: ReactNode; description?: ReactNode; header?: ReactNode; children: ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cx('fl-expander', open && 'open')}>
      <SettingsCard icon={icon} title={title} description={description} onClick={() => setOpen(!open)} chevron={open ? 'up' : 'down'} expanded={open}>
        {header}
      </SettingsCard>
      {open && <div className="fl-expander-body">{children}</div>}
    </div>
  );
}

/* ───────────── InfoBar ───────────── */
export function InfoBar({ severity = 'info', title, message, onClose, action }: {
  severity?: 'info' | 'success' | 'warning' | 'error'; title?: ReactNode; message?: ReactNode; onClose?: () => void; action?: ReactNode;
}) {
  const icon = { info: <InfoFilled />, success: <CheckmarkCircleFilled />, warning: <WarningFilled />, error: <ErrorCircleFilled /> }[severity];
  return (
    <div className={cx('fl-infobar', `sev-${severity}`)}>
      <span className="fl-infobar-icon">{icon}</span>
      <div className="fl-infobar-text">{title && <b>{title}</b>} {message}</div>
      {action}
      {onClose && <button className="fl-infobar-close" onClick={onClose}><DismissRegular /></button>}
    </div>
  );
}

/* ───────────── Content dialog (modal within a window) ───────────── */
export function Dialog({ open, title, children, primary, secondary, close, onPrimary, onSecondary, onClose, width = 448 }: {
  open: boolean; title: ReactNode; children?: ReactNode; primary?: string; secondary?: string; close?: string;
  onPrimary?: () => void; onSecondary?: () => void; onClose?: () => void; width?: number;
}) {
  if (!open) return null;
  return (
    <div className="fl-dialog-smoke" onPointerDown={(e) => e.stopPropagation()}>
      <div className="fl-dialog" style={{ width }} role="dialog">
        <div className="fl-dialog-content">
          <div className="t-subtitle fl-dialog-title">{title}</div>
          <div className="fl-dialog-body">{children}</div>
        </div>
        <div className="fl-dialog-footer">
          {primary && <Button variant="accent" onClick={onPrimary} autoFocus>{primary}</Button>}
          {secondary && <Button onClick={onSecondary}>{secondary}</Button>}
          {close && <Button onClick={onClose}>{close}</Button>}
        </div>
      </div>
    </div>
  );
}

/* ───────────── Navigation view item (left pane) ───────────── */
export function NavItem({ icon, label, selected, onClick, collapsed, badge, indent = 0, chevron }: {
  icon?: ReactNode; label: ReactNode; selected?: boolean; onClick?: () => void; collapsed?: boolean; badge?: ReactNode; indent?: number; chevron?: ReactNode;
}) {
  return (
    <button className={cx('fl-nav-item', selected && 'selected', collapsed && 'collapsed')} onClick={onClick} style={{ paddingLeft: 12 + indent * 16 }} title={collapsed && typeof label === 'string' ? label : undefined}>
      {chevron && <span className="fl-nav-chev">{chevron}</span>}
      {icon && <span className="fl-nav-icon">{icon}</span>}
      {!collapsed && <span className="fl-nav-label">{label}</span>}
      {badge && !collapsed && <span className="fl-nav-badge">{badge}</span>}
    </button>
  );
}

/* ───────────── Tooltip ───────────── */
export function Tooltip({ text, children, placement = 'top' }: { text: ReactNode; children: ReactNode; placement?: 'top' | 'bottom' }) {
  const [show, setShow] = useState<DOMRect | null>(null);
  const t = useRef<number>(0);
  const id = useId();
  return (
    <span
      className="fl-tooltip-host"
      onMouseEnter={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); clearTimeout(t.current); t.current = window.setTimeout(() => setShow(r), 600); }}
      onMouseLeave={() => { clearTimeout(t.current); setShow(null); }}
      onMouseDown={() => { clearTimeout(t.current); setShow(null); }}
      aria-describedby={id}
    >
      {children}
      {show && createPortal(
        <div id={id} className="fl-tooltip" style={{ left: show.left + show.width / 2, top: placement === 'top' ? show.top - 8 : show.bottom + 8, transform: `translate(-50%, ${placement === 'top' ? '-100%' : '0'})` }}>
          {text}
        </div>,
        document.getElementById('overlay-root') ?? document.body,
      )}
    </span>
  );
}

/* ───────────── Segmented / pivot tabs ───────────── */
export function Pivot<T extends string>({ items, value, onChange }: { items: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="fl-pivot">
      {items.map((i) => (
        <button key={i.value} className={cx('fl-pivot-item', i.value === value && 'selected')} onClick={() => onChange(i.value)}>
          {i.label}
        </button>
      ))}
    </div>
  );
}

/* ───────────── Menu bar (File / Edit / View) ───────────── */
import type { MenuItem } from '@/core/types';
import { useShell } from '@/core/store/shell';

export function MenuBar({ menus }: { menus: { label: string; items: MenuItem[] }[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const cm = useShell((s) => s.contextMenu);
  useEffect(() => { if (!cm) setOpenIdx(null); }, [cm]);
  const openAt = (i: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setOpenIdx(i);
    useShell.getState().showContextMenu({ x: r.left, y: r.bottom + 2, items: menus[i].items });
  };
  return (
    <div className="fl-menubar" data-nodrag>
      {menus.map((m, i) => (
        <button
          key={m.label}
          className={cx('fl-menubar-item', openIdx === i && 'open')}
          onClick={(e) => (openIdx === i ? (useShell.getState().hideContextMenu(), setOpenIdx(null)) : openAt(i, e.currentTarget))}
          onMouseEnter={(e) => { if (openIdx !== null && openIdx !== i) openAt(i, e.currentTarget); }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

/* ───────────── Small helpers ───────────── */
export function Divider({ vertical, className }: { vertical?: boolean; className?: string }) {
  return <div className={cx(vertical ? 'fl-divider-v' : 'fl-divider', className)} />;
}

export function Hyperlink({ children, onClick, href }: { children: ReactNode; onClick?: () => void; href?: string }) {
  return href
    ? <a className="fl-link" href={href} target="_blank" rel="noreferrer">{children}</a>
    : <button className="fl-link" onClick={onClick}>{children}</button>;
}

export { cx };

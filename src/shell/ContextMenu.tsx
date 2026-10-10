import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronRightRegular, CheckmarkRegular } from '@fluentui/react-icons';
import { useShell } from '@/core/store/shell';
import type { MenuItem } from '@/core/types';
import './contextmenu.css';

function MenuList({ items, x, y, onDone, legacy, quickActions, sub, placement }: {
  items: MenuItem[]; x: number; y: number; onDone: () => void; legacy?: boolean; sub?: boolean;
  quickActions?: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }[];
  placement?: 'auto' | 'top';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; up: boolean } | null>(null);
  const [openSub, setOpenSub] = useState<{ idx: number; x: number; y: number } | null>(null);
  const subTimer = useRef<number>(0);
  const hasIcons = items.some((i) => i.icon || i.checked !== undefined);

  useLayoutEffect(() => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    let left = x, top = y, up = false;
    if (sub) {
      if (left + r.width > vw - 4) left = x - r.width - (sub ? 0 : 0) - (sub ? (el.dataset.parentW ? +el.dataset.parentW : 0) : 0);
    } else if (left + r.width > vw - 4) left = Math.max(4, x - r.width);
    if (placement === 'top' || top + r.height > vh - 4) {
      top = placement === 'top' ? y - r.height : Math.max(4, y - r.height);
      up = true;
    }
    if (top < 4) top = 4;
    setPos({ left: Math.max(4, left), top, up });
  }, [x, y, sub, placement]);

  const enter = (i: number, it: MenuItem, el: HTMLElement) => {
    clearTimeout(subTimer.current);
    if (it.submenu) {
      const r = el.getBoundingClientRect();
      subTimer.current = window.setTimeout(() => setOpenSub({ idx: i, x: r.right + 2, y: r.top - 5 }), 150);
    } else subTimer.current = window.setTimeout(() => setOpenSub(null), 250);
  };

  return (
    <>
      <div
        ref={ref}
        className={`ctx-menu ${legacy ? 'legacy' : ''} ${pos?.up ? 'up' : ''} ${hasIcons ? 'has-icons' : ''}`}
        style={{ left: pos?.left ?? x, top: pos?.top ?? y, visibility: pos ? 'visible' : 'hidden' }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {quickActions && quickActions.length > 0 && (
          <>
            <div className="ctx-quick">
              {quickActions.map((q) => (
                <button key={q.label} className="ctx-quick-btn" title={q.label} disabled={q.disabled} onClick={() => { onDone(); q.onClick(); }}>
                  {q.icon}
                </button>
              ))}
            </div>
            <div className="ctx-sep" />
          </>
        )}
        {items.map((it, i) =>
          it.separator ? (
            <div key={`s${i}`} className="ctx-sep" />
          ) : (
            <button
              key={it.id ?? `${it.label}${i}`}
              className={`ctx-item ${it.bold ? 'bold' : ''} ${openSub?.idx === i ? 'sub-open' : ''}`}
              disabled={it.disabled}
              onMouseEnter={(e) => enter(i, it, e.currentTarget)}
              onClick={(e) => {
                if (it.submenu) {
                  const r = e.currentTarget.getBoundingClientRect();
                  setOpenSub({ idx: i, x: r.right + 2, y: r.top - 5 });
                  return;
                }
                onDone();
                it.onClick?.();
              }}
            >
              {hasIcons && (
                <span className="ctx-icon">
                  {it.checked ? (it.radio ? <span className="ctx-radio" /> : <CheckmarkRegular />) : it.icon}
                </span>
              )}
              <span className="ctx-label">{it.label}</span>
              {it.shortcut && <span className="ctx-shortcut">{it.shortcut}</span>}
              {it.submenu && <span className="ctx-chev"><ChevronRightRegular /></span>}
            </button>
          ),
        )}
      </div>
      {openSub && items[openSub.idx]?.submenu && (
        <MenuList items={items[openSub.idx].submenu!} x={openSub.x} y={openSub.y} onDone={onDone} legacy={legacy} sub />
      )}
    </>
  );
}

export function ContextMenuLayer() {
  const spec = useShell((s) => s.contextMenu);
  const hide = useShell((s) => s.hideContextMenu);

  useEffect(() => {
    if (!spec) return;
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('.ctx-menu, .fl-menubar-item')) return;
      hide();
    };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') hide(); };
    const blur = () => hide();
    const t = setTimeout(() => {
      window.addEventListener('pointerdown', down, true);
      window.addEventListener('keydown', key);
      window.addEventListener('blur', blur);
      window.addEventListener('resize', blur);
    }, 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener('pointerdown', down, true);
      window.removeEventListener('keydown', key);
      window.removeEventListener('blur', blur);
      window.removeEventListener('resize', blur);
    };
  }, [spec, hide]);

  if (!spec) return null;
  return (
    <div className="ctx-layer">
      <MenuList key={`${spec.x},${spec.y}`} items={spec.items} x={spec.x} y={spec.y} onDone={hide} legacy={spec.legacy} quickActions={spec.quickActions} placement={spec.placement} />
    </div>
  );
}

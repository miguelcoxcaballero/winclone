import { useEffect, useRef, useState } from 'react';
import { useWindows } from '@/core/store/windows';
import { useSettings } from '@/core/store/settings';
import type { SnapZone } from '@/core/types';
import './window.css';

/* Thin 10×10 caption glyphs */
const Min = () => <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 5h10" stroke="currentColor" strokeWidth="1" /></svg>;
const Max = () => <svg width="10" height="10" viewBox="0 0 10 10"><rect x=".5" y=".5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1" /></svg>;
const Restore = () => (
  <svg width="10" height="10" viewBox="0 0 10 10">
    <rect x=".5" y="2.5" width="7" height="7" rx="1.3" fill="none" stroke="currentColor" strokeWidth="1" />
    <path d="M2.5 2.5V2A1.5 1.5 0 0 1 4 .5h4A1.5 1.5 0 0 1 9.5 2v4A1.5 1.5 0 0 1 8 7.5h-.5" fill="none" stroke="currentColor" strokeWidth="1" />
  </svg>
);
const Close = () => <svg width="10" height="10" viewBox="0 0 10 10"><path d="M.5.5l9 9m0-9-9 9" stroke="currentColor" strokeWidth="1" /></svg>;

interface Props {
  winId: string;
  height: number;
  maximized: boolean;
  active: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  theme?: 'auto' | 'dark';
}

/** Snap layout templates (fractions of the work area) */
const LAYOUTS: { x: number; y: number; w: number; h: number }[][] = [
  [{ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 1 }],
  [{ x: 0, y: 0, w: 2 / 3, h: 1 }, { x: 2 / 3, y: 0, w: 1 / 3, h: 1 }],
  [{ x: 0, y: 0, w: 1 / 3, h: 1 }, { x: 1 / 3, y: 0, w: 1 / 3, h: 1 }, { x: 2 / 3, y: 0, w: 1 / 3, h: 1 }],
  [{ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 0.5 }, { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }],
  [{ x: 0, y: 0, w: 0.5, h: 0.5 }, { x: 0.5, y: 0, w: 0.5, h: 0.5 }, { x: 0, y: 0.5, w: 0.5, h: 0.5 }, { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }],
  [{ x: 0, y: 0, w: 0.25, h: 1 }, { x: 0.25, y: 0, w: 0.5, h: 1 }, { x: 0.75, y: 0, w: 0.25, h: 1 }],
];

export function CaptionButtons({ winId, height, maximized, active, minimizable = true, maximizable = true, theme = 'auto' }: Props) {
  const api = useWindows.getState;
  const snapEnabled = useSettings((s) => s.snapWindows);
  const [layoutsOpen, setLayoutsOpen] = useState(false);
  const timer = useRef<number>(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onMaxEnter = () => {
    if (!maximizable || !snapEnabled) return;
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLayoutsOpen(true), 450);
  };
  const onMaxLeave = () => {
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLayoutsOpen(false), 250);
  };

  const pick = (zone: SnapZone) => {
    setLayoutsOpen(false);
    const z = zone as { x: number; y: number; w: number; h: number };
    if (z.x === 0 && z.y === 0 && z.w === 0.5 && z.h === 1) return api().snapTo(winId, 'left');
    if (z.x === 0.5 && z.y === 0 && z.w === 0.5 && z.h === 1) return api().snapTo(winId, 'right');
    api().snapTo(winId, zone);
  };

  return (
    <div className={`caption-buttons ${active ? '' : 'inactive'} ${theme === 'dark' ? 'cb-dark' : ''}`} style={{ height }} data-nodrag>
      {minimizable && (
        <button className="cb" title="Minimize" onClick={(e) => { e.stopPropagation(); api().minimize(winId); }} style={{ height }}>
          <Min />
        </button>
      )}
      {(minimizable || maximizable) && (
        <button
          className="cb"
          title={maximized ? 'Restore Down' : 'Maximize'}
          disabled={!maximizable}
          onClick={(e) => { e.stopPropagation(); setLayoutsOpen(false); api().toggleMaximize(winId); }}
          onMouseEnter={onMaxEnter}
          onMouseLeave={onMaxLeave}
          style={{ height }}
        >
          {maximized ? <Restore /> : <Max />}
        </button>
      )}
      <button className="cb cb-close" title="Close" onClick={(e) => { e.stopPropagation(); api().close(winId); }} style={{ height }}>
        <Close />
      </button>

      {layoutsOpen && (
        <div className="snap-layouts" onMouseEnter={() => clearTimeout(timer.current)} onMouseLeave={onMaxLeave}>
          {LAYOUTS.map((layout, i) => (
            <div key={i} className="snap-layout">
              {layout.map((z, j) => (
                <button
                  key={j}
                  className="snap-zone"
                  style={{ left: `${z.x * 100}%`, top: `${z.y * 100}%`, width: `${z.w * 100}%`, height: `${z.h * 100}%` }}
                  onClick={() => pick(z)}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

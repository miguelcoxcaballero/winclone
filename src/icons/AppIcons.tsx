/*
 * Original app icon artwork drawn for this project in a soft, gradient
 * "Fluent-like" style. All icons use a 48×48 design grid.
 */
import { useId, type ComponentType, type ReactNode } from 'react';
import type { AppIconProps } from '@/core/types';

type Defs = (id: (n: string) => string) => ReactNode;

function Icon({ size = 24, className, defs, children }: AppIconProps & { defs?: Defs; children: (id: (n: string) => string) => ReactNode }) {
  const uid = useId().replace(/:/g, '');
  const id = (n: string) => `${uid}-${n}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      {defs && <defs>{defs(id)}</defs>}
      {children(id)}
    </svg>
  );
}

const lg = (id: string, stops: [string, string][], x1 = 0, y1 = 0, x2 = 0, y2 = 1) => (
  <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
    {stops.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
  </linearGradient>
);
const rg = (id: string, stops: [string, string][], cx = 0.5, cy = 0.5, r = 0.5) => (
  <radialGradient id={id} cx={cx} cy={cy} r={r}>
    {stops.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
  </radialGradient>
);

/* ───────────────────────── Folder (generic) ───────────────────────── */
export function FolderIcon({ size, className, badge }: AppIconProps & { badge?: ReactNode }) {
  return (
    <Icon size={size} className={className}
      defs={(id) => <>
        {lg(id('back'), [['0', '#E8A33D'], ['1', '#D98B1F']])}
        {lg(id('front'), [['0', '#FFD66B'], ['1', '#F7B83A']])}
      </>}>
      {(id) => <>
        <path d="M4 11.5A3.5 3.5 0 0 1 7.5 8h10.1c.9 0 1.8.4 2.5 1l2.4 2.3c.4.4 1 .7 1.6.7H40.5A3.5 3.5 0 0 1 44 15.5v20A3.5 3.5 0 0 1 40.5 39h-33A3.5 3.5 0 0 1 4 35.5z" fill={`url(#${id('back')})`} />
        <path d="M4 18.5A3.5 3.5 0 0 1 7.5 15h33a3.5 3.5 0 0 1 3.5 3.5v18A3.5 3.5 0 0 1 40.5 40h-33A3.5 3.5 0 0 1 4 36.5z" fill={`url(#${id('front')})`} />
        <path d="M4 18.5A3.5 3.5 0 0 1 7.5 15h33a3.5 3.5 0 0 1 3.5 3.5v.6H4z" fill="#fff" opacity=".35" />
        {badge}
      </>}
    </Icon>
  );
}

/* ───────────────────────── File Explorer ───────────────────────── */
function Explorer(p: AppIconProps) {
  return (
    <Icon {...p}
      defs={(id) => <>
        {lg(id('back'), [['0', '#E39B2E'], ['1', '#C9800F']])}
        {lg(id('front'), [['0', '#FFDD72'], ['1', '#F5AE2E']])}
        {lg(id('band'), [['0', '#4AA8F0'], ['1', '#1E73CF']], 0, 0, 1, 0)}
      </>}>
      {(id) => <>
        <path d="M3 10.5A3.5 3.5 0 0 1 6.5 7h10.3c1 0 1.9.4 2.6 1.1L22 11h19.5a3.5 3.5 0 0 1 3.5 3.5V36a3.5 3.5 0 0 1-3.5 3.5h-35A3.5 3.5 0 0 1 3 36z" fill={`url(#${id('back')})`} />
        <path d="M3 17.5A3.5 3.5 0 0 1 6.5 14h35a3.5 3.5 0 0 1 3.5 3.5V37a3.5 3.5 0 0 1-3.5 3.5h-35A3.5 3.5 0 0 1 3 37z" fill={`url(#${id('front')})`} />
        <rect x="11" y="30" width="26" height="4" rx="2" fill={`url(#${id('band')})`} />
      </>}
    </Icon>
  );
}

/* ───────────────────────── Browser ───────────────────────── */
function Browser(p: AppIconProps) {
  return (
    <Icon {...p}
      defs={(id) => <>
        {lg(id('a'), [['0', '#3FD0C9'], ['0.55', '#1C9BE6'], ['1', '#1559C7']], 0, 0, 1, 1)}
        {lg(id('ring'), [['0', '#7CF0B5'], ['1', '#21B6A8']], 0, 0, 1, 0)}
      </>}>
      {(id) => <>
        <circle cx="24" cy="24" r="19" fill={`url(#${id('a')})`} />
        <g fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6">
          <ellipse cx="24" cy="24" rx="8" ry="19" />
          <path d="M5.5 19h37M5.5 29h37" />
          <path d="M24 5v38" />
        </g>
        <ellipse cx="24" cy="25" rx="22" ry="7.5" fill="none" stroke={`url(#${id('ring')})`} strokeWidth="3.2" transform="rotate(-24 24 25)" />
        <circle cx="38.5" cy="15.6" r="2.6" fill="#E9FFF5" />
      </>}
    </Icon>
  );
}

/* ───────────────────────── Store ───────────────────────── */
function Store(p: AppIconProps) {
  return (
    <Icon {...p}
      defs={(id) => <>
        {lg(id('bag'), [['0', '#5B8DEF'], ['1', '#3F51D9']], 0, 0, 1, 1)}
        {lg(id('top'), [['0', '#86B4FF'], ['1', '#5B8DEF']])}
      </>}>
      {(id) => <>
        <path d="M17 13v-1.5a7 7 0 0 1 14 0V13" fill="none" stroke="#2F3FA8" strokeWidth="3" strokeLinecap="round" />
        <path d="M7.6 15.4A2.5 2.5 0 0 1 10.1 13h27.8a2.5 2.5 0 0 1 2.5 2.4l1.1 23.5A4 4 0 0 1 37.5 43h-27a4 4 0 0 1-4-4.1z" fill={`url(#${id('bag')})`} />
        <path d="M7.5 17.4l.1-2A2.5 2.5 0 0 1 10.1 13h27.8a2.5 2.5 0 0 1 2.5 2.4l.1 2z" fill={`url(#${id('top')})`} />
        <path d="M24 22.5l2.4 5 5.4.6-4 3.7 1.1 5.3L24 34.4l-4.9 2.7 1.1-5.3-4-3.7 5.4-.6z" fill="#fff" />
      </>}
    </Icon>
  );
}

/* ───────────────────────── Settings (gear) ───────────────────────── */
function Settings(p: AppIconProps) {
  const teeth = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <Icon {...p}
      defs={(id) => <>
        {lg(id('g'), [['0', '#A3AAB5'], ['1', '#5E6672']], 0, 0, 1, 1)}
        {lg(id('c'), [['0', '#3E97F0'], ['1', '#1A5FC8']], 0, 0, 1, 1)}
      </>}>
      {(id) => <>
        <g fill={`url(#${id('g')})`}>
          {teeth.map((a) => <rect key={a} x="20.5" y="3.5" width="7" height="9" rx="2" transform={`rotate(${a} 24 24)`} />)}
          <circle cx="24" cy="24" r="16" />
        </g>
        <circle cx="24" cy="24" r="16" fill="#fff" opacity=".12" />
        <circle cx="24" cy="24" r="8.5" fill={`url(#${id('c')})`} />
        <circle cx="24" cy="24" r="4" fill="#E9F3FF" />
      </>}
    </Icon>
  );
}

/* ───────────────────────── Notepad ───────────────────────── */
function Notepad(p: AppIconProps) {
  return (
    <Icon {...p}
      defs={(id) => <>
        {lg(id('pg'), [['0', '#FFFFFF'], ['1', '#E3E8EF']])}
        {lg(id('top'), [['0', '#53A7F5'], ['1', '#2775D6']])}
      </>}>
      {(id) => <>
        <rect x="8" y="7" width="32" height="37" rx="3.5" fill={`url(#${id('pg')})`} stroke="#B7C0CC" strokeWidth=".8" />
        <path d="M8 10.5A3.5 3.5 0 0 1 11.5 7h25A3.5 3.5 0 0 1 40 10.5V15H8z" fill={`url(#${id('top')})`} />
        {[13, 20, 27, 34].map((x) => <rect key={x} x={x} y="4" width="2.6" height="7" rx="1.3" fill="#5D6774" />)}
        {[21, 26.5, 32, 37.5].map((y, i) => <rect key={y} x="13" y={y} width={i === 3 ? 13 : 22} height="2" rx="1" fill="#9AA6B5" />)}
      </>}
    </Icon>
  );
}

/* ───────────────────────── Calculator ───────────────────────── */
function Calculator(p: AppIconProps) {
  return (
    <Icon {...p}
      defs={(id) => <>
        {lg(id('b'), [['0', '#5D6673'], ['1', '#3A414B']], 0, 0, 1, 1)}
      </>}>
      {(id) => <>
        <rect x="8" y="4" width="32" height="40" rx="5" fill={`url(#${id('b')})`} />
        <rect x="12" y="8" width="24" height="9" rx="2" fill="#C9F0E0" />
        <rect x="27" y="11" width="6" height="3" rx="1" fill="#2F6D57" opacity=".7" />
        {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
          <rect key={`${r}${c}`} x={12 + c * 8.5} y={21 + r * 7.2} width="6.5" height="5.2" rx="1.4" fill="#C5CBD3" />
        )))}
        <rect x="12" y="37" width="15" height="4" rx="1.4" fill="#C5CBD3" opacity=".9" />
        <rect x="29" y="37" width="6.5" height="4" rx="1.4" fill="#4D9CF5" />
      </>}
    </Icon>
  );
}

/* ───────────────────────── Paint ───────────────────────── */
function Paint(p: AppIconProps) {
  return (
    <Icon {...p}
      defs={(id) => <>
        {lg(id('pal'), [['0', '#FFF7EC'], ['1', '#F1DDC2']], 0, 0, 1, 1)}
        {lg(id('br'), [['0', '#FFB45A'], ['1', '#E8730C']], 0, 0, 1, 1)}
      </>}>
      {(id) => <>
        <path d="M24 5C12.4 5 4 12.6 4 22.5 4 33 12 41 22.5 41c3 0 4.2-1.8 4.2-3.8 0-1.4-.8-2.3-.8-3.6 0-1.8 1.4-3 3.3-3H33c6.4 0 11-4.2 11-10C44 11.4 35.3 5 24 5z" fill={`url(#${id('pal')})`} stroke="#D1B793" strokeWidth=".8" />
        <circle cx="13" cy="21" r="3.4" fill="#E8453C" />
        <circle cx="18" cy="12.8" r="3.4" fill="#F7B731" />
        <circle cx="27.5" cy="11.5" r="3.4" fill="#2ECC71" />
        <circle cx="35.5" cy="17" r="3.4" fill="#3498DB" />
        <circle cx="14.5" cy="30.5" r="3.4" fill="#9B59B6" />
        <path d="M44.3 25.6 31.9 38a3.3 3.3 0 0 1-4.6 0l-.1-.1a3.3 3.3 0 0 1 0-4.6L39.6 21z" fill={`url(#${id('br')})`} />
        <path d="M27.2 37.9c-1.4 1.4-1.3 4-4.9 5.6 4.8 1 8.4-.6 9.6-3.4z" fill="#3B3F46" />
      </>}
    </Icon>
  );
}

/* ───────────────────────── Photos ───────────────────────── */
function Photos(p: AppIconProps) {
  return (
    <Icon {...p}
      defs={(id) => <>
        {lg(id('sky'), [['0', '#62C3FF'], ['1', '#2C86E8']])}
        {lg(id('m1'), [['0', '#5BD18E'], ['1', '#219A5C']])}
        {lg(id('m2'), [['0', '#2CB673'], ['1', '#167447']])}
      </>}>
      {(id) => <>
        <rect x="4" y="8" width="40" height="32" rx="5" fill={`url(#${id('sky')})`} />
        <circle cx="33" cy="17" r="4" fill="#FFE27A" />
        <path d="M4 33.5 15.5 21a2 2 0 0 1 3 0L31 34.5V40H9a5 5 0 0 1-5-5z" fill={`url(#${id('m1')})`} />
        <path d="M18 40 30.5 27a2 2 0 0 1 2.9 0L44 37.2V35a5 5 0 0 1-5 5z" fill={`url(#${id('m2')})`} />
      </>}
    </Icon>
  );
}

/* ───────────────────────── Media player ───────────────────────── */
function MediaPlayer(p: AppIconProps) {
  return (
    <Icon {...p}
      defs={(id) => <>
        {lg(id('b'), [['0', '#FF7A59'], ['0.55', '#F0477E'], ['1', '#B83CC7']], 0, 0, 1, 1)}
      </>}>
      {(id) => <>
        <circle cx="24" cy="24" r="20" fill={`url(#${id('b')})`} />
        <circle cx="24" cy="24" r="14" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="1.4" />
        <path d="M20 16.2v15.6a1.2 1.2 0 0 0 1.8 1l12.5-7.8a1.2 1.2 0 0 0 0-2L21.8 15.2a1.2 1.2 0 0 0-1.8 1z" fill="#fff" />
      </>}
    </Icon>
  );
}

/* ───────────────────────── Clock ───────────────────────── */
function Clock(p: AppIconProps) {
  return (
    <Icon {...p}
      defs={(id) => <>
        {lg(id('rim'), [['0', '#4AA3F2'], ['1', '#1F5FC4']], 0, 0, 1, 1)}
        {lg(id('face'), [['0', '#FFFFFF'], ['1', '#E4EAF2']])}
      </>}>
      {(id) => <>
        <circle cx="24" cy="25" r="19" fill={`url(#${id('rim')})`} />
        <circle cx="24" cy="25" r="15" fill={`url(#${id('face')})`} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x="23.4" y="11.5" width="1.2" height={i % 3 === 0 ? 3 : 1.8} rx=".6" fill="#7C8794" transform={`rotate(${i * 30} 24 25)`} />
        ))}
        <rect x="23" y="15.5" width="2" height="10.5" rx="1" fill="#2A2F36" />
        <rect x="23" y="23.8" width="2" height="9" rx="1" fill="#2A2F36" transform="rotate(-60 24 25)" />
        <circle cx="24" cy="25" r="1.8" fill="#1F5FC4" />
      </>}
    </Icon>
  );
}

/* ───────────────────────── Terminal ───────────────────────── */
function Terminal(p: AppIconProps) {
  return (
    <Icon {...p}
      defs={(id) => <>
        {lg(id('b'), [['0', '#3B4250'], ['1', '#1E2229']], 0, 0, 1, 1)}
        {lg(id('bar'), [['0', '#626B7A'], ['1', '#4A5260']])}
      </>}>
      {(id) => <>
        <rect x="4" y="7" width="40" height="34" rx="5" fill={`url(#${id('b')})`} />
        <path d="M4 12a5 5 0 0 1 5-5h30a5 5 0 0 1 5 5v1.8H4z" fill={`url(#${id('bar')})`} />
        <path d="m11.5 21 7 5.5-7 5.5" fill="none" stroke="#E8ECF2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="21.5" y="30.5" width="12" height="3" rx="1.5" fill="#E8ECF2" />
      </>}
    </Icon>
  );
}

/* ───────────────────────── Camera ───────────────────────── */
function Camera(p: AppIconProps) {
  return (
    <Icon {...p}
      defs={(id) => <>
        {lg(id('b'), [['0', '#5B6472'], ['1', '#2E343D']], 0, 0, 1, 1)}
        {rg(id('lens'), [['0', '#6FC3FF'], ['0.5', '#1E5FB8'], ['1', '#0B1C3A']], 0.4, 0.35, 0.7)}
      </>}>
      {(id) => <>
        <path d="M16.5 10.5 18.6 7h10.8l2.1 3.5H39a5 5 0 0 1 5 5V36a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V15.5a5 5 0 0 1 5-5z" fill={`url(#${id('b')})`} />
        <circle cx="24" cy="25" r="10.5" fill="#1B1F25" />
        <circle cx="24" cy="25" r="8" fill={`url(#${id('lens')})`} />
        <circle cx="21.2" cy="22.2" r="2.2" fill="#fff" opacity=".7" />
        <circle cx="37" cy="16" r="1.8" fill="#9FE6A0" />
      </>}
    </Icon>
  );
}

/* ───────────────────────── Weather ───────────────────────── */
function Weather(p: AppIconProps) {
  return (
    <Icon {...p}
      defs={(id) => <>
        {rg(id('sun'), [['0', '#FFE37A'], ['1', '#FFAA2B']], 0.4, 0.4, 0.6)}
        {lg(id('cl'), [['0', '#FFFFFF'], ['1', '#D2DEEE']])}
      </>}>
      {(id) => <>
        <circle cx="18" cy="17" r="11" fill={`url(#${id('sun')})`} />
        <path d="M14.5 41a8.5 8.5 0 0 1-.9-17A11 11 0 0 1 35 22.3a9.3 9.3 0 1 1 1.7 18.7z" fill={`url(#${id('cl')})`} stroke="#B8C6D9" strokeWidth=".6" />
      </>}
    </Icon>
  );
}

/* ───────────────────────── Task Manager ───────────────────────── */
function TaskManager(p: AppIconProps) {
  return (
    <Icon {...p}
      defs={(id) => <>
        {lg(id('b'), [['0', '#FFFFFF'], ['1', '#E2E8F0']])}
        {lg(id('area'), [['0', '#58D68D'], ['1', '#58D68D00']])}
      </>}>
      {(id) => <>
        <rect x="4" y="7" width="40" height="34" rx="4.5" fill={`url(#${id('b')})`} stroke="#A9B4C2" strokeWidth=".8" />
        <path d="M4 11.5A4.5 4.5 0 0 1 8.5 7h31a4.5 4.5 0 0 1 4.5 4.5V14H4z" fill="#2B78D8" />
        <path d="M8 35l7-9 6 5 8-12 5 7 6-4v14H8z" fill={`url(#${id('area')})`} opacity=".55" />
        <path d="M8 35l7-9 6 5 8-12 5 7 6-4" fill="none" stroke="#1E9E57" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      </>}
    </Icon>
  );
}

/* ───────────────────────── Snipping tool ───────────────────────── */
function Snipping(p: AppIconProps) {
  return (
    <Icon {...p}
      defs={(id) => <>
        {lg(id('h'), [['0', '#FF6F91'], ['1', '#D6336C']], 0, 0, 1, 1)}
      </>}>
      {(id) => <>
        <rect x="5" y="5" width="38" height="38" rx="6" fill="none" stroke="#7B8794" strokeWidth="2.2" strokeDasharray="5 3.4" />
        <path d="M17 8 30.5 31M31 8 17.5 31" stroke="#8A96A3" strokeWidth="3" strokeLinecap="round" />
        <circle cx="16" cy="35" r="5.5" fill="none" stroke={`url(#${id('h')})`} strokeWidth="3.4" />
        <circle cx="32" cy="35" r="5.5" fill="none" stroke={`url(#${id('h')})`} strokeWidth="3.4" />
      </>}
    </Icon>
  );
}

/* ───────────────────────── To Do ───────────────────────── */
function Todo(p: AppIconProps) {
  return (
    <Icon {...p}
      defs={(id) => <>
        {lg(id('a'), [['0', '#4F9DF7'], ['1', '#2357D6']], 0, 0, 1, 1)}
      </>}>
      {(id) => <>
        <circle cx="24" cy="24" r="19" fill={`url(#${id('a')})`} />
        <path d="m14.5 24.5 6.5 6.5 13-14" fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      </>}
    </Icon>
  );
}

/* ───────────────────────── Mail ───────────────────────── */
function Mail(p: AppIconProps) {
  return (
    <Icon {...p}
      defs={(id) => <>
        {lg(id('b'), [['0', '#3AA0F2'], ['1', '#1563C9']], 0, 0, 1, 1)}
        {lg(id('f'), [['0', '#7CC4FF'], ['1', '#3D8FF0']])}
      </>}>
      {(id) => <>
        <rect x="4" y="10" width="40" height="29" rx="4.5" fill={`url(#${id('b')})`} />
        <path d="m5.5 12.5 16.3 12.6a3.6 3.6 0 0 0 4.4 0l16.3-12.6" fill="none" stroke={`url(#${id('f')})`} strokeWidth="3" strokeLinejoin="round" />
        <path d="M5.3 37.5 18.5 25M42.7 37.5 29.5 25" stroke="#0F4FA8" strokeWidth="1.6" opacity=".6" />
      </>}
    </Icon>
  );
}

/* ───────────────────────── Calendar ───────────────────────── */
function Calendar(p: AppIconProps) {
  return (
    <Icon {...p}
      defs={(id) => <>
        {lg(id('h'), [['0', '#4B9CF5'], ['1', '#2563D2']])}
        {lg(id('pg'), [['0', '#FFFFFF'], ['1', '#E5EBF2']])}
      </>}>
      {(id) => <>
        <rect x="5" y="8" width="38" height="35" rx="5" fill={`url(#${id('pg')})`} stroke="#B3BECB" strokeWidth=".8" />
        <path d="M5 13a5 5 0 0 1 5-5h28a5 5 0 0 1 5 5v4H5z" fill={`url(#${id('h')})`} />
        {[15, 33].map((x) => <rect key={x} x={x - 1.5} y="4.5" width="3" height="7" rx="1.5" fill="#4A5563" />)}
        {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => (
          <rect key={`${r}${c}`} x={10 + c * 7.5} y={21.5 + r * 6.5} width="5" height="4" rx="1" fill={r === 1 && c === 2 ? '#2563D2' : '#A7B3C2'} />
        )))}
      </>}
    </Icon>
  );
}

/* ───────────────────────── About / info ───────────────────────── */
function Info(p: AppIconProps) {
  return (
    <Icon {...p} defs={(id) => lg(id('a'), [['0', '#4F9DF7'], ['1', '#2357D6']], 0, 0, 1, 1)}>
      {(id) => <>
        <circle cx="24" cy="24" r="19" fill={`url(#${id('a')})`} />
        <rect x="21.8" y="21" width="4.4" height="14" rx="2.2" fill="#fff" />
        <circle cx="24" cy="15" r="2.7" fill="#fff" />
      </>}
    </Icon>
  );
}

/* ───────────────────────── Generic app ───────────────────────── */
function Generic(p: AppIconProps) {
  return (
    <Icon {...p} defs={(id) => lg(id('a'), [['0', '#8C96A3'], ['1', '#5B6470']], 0, 0, 1, 1)}>
      {(id) => <>
        <rect x="5" y="8" width="38" height="32" rx="4.5" fill="#F4F6F9" stroke="#9AA5B1" strokeWidth=".8" />
        <path d="M5 12.5A4.5 4.5 0 0 1 9.5 8h29a4.5 4.5 0 0 1 4.5 4.5V16H5z" fill={`url(#${id('a')})`} />
      </>}
    </Icon>
  );
}

export const APP_ICONS: Record<string, ComponentType<AppIconProps>> = {
  explorer: Explorer,
  edge: Browser,
  store: Store,
  settings: Settings,
  notepad: Notepad,
  calculator: Calculator,
  paint: Paint,
  photos: Photos,
  mediaplayer: MediaPlayer,
  clock: Clock,
  terminal: Terminal,
  camera: Camera,
  weather: Weather,
  taskmgr: TaskManager,
  snippingtool: Snipping,
  todo: Todo,
  mail: Mail,
  calendar: Calendar,
  winver: Info,
  generic: Generic,
};

export function AppIcon({ appId, size = 24, className }: { appId: string; size?: number; className?: string }) {
  const C = APP_ICONS[appId] ?? Generic;
  return <C size={size} className={className} />;
}

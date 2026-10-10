/* Original shell / file-type icon artwork (48×48 grid). */
import { useId, type ReactNode } from 'react';
import { FolderIcon } from './AppIcons';
import type { FSNode } from '@/core/store/fs';
import { fileKind, extOf, FS } from '@/core/store/fs';
import { AppIcon } from './AppIcons';
import { customIcon } from '@/core/customAssets';

function Custom({ url, size = 24, className }: { url: string; size?: number; className?: string }) {
  return <img src={url} width={size} height={size} className={className} alt="" draggable={false} style={{ objectFit: 'contain' }} />;
}

interface P { size?: number; className?: string }

function Svg({ size = 24, className, children }: P & { children: (id: (n: string) => string) => ReactNode }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      {children((n) => `${uid}-${n}`)}
    </svg>
  );
}

/* Windows 11 Start: equal square panes, straight corners and a uniform blue. */
export function StartGlyph({ size = 24, className }: P) {
  const override = customIcon('start');
  if (override) return <Custom url={override} size={size} className={className} />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#0078d4" d="M0 0h11v11H0zM13 0h11v11H13zM0 13h11v11H0zM13 13h11v11H13z" />
    </svg>
  );
}

/* ── Recycle bin ── */
export function RecycleBinIcon({ size, className, full }: P & { full?: boolean }) {
  const __c = (full && customIcon('recycle-bin-full')) || customIcon('recycle-bin');
  if (__c) return <Custom url={__c} size={size} className={className} />;
  return (
    <Svg size={size} className={className}>
      {(id) => <>
        <defs>
          <linearGradient id={id('b')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#E8EEF5" stopOpacity=".95" />
            <stop offset=".5" stopColor="#FFFFFF" stopOpacity=".8" />
            <stop offset="1" stopColor="#CBD5E1" stopOpacity=".95" />
          </linearGradient>
          <linearGradient id={id('p')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF4C7" />
            <stop offset="1" stopColor="#E6C873" />
          </linearGradient>
        </defs>
        {full && <>
          <path d="M14 14l6-6 5 4 6-3 4 6z" fill={`url(#${id('p')})`} stroke="#C9A94F" strokeWidth=".6" />
          <path d="M18 15l9-8 6 6z" fill="#fff" stroke="#AAB6C3" strokeWidth=".6" />
        </>}
        <path d="M10 14h28l-3 28.2a2.6 2.6 0 0 1-2.6 2.3H15.6a2.6 2.6 0 0 1-2.6-2.3z" fill={`url(#${id('b')})`} stroke="#8F9DAD" strokeWidth="1" />
        <ellipse cx="24" cy="14" rx="14.5" ry="2.6" fill="#F7FAFD" stroke="#8F9DAD" strokeWidth="1" />
        <g fill="none" stroke="#3A8DDE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.5 26.5l2-3.4a1.7 1.7 0 0 1 3 0l1 1.7" />
          <path d="M28.5 28.5l1.6 2.8a1.7 1.7 0 0 1-1.5 2.6h-2.3" />
          <path d="M21.5 34h-2.1a1.7 1.7 0 0 1-1.5-2.6l1-1.6" />
        </g>
      </>}
    </Svg>
  );
}

/* ── This PC (monitor) ── */
export function ThisPCIcon({ size, className }: P) {
  const __c = customIcon('this-pc');
  if (__c) return <Custom url={__c} size={size} className={className} />;
  return (
    <Svg size={size} className={className}>
      {(id) => <>
        <defs>
          <linearGradient id={id('s')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5CC2FF" />
            <stop offset="1" stopColor="#1A6ED8" />
          </linearGradient>
        </defs>
        <rect x="3" y="7" width="42" height="28" rx="3" fill="#3B4350" />
        <rect x="5" y="9" width="38" height="24" rx="1.5" fill={`url(#${id('s')})`} />
        <path d="M5 26c8-6 16-9 38-6v11.5a1.5 1.5 0 0 1-1.5 1.5h-35A1.5 1.5 0 0 1 5 31.5z" fill="#fff" opacity=".15" />
        <path d="M19 35h10l1.5 6h-13z" fill="#7C8896" />
        <rect x="13" y="40.5" width="22" height="3" rx="1.5" fill="#5E6976" />
      </>}
    </Svg>
  );
}

/* ── Network ── */
export function NetworkIcon({ size, className }: P) {
  const __c = customIcon('network');
  if (__c) return <Custom url={__c} size={size} className={className} />;
  return (
    <Svg size={size} className={className}>
      {() => <>
        <rect x="16" y="5" width="16" height="12" rx="2" fill="#3B4350" />
        <rect x="18" y="7" width="12" height="8" rx="1" fill="#4CB0F7" />
        <path d="M24 17v7M10 30v-6h28v6" fill="none" stroke="#7C8896" strokeWidth="2" />
        {[4, 32].map((x) => <g key={x}><rect x={x} y="30" width="12" height="9" rx="1.6" fill="#3B4350" /><rect x={x + 1.5} y="31.5" width="9" height="6" rx=".8" fill="#4CB0F7" /></g>)}
      </>}
    </Svg>
  );
}

/* ── Control panel ── */
export function ControlPanelIcon({ size, className }: P) {
  return (
    <Svg size={size} className={className}>
      {() => <>
        <rect x="5" y="8" width="38" height="32" rx="4" fill="#F2F5F9" stroke="#8F9DAD" />
        <rect x="10" y="14" width="13" height="9" rx="1.5" fill="#3E97F0" />
        <rect x="25" y="14" width="13" height="9" rx="1.5" fill="#2EB872" />
        <rect x="10" y="25" width="13" height="9" rx="1.5" fill="#F5A524" />
        <rect x="25" y="25" width="13" height="9" rx="1.5" fill="#E2504C" />
      </>}
    </Svg>
  );
}

/* ── User avatar (default account picture) ── */
export function AvatarIcon({ size = 32, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="#D7DCE2" />
      <circle cx="24" cy="19" r="8.5" fill="#8B96A3" />
      <path d="M8.7 40.5C11.3 33.6 17.2 30 24 30s12.7 3.6 15.3 10.5A23.9 23.9 0 0 1 24 48a23.9 23.9 0 0 1-15.3-7.5z" fill="#8B96A3" />
    </svg>
  );
}

/* ── Drive ── */
export function DriveIcon({ size, className, system }: P & { system?: boolean }) {
  const __c = customIcon('drive');
  if (__c) return <Custom url={__c} size={size} className={className} />;
  return (
    <Svg size={size} className={className}>
      {(id) => <>
        <defs>
          <linearGradient id={id('d')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E9EEF3" />
            <stop offset="1" stopColor="#B7C2CE" />
          </linearGradient>
        </defs>
        <path d="M6 30l5-14a3 3 0 0 1 2.8-2h20.4a3 3 0 0 1 2.8 2l5 14z" fill="#CDD5DE" stroke="#8F9DAD" />
        <rect x="5" y="29" width="38" height="11" rx="2.5" fill={`url(#${id('d')})`} stroke="#8F9DAD" />
        <rect x="33" y="33.5" width="6" height="2" rx="1" fill="#2EB872" />
        {system && <g transform="translate(17 17.5) scale(.32)">
          <rect x="0" y="0" width="19" height="19" rx="1.5" fill="#1F8BEA" />
          <rect x="21" y="0" width="19" height="19" rx="1.5" fill="#1F8BEA" />
          <rect x="0" y="21" width="19" height="19" rx="1.5" fill="#1F8BEA" />
          <rect x="21" y="21" width="19" height="19" rx="1.5" fill="#1F8BEA" />
        </g>}
      </>}
    </Svg>
  );
}

/* ── Special folder badges ── */
const badgeBase = (children: ReactNode) => <g>{children}</g>;
const BADGES: Record<string, ReactNode> = {
  desktop: badgeBase(<><rect x="16" y="22" width="16" height="11" rx="1.5" fill="#2F7FE0" /><rect x="21" y="33" width="6" height="2" fill="#2F7FE0" /></>),
  documents: badgeBase(<><path d="M18 20h9l4 4v12a1 1 0 0 1-1 1H18a1 1 0 0 1-1-1V21a1 1 0 0 1 1-1z" fill="#fff" stroke="#6E7C8C" strokeWidth=".8" /><path d="M20 27h8M20 30h8M20 33h6" stroke="#4A90E2" strokeWidth="1.3" /></>),
  downloads: badgeBase(<><circle cx="24" cy="28.5" r="8" fill="#20A464" /><path d="M24 23.5v9m-3.5-3.5 3.5 3.5 3.5-3.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>),
  music: badgeBase(<><circle cx="24" cy="28.5" r="8" fill="#F07A2E" /><path d="M23 32.5v-8l5-1.5v6.5" fill="none" stroke="#fff" strokeWidth="1.6" /><circle cx="21.8" cy="32.6" r="1.8" fill="#fff" /><circle cx="26.8" cy="30" r="1.8" fill="#fff" /></>),
  pictures: badgeBase(<><rect x="15.5" y="21.5" width="17" height="13" rx="2" fill="#2F86E8" /><path d="M15.5 31.5 21 26l4 4 3-2.5 4.5 4v1a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" fill="#4CC38A" /><circle cx="28.5" cy="25" r="1.6" fill="#FFE27A" /></>),
  videos: badgeBase(<><rect x="15.5" y="22" width="17" height="13" rx="2" fill="#8B5CF6" /><path d="M22 25.5v6l5-3z" fill="#fff" /></>),
  user: badgeBase(<><circle cx="24" cy="25.5" r="3.6" fill="#2F7FE0" /><path d="M17.5 35a6.5 6.5 0 0 1 13 0z" fill="#2F7FE0" /></>),
  home: badgeBase(<path d="M24 20.5 15.5 27.5V36h6v-5h5v5h6v-8.5z" fill="#2F7FE0" />),
};

export function SpecialFolderIcon({ kind, size, className }: P & { kind: keyof typeof BADGES | string }) {
  return <FolderIcon size={size} className={className} badge={BADGES[kind]} />;
}

/* ── Home (Explorer) ── */
export function HomeIcon({ size, className }: P) {
  return (
    <Svg size={size} className={className}>
      {(id) => <>
        <defs>
          <linearGradient id={id('r')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F27A54" /><stop offset="1" stopColor="#D24E2B" /></linearGradient>
        </defs>
        <path d="M9 22 24 9.5 39 22v18a2.5 2.5 0 0 1-2.5 2.5h-25A2.5 2.5 0 0 1 9 40z" fill="#F2F5F9" stroke="#8F9DAD" />
        <path d="M5.5 23.5 24 8l18.5 15.5" fill="none" stroke={`url(#${id('r')})`} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="20" y="29" width="8" height="13.5" rx="1" fill="#2F7FE0" />
      </>}
    </Svg>
  );
}

/* ── Gallery ── */
export function GalleryIcon({ size, className }: P) {
  return (
    <Svg size={size} className={className}>
      {() => <>
        <rect x="10" y="6" width="32" height="26" rx="3" fill="#8DC3F7" transform="rotate(8 26 19)" />
        <rect x="6" y="14" width="34" height="27" rx="3.5" fill="#2F86E8" />
        <path d="M6 35 16 25l6 6 5-4 13 11v.5a3.5 3.5 0 0 1-3.5 3.5h-27A3.5 3.5 0 0 1 6 38.5z" fill="#4CC38A" />
        <circle cx="31" cy="22" r="3" fill="#FFE27A" />
      </>}
    </Svg>
  );
}

/* ── Generic file types ── */
function Page({ size, className, children, fold = '#D9E0E8' }: P & { children?: ReactNode; fold?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M11 4h18l11 11v27a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#FFFFFF" stroke="#9AA6B4" strokeWidth="1" />
      <path d="M29 4v9a2 2 0 0 0 2 2h9" fill={fold} stroke="#9AA6B4" strokeWidth="1" />
      {children}
    </svg>
  );
}

export function TextFileIcon(p: P) {
  return <Page {...p}>{[21, 25, 29, 33, 37].map((y, i) => <rect key={y} x="14" y={y} width={i === 4 ? 12 : 21} height="1.6" rx=".8" fill="#7D8896" />)}</Page>;
}
export function ImageFileIcon(p: P) {
  return <Page {...p}><rect x="13" y="20" width="23" height="18" rx="2" fill="#2F86E8" /><path d="M13 34l6-6 4 4 3-2.5 10 8.5v.1a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2z" fill="#4CC38A" /><circle cx="30" cy="25" r="2" fill="#FFE27A" /></Page>;
}
export function AudioFileIcon(p: P) {
  return <Page {...p}><path d="M22 36V24l9-2.5V33" fill="none" stroke="#F07A2E" strokeWidth="2.2" /><circle cx="19.6" cy="36" r="3" fill="#F07A2E" /><circle cx="28.6" cy="33.2" r="3" fill="#F07A2E" /></Page>;
}
export function VideoFileIcon(p: P) {
  return <Page {...p}><rect x="13" y="21" width="23" height="16" rx="2" fill="#8B5CF6" /><path d="M22 25.5v7.5l6.5-3.8z" fill="#fff" /></Page>;
}
export function ExeFileIcon(p: P) {
  return <Page {...p}><rect x="13" y="20" width="23" height="18" rx="2" fill="#E9EEF4" stroke="#7D8896" /><rect x="13" y="20" width="23" height="4" rx="1" fill="#2F7FE0" /></Page>;
}
export function ZipFileIcon(p: P) {
  return (
    <svg width={p.size} height={p.size} viewBox="0 0 48 48" className={p.className} aria-hidden="true">
      <FolderIconShape />
      {[14, 18, 22, 26].map((y, i) => <rect key={y} x={i % 2 ? 24 : 22} y={y} width="2" height="3" fill="#5A4A2A" />)}
      <rect x="21" y="29" width="6" height="7" rx="1.5" fill="#5A4A2A" />
    </svg>
  );
}
function FolderIconShape() {
  return <>
    <path d="M4 11.5A3.5 3.5 0 0 1 7.5 8h10.1c.9 0 1.8.4 2.5 1l2.4 2.3c.4.4 1 .7 1.6.7H40.5A3.5 3.5 0 0 1 44 15.5v20A3.5 3.5 0 0 1 40.5 39h-33A3.5 3.5 0 0 1 4 35.5z" fill="#D98B1F" />
    <path d="M4 18.5A3.5 3.5 0 0 1 7.5 15h33a3.5 3.5 0 0 1 3.5 3.5v18A3.5 3.5 0 0 1 40.5 40h-33A3.5 3.5 0 0 1 4 36.5z" fill="#F7C04A" />
  </>;
}
export function PdfFileIcon(p: P) {
  return <Page {...p}><rect x="12" y="25" width="25" height="11" rx="2" fill="#D93B30" /><text x="24.5" y="33.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">PDF</text></Page>;
}
export function GenericFileIcon(p: P) {
  return <Page {...p} />;
}

/* ── Shortcut overlay arrow ── */
export function ShortcutArrow({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <rect x=".5" y=".5" width="15" height="15" rx="2" fill="#fff" stroke="#7D8896" />
      <path d="M5 11.5c0-4 2-5.5 5.5-5.5M8.5 3.5 11 6l-2.5 2.5" fill="none" stroke="#1F6FD1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SPECIAL: Record<string, string> = {
  [FS.desktop]: 'desktop', [FS.documents]: 'documents', [FS.downloads]: 'downloads',
  [FS.music]: 'music', [FS.pictures]: 'pictures', [FS.videos]: 'videos', [FS.user]: 'user',
};

/** Icon for any file-system node. */
export function NodeIcon({ node, size = 16, className, showShortcut = true }: P & { node: FSNode; showShortcut?: boolean }) {
  if (node.id === FS.root) return <ThisPCIcon size={size} className={className} />;
  if (node.id === FS.recycle) return <RecycleBinIcon size={size} className={className} />;
  if (SPECIAL[node.id]) return <SpecialFolderIcon kind={SPECIAL[node.id]} size={size} className={className} />;
  const k = fileKind(node);
  switch (k) {
    case 'folder': return <FolderIcon size={size} className={className} />;
    case 'drive': return <DriveIcon size={size} className={className} system={node.target === 'C:'} />;
    case 'shortcut':
      return (
        <span style={{ position: 'relative', display: 'inline-block', width: size, height: size }} className={className}>
          <AppIcon appId={node.target ?? 'generic'} size={size} />
          {showShortcut && size >= 32 && <span style={{ position: 'absolute', left: 0, bottom: 0 }}><ShortcutArrow size={Math.round(size / 3)} /></span>}
        </span>
      );
    case 'image':
      if (size >= 64 && node.content) {
        return <img src={node.content} width={size} height={size} className={className} style={{ objectFit: 'contain' }} alt="" draggable={false} />;
      }
      return <ImageFileIcon size={size} className={className} />;
    case 'audio': return <AudioFileIcon size={size} className={className} />;
    case 'video': return <VideoFileIcon size={size} className={className} />;
    case 'text': return <TextFileIcon size={size} className={className} />;
    case 'exe': {
      const map: Record<string, string> = { 'notepad.exe': 'notepad', 'calc.exe': 'calculator', 'mspaint.exe': 'paint', 'cmd.exe': 'terminal', 'explorer.exe': 'explorer', 'taskmgr.exe': 'taskmgr' };
      const a = map[node.name.toLowerCase()];
      return a ? <AppIcon appId={a} size={size} className={className} /> : <ExeFileIcon size={size} className={className} />;
    }
    case 'zip': return <ZipFileIcon size={size} className={className} />;
    case 'pdf': return <PdfFileIcon size={size} className={className} />;
    default:
      return extOf(node.name) === 'txt' ? <TextFileIcon size={size} className={className} /> : <GenericFileIcon size={size} className={className} />;
  }
}

/** Windows reference images used by desktop and Explorer. */
import { FolderIcon, AppIcon } from './AppIcons';
import type { FSNode } from '@/core/store/fs';
import { fileKind, extOf, FS } from '@/core/store/fs';
import { customIcon } from '@/core/customAssets';
import { iconUrl } from './windowsAssets';
interface P { size?: number; className?: string }
function Custom({ url, size = 24, className }: P & { url: string }) {
  return <img src={url} width={size} height={size} className={className} alt="" aria-hidden="true" draggable={false} style={{ objectFit: 'contain' }} />;
}
function Reference({ name, ...props }: P & { name: string }) {
  const url = iconUrl(name);
  return url ? <Custom url={url} {...props} /> : null;
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

export function RecycleBinIcon({ full, ...props }: P & { full?: boolean }) {
  const override = (full && customIcon('recycle-bin-full')) || customIcon('recycle-bin');
  return override ? <Custom url={override} {...props} /> : <Reference name={full ? 'recycle-bin-full' : 'recycle-bin'} {...props} />;
}
export function ThisPCIcon(props: P) { return <Reference name="this-pc" {...props} />; }
export function NetworkIcon(props: P) { return <Reference name="network" {...props} />; }
export function ControlPanelIcon(props: P) { return <Reference name="control-panel" {...props} />; }
export function DriveIcon({ system, ...props }: P & { system?: boolean }) {
  const override = customIcon('drive');
  return override ? <Custom url={override} {...props} /> : <Reference name={system ? 'drive-system' : 'drive'} {...props} />;
}
export function SpecialFolderIcon({ kind, ...props }: P & { kind: string }) {
  const url = iconUrl(`folder-${kind}`);
  return url ? <Custom url={url} {...props} /> : <FolderIcon {...props} />;
}
export function HomeIcon(props: P) { return <Reference name="home" {...props} />; }
export function GalleryIcon(props: P) { return <Reference name="gallery" {...props} />; }
export function TextFileIcon(props: P) { return <Reference name="file-text" {...props} />; }
export function ImageFileIcon(props: P) { return <Reference name="file-image" {...props} />; }
export function AudioFileIcon(props: P) { return <Reference name="file-audio" {...props} />; }
export function VideoFileIcon(props: P) { return <Reference name="file-video" {...props} />; }
export function ExeFileIcon(props: P) { return <Reference name="file-exe" {...props} />; }
export function ZipFileIcon(props: P) { return <Reference name="file-zip" {...props} />; }
export function GenericFileIcon(props: P) { return <Reference name="file-generic" {...props} />; }
export function PdfFileIcon({ size = 24, className }: P) {
  return <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true"><image href={iconUrl('file-generic')} width="48" height="48" /><rect x="12" y="25" width="25" height="11" rx="2" fill="#d93b30" /><text x="24.5" y="33.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">PDF</text></svg>;
}
export function ShortcutArrow({ size = 12 }: P) { return <Reference name="shortcut" size={size} />; }

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

import { useNow } from '@/core/window-context';
import { useShell } from '@/core/store/shell';
import { useSettings } from '@/core/store/settings';
import { wallpaperById } from '@/core/wallpapers';
import '../flyouts/flyouts.css';
export function LockScreen() {
  const phase=useShell(s=>s.phase);const settings=useSettings();const now=useNow();
  if(!['lock','locking'].includes(phase))return null;
  const unlock=()=>useShell.getState().setPhase('login');
  return <div className="session-screen lock-screen" role="button" tabIndex={0} aria-label="Unlock desktop" onClick={unlock} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')unlock();}} style={{backgroundImage:`linear-gradient(#0001,#0003),url("${wallpaperById(settings.lockWallpaper)?.url??''}")`}}><h1 className="lock-time">{now.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',hour12:!settings.hour24})}</h1><p className="lock-date">{now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</p><p className="lock-hint">Click or press Enter to continue</p></div>;
}

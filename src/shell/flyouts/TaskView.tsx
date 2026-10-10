import { useShell } from '@/core/store/shell';
import { useWindows } from '@/core/store/windows';
import { AppIcon } from '@/icons/AppIcons';
import { Button } from '@/components/controls';
export function TaskView() {
  const open=useShell(s=>s.flyout==='taskview');const s=useWindows();if(!open)return null;
  return <section className="taskview-overlay" aria-label="Task view"><div className="shell-row"><h2>Open windows</h2><Button onClick={()=>useShell.getState().closeFlyouts()}>Back to desktop</Button></div><div className="taskview-grid">{s.windows.filter(w=>w.anim!=='closing').map(w=><button className="taskview-card" key={w.id} onClick={()=>{s.restore(w.id);useShell.getState().closeFlyouts();}}><AppIcon appId={w.appId} size={64}/><strong>{w.title}</strong><span className="shell-muted">{w.state==='minimized'?'Minimized':'Open'}</span></button>)}</div>{!s.windows.length&&<p>Your desktop has room for something new. Open an app from Start.</p>}</section>;
}

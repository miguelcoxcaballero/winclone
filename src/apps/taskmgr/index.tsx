import { useState } from 'react';
import type { AppProps } from '@/core/types';
import { useWindows } from '@/core/store/windows';
import { useFS,formatSize } from '@/core/store/fs';
import { useNow } from '@/core/window-context';
import { AppIcon } from '@/icons/AppIcons';
import { Button } from '@/components/controls';
import { AppFrame } from '../shared';
export default function TaskManager({windowId}:AppProps) {
  const s=useWindows();const nodes=useFS(state=>state.nodes);const now=useNow();const [selected,setSelected]=useState<string|null>(null);const [page,setPage]=useState('processes');const running=s.windows.filter(w=>w.anim!=='closing');
  let bytes=0;try{bytes=new Blob(Object.keys(localStorage).filter(k=>k.startsWith('wc.')).map(k=>localStorage.getItem(k)??'')).size;}catch{}
  return <AppFrame id="taskmgr" toolbar={<><span className="app-grow"/><Button disabled={!selected||selected===windowId} onClick={()=>{if(selected)s.close(selected);}}>End task</Button></>} footer="Shows WinClone windows and browser storage, rather than your operating system processes."><div className="app-split"><nav className="app-sidebar"><button className={page==='processes'?'selected':''} onClick={()=>setPage('processes')}>Processes</button><button className={page==='storage'?'selected':''} onClick={()=>setPage('storage')}>Storage</button></nav><main className="app-main"><h1>{page==='processes'?'Processes':'Storage'}</h1>{page==='processes'?<><p className="app-muted">{running.length} open windows</p><table className="task-table"><thead><tr><th>Name</th><th>Status</th><th>Open for</th></tr></thead><tbody>{running.map(w=><tr key={w.id} className={selected===w.id?'selected':''} tabIndex={0} onClick={()=>setSelected(w.id)} onDoubleClick={()=>s.restore(w.id)}><td><span className="ex-name"><AppIcon appId={w.appId} size={24}/>{w.title}</span></td><td>{w.state==='minimized'?'Minimized':s.activeId===w.id?'Active':'Running'}</td><td>{Math.floor((now.getTime()-w.openedAt)/1000)} seconds</td></tr>)}</tbody></table></>:<div className="app-grid"><div className="app-card"><h2>{Object.keys(nodes).length}</h2><p>Virtual files and folders</p></div><div className="app-card"><h2>{formatSize(bytes)}</h2><p>WinClone browser storage</p></div><div className="app-card"><h2>{running.length}</h2><p>Open application windows</p></div></div>}</main></div></AppFrame>;
}

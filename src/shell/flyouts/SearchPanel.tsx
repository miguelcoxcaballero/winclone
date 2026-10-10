import { useRef } from 'react';
import { useFlyoutDismiss } from '@/core/hooks';
import { useShell } from '@/core/store/shell';
import { useFS } from '@/core/store/fs';
import { listApps } from '@/apps/registry';
import { AppIcon } from '@/icons/AppIcons';
import { NodeIcon } from '@/icons/ShellIcons';
import { openApp } from '@/core/store/windows';
import { openNode } from '@/core/launch';
export function SearchPanel() {
  const ref=useRef<HTMLDivElement>(null);const open=useFlyoutDismiss(ref,'search','.tb-search,.tb-search-label,[aria-label="Search"]');const shell=useShell();const nodes=useFS(s=>s.nodes);
  if(!open)return null;
  const q=shell.searchQuery.toLowerCase().trim();const apps=listApps().filter(a=>`${a.name} ${a.keywords?.join(' ')}`.toLowerCase().includes(q));const files=q?Object.values(nodes).filter(n=>!n.hidden&&n.parent!=='recycle'&&n.name.toLowerCase().includes(q)).slice(0,8):[];
  return <section ref={ref} className="wc-flyout search-flyout" aria-label="Search"><input autoFocus aria-label="Search apps and files" placeholder="Search apps and files" value={shell.searchQuery} onChange={e=>shell.setSearchQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&apps[0]){openApp(apps[0].id);shell.closeFlyouts();}}}/><div className="search-results"><h3>{q?'Apps':'Explore your apps'}</h3>{apps.slice(0,q?12:8).map(a=><button key={a.id} className="shell-result" onClick={()=>{openApp(a.id);shell.closeFlyouts();}}><AppIcon appId={a.id} size={32}/><span>{a.name}<small>App</small></span></button>)}{files.length>0&&<h3>Files and folders</h3>}{files.map(n=><button key={n.id} className="shell-result" onClick={()=>{openNode(n);shell.closeFlyouts();}}><NodeIcon node={n} size={28}/><span>{n.name}<small>{useFS.getState().path(n.id)}</small></span></button>)}{!apps.length&&!files.length&&<p>No matching apps or files.</p>}</div></section>;
}

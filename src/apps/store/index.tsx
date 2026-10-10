import { useState } from 'react';
import { Button } from '@/components/controls';
import { AppFrame } from '../shared';
import { listApps } from '../registry';
import { AppIcon } from '@/icons/AppIcons';
import { openApp } from '@/core/store/windows';
import { useSettings } from '@/core/store/settings';
import { FS,useFS } from '@/core/store/fs';
const descriptions:Record<string,string>={notepad:'Write, save and export text files.',explorer:'Organize your files and folders.',calculator:'A little help with the numbers.',paint:'A blank canvas for your ideas.',photos:'Your pictures, all in one place.',todo:'Make a little space for your plans.',clock:'Timers, alarms and focus sessions.',calendar:'Keep track of what’s next.',mail:'Explore your local demo inbox.',edge:'Browse and save your favorites.',settings:'Make this desktop your own.',mediaplayer:'Enjoy your local music and videos.',camera:'Take a photo with your webcam.',snippingtool:'Capture a screen, window or tab.',taskmgr:'See and manage your open windows.',terminal:'Explore files with virtual commands.',weather:'Check a forecast or browse the offline sample.'};
export default function Store() {
  const [query,setQuery]=useState('');const [message,setMessage]=useState('All apps are included. No downloads or purchases required.');const settings=useSettings();
  return <AppFrame id="store" toolbar={<input className="app-grow" aria-label="Search apps" placeholder="Search apps" value={query} onChange={e=>setQuery(e.target.value)}/>} footer={message}><div className="app-pad"><div className="store-hero"><h1>Good things, built in.</h1><p>Everything you need for a little more creativity and a little less clutter.</p><Button onClick={()=>openApp('paint')}>Create something in Paint</Button></div><h2>Your app library</h2><div className="app-grid">{listApps().filter(a=>a.id!=='store'&&a.name.toLowerCase().includes(query.toLowerCase())).map(a=><div className="app-card store-card" key={a.id}><AppIcon appId={a.id} size={48}/><h3>{a.name}</h3><p className="app-muted">{descriptions[a.id]}</p><div className="app-row"><Button variant="accent" onClick={()=>openApp(a.id)}>Open</Button><Button aria-label={`Pin ${a.name}`} onClick={()=>{if(!settings.pinnedStart.includes(a.id))settings.set({pinnedStart:[...settings.pinnedStart,a.id]});setMessage(`${a.name} pinned to Start`);}}>Pin</Button></div><Button onClick={()=>{useFS.getState().createShortcut(FS.desktop,a.name,a.id);setMessage(`${a.name} shortcut added to Desktop`);}}>Desktop shortcut</Button></div>)}</div></div></AppFrame>;
}

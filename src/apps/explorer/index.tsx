import { useEffect, useRef, useState } from 'react';
import type { AppProps } from '@/core/types';
import { FS, fileKind, formatSize, useFS } from '@/core/store/fs';
import { openNode } from '@/core/launch';
import { NodeIcon } from '@/icons/ShellIcons';
import { Button } from '@/components/controls';
import { newFolder, newFile, renameItem, deleteItems, moveItems, useUndo } from './ops';
import { AppFrame, NameDialog, dataUrl, download, Empty } from '../shared';

export default function Explorer({ args }: AppProps) {
  const fs = useFS(); const undoCount=useUndo(s=>s.stack.length);
  const [folder, setFolder] = useState<string>(args?.folderId ?? FS.documents);
  const [history, setHistory] = useState<string[]>([]);
  const [selection, setSelection] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'details' | 'icons'>('details');
  const [dialog, setDialog] = useState<'folder' | 'file' | 'rename' | null>(null);
  const [status, setStatus] = useState(''); const upload = useRef<HTMLInputElement>(null);
  useEffect(() => { if (args?.folderId) { setFolder(args.folderId); setSelection([]); } }, [args?.folderId]);
  useEffect(() => { if (!fs.nodes[folder]) { setFolder(FS.documents); setSelection([]); } }, [fs.nodes, folder]);
  const navigate = (id: string) => { setHistory(h => [...h, folder]); setFolder(id); setSelection([]); setSearch(''); };
  const items = fs.children(folder).filter(n => n.name.toLowerCase().includes(search.toLowerCase()));
  const chosen = selection.length === 1 ? fs.nodes[selection[0]] : undefined; const recycle = folder === FS.recycle;
  const select = (id: string, additive: boolean) => setSelection(old => additive ? old.includes(id) ? old.filter(x => x !== id) : [...old, id] : [id]);
  const open = (id: string) => { const n = fs.nodes[id]; if (!n) return; if (n.type === 'folder' || n.type === 'drive') navigate(id); else openNode(n); };
  const remove = () => { if (recycle && !window.confirm('Permanently delete the selected items?')) return; deleteItems(selection); setSelection([]); };
  const canCreate = !recycle && folder !== FS.root;
  return <AppFrame id="explorer" title={fs.nodes[folder]?.name ?? 'File Explorer'} toolbar={<>
    <Button aria-label="Back" disabled={!history.length} onClick={() => { setFolder(history.at(-1)!); setHistory(h => h.slice(0,-1)); setSelection([]); }}>←</Button>
    <Button aria-label="Up" disabled={!fs.nodes[folder]?.parent} onClick={() => navigate(fs.nodes[folder].parent!)}>↑</Button>
    <input key={folder} aria-label="Folder path" className="ex-path" defaultValue={fs.path(folder)} onKeyDown={e => { if(e.key==='Enter') { const n=fs.resolve(e.currentTarget.value); if(n && (n.type==='folder'||n.type==='drive')) navigate(n.id); else setStatus('Folder not found'); } }} />
    <input aria-label="Search files" placeholder="Search this folder" value={search} onChange={e=>setSearch(e.target.value)} />
  </>} footer={<><span>{items.length} items</span><span>{selection.length} selected</span><span>{status}</span></>}>
    <div className="app-split"><nav className="app-sidebar" aria-label="Folders">{[FS.root,FS.desktop,FS.documents,FS.downloads,FS.pictures,FS.music,FS.videos,FS.recycle].map(id=><button key={id} className={folder===id?'selected':''} onClick={()=>navigate(id)}><NodeIcon node={fs.nodes[id]} size={20}/>{fs.nodes[id]?.name}</button>)}</nav>
    <div className="app-grow app-stack" style={{gap:0,minHeight:0}}><div className="app-toolbar">
      <Button disabled={!canCreate} onClick={()=>setDialog('folder')}>New folder</Button><Button disabled={!canCreate} onClick={()=>setDialog('file')}>New text file</Button>
      <Button disabled={!chosen || !!chosen.system || chosen.type==='drive'} onClick={()=>setDialog('rename')}>Rename</Button>
      <Button disabled={!selection.length} onClick={()=>fs.setClipboard({ids:selection,mode:'copy'})}>Copy</Button><Button disabled={!selection.length||recycle} onClick={()=>fs.setClipboard({ids:selection,mode:'cut'})}>Cut</Button>
      <Button disabled={!canCreate||!fs.clipboard} onClick={()=>fs.paste(folder)}>Paste</Button><Button disabled={!selection.length} onClick={remove}>Delete</Button>
      {recycle&&<><Button disabled={!selection.length} onClick={()=>{selection.forEach(fs.restore);setSelection([]);}}>Restore</Button><Button onClick={()=>{if(window.confirm('Empty the Recycle Bin permanently?'))fs.emptyRecycle();}}>Empty bin</Button></>}
      <Button disabled={!undoCount} onClick={()=>useUndo.getState().undo()}>Undo</Button><Button disabled={!canCreate} onClick={()=>upload.current?.click()}>Import</Button>
      <Button disabled={!chosen||chosen.type!=='file'} onClick={async()=>{if(!chosen)return;try{if(chosen.content?.startsWith('data:')||fileKind(chosen)==='image')download(chosen.name,await(await fetch(chosen.content!)).blob());else download(chosen.name,chosen.content??'');}catch{setStatus('Unable to export this file');}}}>Export</Button>
      <Button onClick={()=>setView(v=>v==='details'?'icons':'details')}>{view==='details'?'Icon view':'Details'}</Button>
      <input ref={upload} type="file" multiple hidden onChange={async e=>{for(const file of Array.from(e.target.files??[])){try{const content=/^(image|audio|video)\//.test(file.type)?await dataUrl(file):await file.text();newFile(folder,file.name,content);}catch{setStatus(`Could not import ${file.name}`);}}e.target.value='';}}/>
    </div><div className="app-main" tabIndex={0} onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='Delete'){e.preventDefault();remove();}if(e.key==='F2'&&chosen){e.preventDefault();setDialog('rename');}}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();try{const ids=JSON.parse(e.dataTransfer.getData('application/winclone-files'));if(canCreate&&Array.isArray(ids))moveItems(ids,folder);}catch{}}}>
    {items.length===0?<Empty title={search?'No matching files':'This folder is empty'}>Create a file or import one from your computer.</Empty>:view==='details'?<table className="ex-list"><thead><tr><th>Name</th><th>Date modified</th><th>Type</th><th>Size</th></tr></thead><tbody>{items.map(n=><tr key={n.id} className={selection.includes(n.id)?'selected':''} tabIndex={0} draggable={!n.system} onDragStart={e=>e.dataTransfer.setData('application/winclone-files',JSON.stringify(selection.includes(n.id)?selection:[n.id]))} onClick={e=>select(n.id,e.ctrlKey||e.metaKey)} onDoubleClick={()=>open(n.id)} onKeyDown={e=>{if(e.key==='Enter')open(n.id);}}><td><span className="ex-name"><NodeIcon node={n} size={24}/>{n.name}</span></td><td>{new Date(n.modified).toLocaleDateString()}</td><td>{fileKind(n)}</td><td>{n.type==='file'?formatSize(n.size??0):''}</td></tr>)}</tbody></table>:<div className="ex-grid">{items.map(n=><button key={n.id} className={`ex-tile ${selection.includes(n.id)?'selected':''}`} onClick={e=>select(n.id,e.ctrlKey||e.metaKey)} onDoubleClick={()=>open(n.id)}><NodeIcon node={n} size={48}/>{n.name}</button>)}</div>}
    </div></div></div>
    {dialog&&<NameDialog title={dialog==='folder'?'New folder':dialog==='file'?'New text file':'Rename'} initial={dialog==='rename'?chosen?.name:dialog==='file'?'Untitled.txt':'New folder'} onClose={()=>setDialog(null)} onSubmit={name=>{if(dialog==='folder')newFolder(folder,name);else if(dialog==='file')newFile(folder,name);else if(chosen)renameItem(chosen.id,name);setDialog(null);}}/>}
  </AppFrame>;
}

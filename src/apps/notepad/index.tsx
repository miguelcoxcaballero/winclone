import { useEffect, useRef, useState } from 'react';
import type { AppProps } from '@/core/types';
import { useWindow } from '@/core/window-context';
import { FS, useFS } from '@/core/store/fs';
import { Button } from '@/components/controls';
import { AppFrame, NameDialog, Modal, download } from '../shared';

export default function Notepad({ args }: AppProps) {
  const win = useWindow();
  const [fileId, setFileId] = useState<string | undefined>(args?.fileId);
  const node = useFS(s => fileId ? s.nodes[fileId] : undefined);
  const [text, setText] = useState(() => node?.content ?? '');
  const [saved, setSaved] = useState(() => node?.content ?? '');
  const [name, setName] = useState(node?.name ?? 'Untitled.txt');
  const [savingAs, setSavingAs] = useState(false);
  const [closing, setClosing] = useState(false);
  const [status, setStatus] = useState('UTF-8');
  const pending = useRef<((answer: boolean) => void) | null>(null);
  const dirty = text !== saved;
  useEffect(() => { win.setTitle(`${dirty ? '• ' : ''}${name} — Notepad`); }, [win.id, dirty, name]);
  useEffect(() => {
    win.setCloseGuard(dirty ? () => new Promise<boolean>(resolve => { pending.current = resolve; setClosing(true); }) : null);
    return () => { win.setCloseGuard(null); pending.current?.(false); pending.current = null; };
  }, [win.id, dirty]);
  const save = () => {
    if (!fileId || !useFS.getState().get(fileId)) { setSavingAs(true); return; }
    useFS.getState().writeFile(fileId, text); setSaved(text); setStatus('Saved');
  };
  const saveAs = (filename: string) => {
    const id = useFS.getState().createFile(FS.documents, filename, text);
    setFileId(id); setName(useFS.getState().get(id)!.name); setSaved(text); setSavingAs(false); setStatus('Saved to Documents');
  };
  const finishClose = (answer: boolean) => { const resolve = pending.current; pending.current = null; setClosing(false); resolve?.(answer); };
  return <AppFrame id="notepad" title={`${dirty ? '• ' : ''}${name}`} toolbar={<>
    <Button onClick={() => { if(dirty){setStatus('Save your changes before starting a new document.');return;} setFileId(undefined);setText('');setSaved('');setName('Untitled.txt'); }}>New</Button>
    <Button variant="accent" onClick={save}>Save</Button><Button onClick={() => setSavingAs(true)}>Save as</Button><Button onClick={() => download(name, text)}>Export .txt</Button><span className="app-grow" /><span className="app-muted">Ctrl+S to save</span>
  </>} footer={<><span>{text.length} characters</span><span>{text.split('\n').length} lines</span><span>{status}</span></>}>
    <textarea className="np-editor" aria-label="Document text" value={text} spellCheck={false} onChange={e => setText(e.target.value)} onKeyDown={e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); e.stopPropagation(); e.shiftKey ? setSavingAs(true) : save(); }
    }} />
    {savingAs && <NameDialog title="Save to Documents" initial={name} onSubmit={saveAs} onClose={() => setSavingAs(false)} />}
    {closing && <Modal title="Unsaved changes" onClose={() => finishClose(false)}><p>Save this document before closing, or discard the changes.</p><div className="app-actions"><Button onClick={() => finishClose(false)}>Cancel</Button><Button onClick={() => finishClose(true)}>Discard</Button><Button variant="accent" onClick={() => { finishClose(false); save(); }}>Save</Button></div></Modal>}
  </AppFrame>;
}

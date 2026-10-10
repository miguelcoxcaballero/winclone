import { useEffect, useState, type ReactNode } from 'react';
import { TitleBar } from '@/shell/window/TitleBar';
import { getApp } from './registry';
import { Button } from '@/components/controls';
import { useFS, FS } from '@/core/store/fs';
import './apps.css';

export function AppFrame({ id, title, children, toolbar, footer }: { id: string; title?: string; children: ReactNode; toolbar?: ReactNode; footer?: ReactNode }) {
  const meta = getApp(id)!;
  return <div className={`wc-app ${id}-app`} data-app={id}>
    <TitleBar appId={id} title={title ?? meta.name} height={meta.captionHeight} variant="winui" />
    {toolbar && <div className="app-toolbar">{toolbar}</div>}
    <div className="app-content">{children}</div>
    {footer && <div className="app-status" role="status">{footer}</div>}
  </div>;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="app-empty"><h2>{title}</h2><p>{children}</p></div>;
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="app-modal-shade" onPointerDown={e => e.stopPropagation()}>
    <section className="app-modal" role="dialog" aria-modal="true" aria-label={title} onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } }}>
      <div className="app-row"><h2>{title}</h2><Button aria-label="Close dialog" onClick={onClose}>×</Button></div>
      {children}
    </section>
  </div>;
}

export function NameDialog({ title, initial = '', onSubmit, onClose }: { title: string; initial?: string; onSubmit: (name: string) => void; onClose: () => void }) {
  const [name, setName] = useState(initial);
  return <Modal title={title} onClose={onClose}><form onSubmit={e => { e.preventDefault(); if (name.trim()) onSubmit(name.trim()); }}>
    <label className="app-field">Name<input autoFocus required value={name} onChange={e => setName(e.target.value)} /></label>
    <div className="app-actions"><Button onClick={onClose} type="button">Cancel</Button><Button variant="accent" type="submit">Save</Button></div>
  </form></Modal>;
}

export function useLocal<T>(key: string, initial: T): [T, (value: T | ((previous: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : initial; } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* Current state stays usable when storage is full. */ }
  }, [key, state]);
  return [state, setState];
}

export function download(name: string, content: string | Blob, mime = 'text/plain') {
  const url = URL.createObjectURL(content instanceof Blob ? content : new Blob([content], { type: mime }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function dataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file);
  });
}

export function savePicture(name: string, url: string, folder: string = FS.pictures) {
  return useFS.getState().createFile(folder, name, url);
}

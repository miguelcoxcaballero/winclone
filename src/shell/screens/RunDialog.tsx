import { useState } from 'react';
import { useShell } from '@/core/store/shell';
import { useFS } from '@/core/store/fs';
import { COMMANDS,openNode } from '@/core/launch';
import { openApp } from '@/core/store/windows';
import { Button } from '@/components/controls';
import { useEscape } from '../flyouts/shared';
export function RunDialog() {
  const open=useShell(s=>s.runOpen);const [command,setCommand]=useState('');const [error,setError]=useState('');const close=()=>useShell.getState().setRunOpen(false);useEscape(open,close);
  if(!open)return null;
  return <section className="run-dialog" role="dialog" aria-label="Run"><h2>Run</h2><p>Type the name of an app or virtual file, and WinClone will open it for you.</p><form onSubmit={e=>{e.preventDefault();const value=command.trim();const app=COMMANDS[value.toLowerCase()];const node=useFS.getState().resolve(value);if(app)openApp(app);else if(node)openNode(node);else{setError('App or file not found. Try notepad, calc, explorer or winver.');return;}setError('');close();}}><label>Open:<input autoFocus aria-label="Run command" value={command} onChange={e=>setCommand(e.target.value)}/></label>{error&&<p role="alert">{error}</p>}<div className="shell-row" style={{justifyContent:'flex-end'}}><Button type="button" onClick={close}>Cancel</Button><Button variant="accent" type="submit">OK</Button></div></form></section>;
}

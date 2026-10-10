import { useEffect } from 'react';
import { useShell } from '@/core/store/shell';
import { useWindows } from '@/core/store/windows';
import { StartGlyph } from '@/icons/ShellIcons';
import { Button } from '@/components/controls';
export function PowerScreens() {
  const phase=useShell(s=>s.phase);
  useEffect(()=>{
    const next:Record<string,string>={boot:'lock','signing-in':'desktop','signing-out':'lock','shutting-down':'off',restarting:'boot'};
    if(!next[phase])return;
    const timer=setTimeout(()=>{if(['signing-out','shutting-down','restarting'].includes(phase))useWindows.getState().closeAll();useShell.getState().setPhase(next[phase] as typeof phase);},phase==='boot'?650:500);
    return()=>clearTimeout(timer);
  },[phase]);
  if(!['boot','signing-in','signing-out','shutting-down','restarting','off','sleep'].includes(phase))return null;
  const labels:Record<string,string>={boot:'WinClone','signing-in':'Welcome','signing-out':'Signing out…','shutting-down':'Shutting down…',restarting:'Restarting…',off:'Your desktop is off',sleep:'Your desktop is sleeping'};
  return <div className="session-screen power-screen"><StartGlyph size={70}/><h2>{labels[phase]}</h2>{phase==='off'||phase==='sleep'?<Button variant="accent" onClick={()=>useShell.getState().setPhase(phase==='off'?'boot':'lock')}>{phase==='off'?'Start desktop':'Wake up'}</Button>:<div className="power-spinner"/>}</div>;
}

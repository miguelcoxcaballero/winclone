import { useRef } from 'react';
import { useFlyoutDismiss } from '@/core/hooks';
import { useSettings } from '@/core/store/settings';
import { Button } from '@/components/controls';
import { openApp } from '@/core/store/windows';
import { useShell } from '@/core/store/shell';
import './flyouts.css';
export function QuickSettings() {
  const ref=useRef<HTMLDivElement>(null);const open=useFlyoutDismiss(ref,'quick','.tb-status');const s=useSettings();
  if(!open)return null;
  const toggles:[string,string,'wifi'|'bluetooth'|'airplane'|'nightLight'|'batterySaver'|'doNotDisturb'][]=[['Wi-Fi','◉','wifi'],['Bluetooth','ᛒ','bluetooth'],['Airplane mode','✈','airplane'],['Night light','☾','nightLight'],['Energy saver','▱','batterySaver'],['Do not disturb','◌','doNotDisturb']];
  return <section ref={ref} className="wc-flyout quick-flyout" aria-label="Quick settings"><h2>Quick settings</h2><div className="qs-grid">{toggles.map(([label,icon,key])=><div className="qs-item" key={key}><button aria-label={label} aria-pressed={s[key]} className={s[key]?'on':''} onClick={()=>s.toggle(key)}>{icon}</button><span>{label}</span></div>)}</div><label className="qs-slider">☀<input aria-label="Brightness" type="range" min="20" max="100" value={s.brightness} onChange={e=>s.set({brightness:+e.target.value})}/>{s.brightness}%</label><label className="qs-slider"><Button aria-label="Mute sound" onClick={()=>s.toggle('muted')}>{s.muted?'🔇':'♪'}</Button><input aria-label="Volume" type="range" min="0" max="100" value={s.volume} onChange={e=>s.set({volume:+e.target.value})}/>{s.volume}%</label><div className="shell-row"><span className="shell-muted shell-grow">Controls apply within WinClone</span><Button onClick={()=>{useShell.getState().closeFlyouts();openApp('settings');}}>Settings</Button></div></section>;
}

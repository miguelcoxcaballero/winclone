import { useRef } from 'react';
import { useFlyoutDismiss } from '@/core/hooks';
import { useNow } from '@/core/window-context';
import { useSettings } from '@/core/store/settings';
import { useShell } from '@/core/store/shell';
import { openApp } from '@/core/store/windows';
import { Button } from '@/components/controls';
export function Widgets() {
  const ref=useRef<HTMLDivElement>(null);const open=useFlyoutDismiss(ref,'widgets','.tb-widgets');const now=useNow();const name=useSettings(s=>s.userName);if(!open)return null;
  const launch=(id:string)=>{openApp(id);useShell.getState().closeFlyouts();};
  return <section ref={ref} className="wc-flyout widgets-flyout" aria-label="Widgets"><h2>Hello, {name}</h2><p>{now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</p><div className="widget-card"><h3>Your day, at a glance</h3><p>Keep your plans and tasks close at hand.</p><div className="shell-row"><Button onClick={()=>launch('calendar')}>Calendar</Button><Button onClick={()=>launch('todo')}>My tasks</Button></div></div><div className="widget-card"><h3>A moment of focus</h3><p>Find a little room to do one thing well.</p><Button onClick={()=>launch('clock')}>Start a focus session</Button></div><div className="widget-card"><h3>Before you head out</h3><p>Open Weather to check a live forecast, or explore the offline sample.</p><Button onClick={()=>launch('weather')}>Weather</Button></div></section>;
}

import { useRef } from 'react';
import { useFlyoutDismiss } from '@/core/hooks';
import { useNotifications } from '@/core/store/notifications';
import { useSettings } from '@/core/store/settings';
import { useNow } from '@/core/window-context';
import { Button } from '@/components/controls';
import { relTime } from './shared';
export function NotificationCenter() {
  const ref=useRef<HTMLDivElement>(null);const open=useFlyoutDismiss(ref,'notifications','.tb-clock');const s=useNotifications();const settings=useSettings();const now=useNow();if(!open)return null;
  const first=new Date(now.getFullYear(),now.getMonth(),1);const start=(first.getDay()+6)%7;const count=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
  return <section ref={ref} className="wc-flyout" aria-label="Notification center"><div className="shell-row"><h2>Notifications</h2><Button disabled={!s.items.length} onClick={()=>s.clear()}>Clear all</Button></div>{s.items.length?s.items.map(n=><div key={n.id} className="notification-card"><div className="shell-row"><strong className="shell-grow">{n.title}</strong><Button aria-label={`Dismiss ${n.title}`} onClick={()=>s.dismiss(n.id)}>×</Button></div><p>{n.body}</p><span className="shell-muted">{relTime(n.time)}</span>{n.onClick&&<Button onClick={n.onClick}>Open</Button>}</div>):<p className="shell-muted">You’re all caught up.</p>}<label className="shell-row"><input type="checkbox" checked={settings.doNotDisturb} onChange={e=>settings.set({doNotDisturb:e.target.checked})}/>Do not disturb</label><div className="notification-calendar"><strong>{now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</strong><div className="nc-dates">{['M','T','W','T','F','S','S'].map((d,i)=><span key={`weekday-${i}`}>{d}</span>)}{Array.from({length:start},(_,i)=><span key={`empty-${i}`}/>)}{Array.from({length:count},(_,i)=><span key={i} className={i+1===now.getDate()?'today':''}>{i+1}</span>)}</div></div></section>;
}

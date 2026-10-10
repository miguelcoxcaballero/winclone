import { useEffect } from 'react';
import { useNotifications, type Notification } from '@/core/store/notifications';
import { useSettings } from '@/core/store/settings';
import { Button } from '@/components/controls';
function Toast({notification:n}:{notification:Notification}) {
  useEffect(()=>{const t=setTimeout(()=>useNotifications.getState().dismissToast(n.id),6000);return()=>clearTimeout(t);},[n.id]);
  return <div className="notification-card" role="status"><div className="shell-row"><strong className="shell-grow">{n.title}</strong><Button aria-label="Dismiss notification" onClick={()=>useNotifications.getState().dismissToast(n.id)}>×</Button></div><p>{n.body}</p>{n.onClick&&<Button onClick={()=>{n.onClick?.();useNotifications.getState().dismissToast(n.id);}}>Open</Button>}</div>;
}
export function Toasts() {
  const s=useNotifications();const muted=useSettings(state=>state.doNotDisturb||!state.notificationsEnabled);if(muted)return null;
  return <div className="toast-stack">{s.toasts.slice(-3).map(id=>s.items.find(n=>n.id===id)).filter(n=>!!n).map(n=><Toast key={n!.id} notification={n!}/>)}</div>;
}

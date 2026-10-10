import { useState } from 'react';
import { useShell } from '@/core/store/shell';
import { useSettings } from '@/core/store/settings';
import { wallpaperById } from '@/core/wallpapers';
import { Button } from '@/components/controls';
export function LoginScreen() {
  const phase=useShell(s=>s.phase);const s=useSettings();const [password,setPassword]=useState('');const [error,setError]=useState('');
  if(phase!=='login')return null;
  return <div className="session-screen login-screen" style={{backgroundImage:`linear-gradient(#0007,#0007),url("${wallpaperById(s.lockWallpaper)?.url??''}")`}}><div className="login-avatar">{s.userAvatar?<img src={s.userAvatar} alt="" style={{width:'100%',height:'100%',borderRadius:'50%'}}/>:(s.userName[0]??'U').toUpperCase()}</div><div className="login-name">{s.userName||'User'}</div><form onSubmit={e=>{e.preventDefault();if(s.password&&password!==s.password){setError('The local demo password does not match.');return;}setPassword('');setError('');useShell.getState().setPhase('signing-in');}}>{s.password&&<input type="password" aria-label="Local password" value={password} onChange={e=>setPassword(e.target.value)}/>}<Button variant="accent" type="submit">Sign in</Button><span>Local browser account</span>{error&&<p role="alert">{error}</p>}</form><Button onClick={()=>useShell.getState().setPhase('lock')}>Back</Button></div>;
}

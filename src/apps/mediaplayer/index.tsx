import { useEffect, useRef, useState } from 'react';
import type { AppProps } from '@/core/types';
import { fileKind, useFS } from '@/core/store/fs';
import { useSettings } from '@/core/store/settings';
import { AppFrame, Empty } from '../shared';
export default function MediaPlayer({args}:AppProps) {
  const nodes=useFS(s=>s.nodes);const files=Object.values(nodes).filter(n=>['audio','video'].includes(fileKind(n))&&n.parent!=='recycle');
  const initial=nodes[args?.fileId];const [source,setSource]=useState(initial?.content??'');const [name,setName]=useState(initial?.name??'');const [video,setVideo]=useState(initial?fileKind(initial)==='video':false);const [error,setError]=useState('');
  const objectUrl=useRef<string|null>(null);const media=useRef<HTMLMediaElement|null>(null);const volume=useSettings(s=>s.volume);const muted=useSettings(s=>s.muted);
  useEffect(()=>()=>{if(objectUrl.current)URL.revokeObjectURL(objectUrl.current);},[]);
  useEffect(()=>{if(media.current){media.current.volume=volume/100;media.current.muted=muted;}},[volume,muted,source]);
  return <AppFrame id="mediaplayer" toolbar={<label className="app-row">Open audio or video<input aria-label="Open media file" type="file" accept="audio/*,video/*" onChange={e=>{const f=e.target.files?.[0];if(!f)return;if(objectUrl.current)URL.revokeObjectURL(objectUrl.current);objectUrl.current=URL.createObjectURL(f);setSource(objectUrl.current);setName(f.name);setVideo(f.type.startsWith('video/'));setError('');}}/></label>} footer={error||name||'Play files from your computer'}>
    <div className="app-split"><nav className="app-sidebar">{files.map(f=><button key={f.id} onClick={()=>{setSource(f.content??'');setName(f.name);setVideo(fileKind(f)==='video');setError('');}}>{f.name}</button>)}</nav><div className="app-grow media-stage">{source?<><h2>{name}</h2>{video?<video key={source} ref={e=>{media.current=e;}} controls src={source} onError={()=>setError('This video format could not be played in your browser.')}/>:<audio key={source} ref={e=>{media.current=e;}} controls src={source} onError={()=>setError('This audio format could not be played in your browser.')}/>}</>:<Empty title="Press play on your day">Open a local audio or video file. Playback stays on your device.</Empty>}</div></div>
  </AppFrame>;
}

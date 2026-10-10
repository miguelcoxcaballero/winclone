import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/controls';
import { AppFrame, savePicture } from '../shared';
import { openApp } from '@/core/store/windows';
export default function Camera() {
  const video=useRef<HTMLVideoElement>(null);const stream=useRef<MediaStream|null>(null);const mounted=useRef(true);const [active,setActive]=useState(false);const [message,setMessage]=useState('Enable your camera to take a photo.');
  const stop=()=>{stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;setActive(false);};
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;stream.current?.getTracks().forEach(t=>t.stop());};},[]);
  const start=async()=>{try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera access needs a supported browser and a secure page.');const s=await navigator.mediaDevices.getUserMedia({video:true,audio:false});if(!mounted.current){s.getTracks().forEach(t=>t.stop());return;}stream.current=s;video.current!.srcObject=s;await video.current!.play();setActive(true);setMessage('Camera is on. Photos are saved locally.');}catch(e){if(mounted.current){stop();setMessage(`Could not open camera: ${e instanceof Error?e.message:'permission denied'}`);}}};
  const capture=()=>{const v=video.current!;if(!v.videoWidth)return;const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d')!.drawImage(v,0,0);const id=savePicture(`Photo-${Date.now()}.png`,c.toDataURL());setMessage('Photo saved to Pictures');openApp('photos',{fileId:id});};
  return <AppFrame id="camera"><div className="camera-stage"><video ref={video} muted playsInline style={{display:active?'block':'none'}}/><h2>{active?'Ready for your close-up':'Camera'}</h2><p role="status">{message}</p><div className="app-row">{active?<><Button variant="accent" onClick={capture}>Take photo</Button><Button onClick={stop}>Turn camera off</Button></>:<Button variant="accent" onClick={start}>Enable camera</Button>}</div></div></AppFrame>;
}

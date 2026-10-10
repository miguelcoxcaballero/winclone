import { useState } from 'react';
import type { AppProps } from '@/core/types';
import { fileKind, useFS } from '@/core/store/fs';
import { useSettings } from '@/core/store/settings';
import { Button } from '@/components/controls';
import { AppFrame, Empty, dataUrl, savePicture } from '../shared';
import { assetUrl } from '@/core/assets';
export default function Photos({args}:AppProps) {
  const nodes=useFS(s=>s.nodes);const photos=Object.values(nodes).filter(n=>fileKind(n)==='image'&&n.parent!=='recycle');
  const [selected,setSelected]=useState<string|null>(args?.fileId??null);const [zoom,setZoom]=useState(1);const [rotation,setRotation]=useState(0);const [message,setMessage]=useState('');
  const photo=selected?nodes[selected]:undefined;const index=photos.findIndex(n=>n.id===selected);
  return <AppFrame id="photos" title={photo?.name??'Photos'} toolbar={<>
    {photo?<><Button onClick={()=>{setSelected(null);setZoom(1);setRotation(0);}}>Gallery</Button><Button disabled={index<=0} onClick={()=>setSelected(photos[index-1].id)}>Previous</Button><Button disabled={index<0||index>=photos.length-1} onClick={()=>setSelected(photos[index+1].id)}>Next</Button><Button onClick={()=>setZoom(z=>Math.max(.5,z-.25))}>−</Button><Button onClick={()=>setZoom(z=>Math.min(3,z+.25))}>+</Button><Button onClick={()=>setRotation(r=>(r+90)%360)}>Rotate</Button><Button onClick={()=>{useSettings.getState().set({wallpaper:{type:'custom',url:assetUrl(photo.content??''),name:photo.name}});setMessage('Set as desktop background');}}>Set as background</Button></>:<label className="app-row">Import picture<input aria-label="Import picture" type="file" accept="image/*" onChange={async e=>{const file=e.target.files?.[0];if(file)try{setSelected(savePicture(file.name,await dataUrl(file)));}catch{setMessage('Unable to load image');}}}/></label>}
  </>} footer={message||`${photos.length} pictures`}>
    {photo?<div className="photos-view"><img alt={photo.name} src={assetUrl(photo.content??'')} style={{transform:`scale(${zoom}) rotate(${rotation}deg)`}}/></div>:photos.length?<div className="app-pad app-grid photos-grid">{photos.map(p=><button key={p.id} className="app-card app-button-card" onClick={()=>setSelected(p.id)}><img src={assetUrl(p.content??'')} alt={p.name}/><p>{p.name}</p></button>)}</div>:<Empty title="Your pictures live here">Import a picture or save a drawing in Paint.</Empty>}
  </AppFrame>;
}

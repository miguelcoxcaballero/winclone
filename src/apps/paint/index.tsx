import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/controls';
import { AppFrame, NameDialog, savePicture, download } from '../shared';
export default function Paint() {
  const canvas=useRef<HTMLCanvasElement>(null); const drawing=useRef(false); const previous=useRef({x:0,y:0});
  const [color,setColor]=useState('#0078d4'); const [width,setWidth]=useState(5); const [tool,setTool]=useState<'pen'|'eraser'>('pen');
  const [history,setHistory]=useState<string[]>([]); const [save,setSave]=useState(false); const [status,setStatus]=useState('900 × 520 pixels');
  useEffect(()=>{const ctx=canvas.current!.getContext('2d')!;ctx.fillStyle='#ffffff';ctx.fillRect(0,0,900,520);},[]);
  const remember=()=>setHistory(h=>[...h.slice(-14),canvas.current!.toDataURL()]);
  const position=(e:React.PointerEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect();return{x:(e.clientX-r.left)*900/r.width,y:(e.clientY-r.top)*520/r.height};};
  const stroke=(x:number,y:number)=>{const ctx=canvas.current!.getContext('2d')!;ctx.strokeStyle=tool==='eraser'?'#ffffff':color;ctx.lineWidth=tool==='eraser'?width*4:width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(previous.current.x,previous.current.y);ctx.lineTo(x,y);ctx.stroke();previous.current={x,y};};
  return <AppFrame id="paint" toolbar={<><Button variant={tool==='pen'?'accent':'standard'} onClick={()=>setTool('pen')}>Brush</Button><Button variant={tool==='eraser'?'accent':'standard'} onClick={()=>setTool('eraser')}>Eraser</Button><input type="color" aria-label="Brush color" value={color} onChange={e=>setColor(e.target.value)}/><label className="app-row">Size<input aria-label="Brush size" type="range" min="1" max="30" value={width} onChange={e=>setWidth(+e.target.value)}/></label>
  <Button disabled={!history.length} onClick={()=>{const image=new Image();image.onload=()=>{canvas.current!.getContext('2d')!.drawImage(image,0,0);};image.src=history.at(-1)!;setHistory(h=>h.slice(0,-1));}}>Undo</Button><Button onClick={()=>{remember();const c=canvas.current!.getContext('2d')!;c.fillStyle='white';c.fillRect(0,0,900,520);}}>Clear</Button><Button variant="accent" onClick={()=>setSave(true)}>Save picture</Button><Button onClick={()=>canvas.current!.toBlob(b=>{if(b)download('Drawing.png',b);})}>Export PNG</Button></>} footer={status}>
    <div className="paint-workspace"><canvas ref={canvas} className="paint-canvas" width="900" height="520" aria-label="Drawing canvas" onPointerDown={e=>{if(e.button!==0)return;remember();drawing.current=true;e.currentTarget.setPointerCapture(e.pointerId);previous.current=position(e);stroke(previous.current.x+.01,previous.current.y+.01);}} onPointerMove={e=>{if(drawing.current){const p=position(e);stroke(p.x,p.y);}}} onPointerUp={()=>drawing.current=false} onPointerCancel={()=>drawing.current=false}/></div>
    {save&&<NameDialog title="Save to Pictures" initial="Drawing.png" onClose={()=>setSave(false)} onSubmit={name=>{savePicture(name.endsWith('.png')?name:name+'.png',canvas.current!.toDataURL());setSave(false);setStatus('Saved to Pictures');}}/>}
  </AppFrame>;
}

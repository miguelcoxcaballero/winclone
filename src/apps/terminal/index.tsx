import { useEffect, useRef, useState } from 'react';
import type { AppProps } from '@/core/types';
import { useFS, FS } from '@/core/store/fs';
import { COMMANDS, openNode } from '@/core/launch';
import { openApp } from '@/core/store/windows';
import { AppFrame } from '../shared';
export default function Terminal({args}:AppProps) {
  const [cwd,setCwd]=useState<string>(args?.cwd??FS.user);const [input,setInput]=useState('');const [lines,setLines]=useState(['WinClone Terminal [Version 1.0]','A virtual shell for your browser files. Type help to see commands.','']);const [history,setHistory]=useState<string[]>([]);const historyIndex=useRef(0);const bottom=useRef<HTMLDivElement>(null);
  const fs=useFS();const path=fs.nodes[cwd]?fs.path(cwd):fs.path(FS.user);
  useEffect(()=>{bottom.current?.scrollIntoView({block:'nearest'});},[lines]);
  const execute=(command:string)=>{
    const parts=command.match(/"[^"]*"|'[^']*'|\S+/g)?.map(x=>x.replace(/^["']|["']$/g,''))??[];const op=parts.shift()?.toLowerCase()??'';const name=parts.join(' ');
    const resolve=(p:string)=>fs.resolve(p)??fs.resolve(`${path}\\${p}`);let output='';
    if(op==='clear'||op==='cls'){setLines([]);return;}
    if(op==='help')output='help · dir / ls · cd <folder> · pwd · type / cat <file>\nmkdir <name> · touch <name> · echo <text> · write <file> <text>\ncopy <file> <name> · ren <file> <name> · del <file>\nstart <app or file> · date · whoami · cls\nUse quotes around names with spaces. Commands operate on the virtual file system.';
    else if(op==='pwd')output=path;
    else if(op==='dir'||op==='ls')output=fs.children(cwd).map(n=>`${n.type==='file'?'      ':'<DIR> '} ${n.name}`).join('\n')||'This folder is empty.';
    else if(op==='cd'){const n=name==='..'?fs.nodes[fs.nodes[cwd]?.parent??FS.user]:resolve(name||'home');if(n&&(n.type==='folder'||n.type==='drive'))setCwd(n.id);else output='Directory not found.';}
    else if(op==='cat'||op==='type'){const n=resolve(name);output=n?.type==='file'?n.content??'':'File not found.';}
    else if(op==='echo')output=name;
    else if(op==='mkdir'){if(name)fs.createFolder(cwd,name);else output='Usage: mkdir <name>';}
    else if(op==='touch'){if(name)fs.createFile(cwd,name,'');else output='Usage: touch <name>';}
    else if(op==='write'){const filename=parts.shift();if(filename){const n=resolve(filename);if(n?.type==='file')fs.writeFile(n.id,parts.join(' '));else if(!n)fs.createFile(cwd,filename,parts.join(' '));else output='Cannot write to a folder.';}else output='Usage: write <file> <text>';}
    else if(op==='del'||op==='rm'){const n=resolve(name);if(n&&!n.system&&n.type!=='drive')fs.remove(n.id);else output='File not found or protected.';}
    else if(op==='ren'||op==='rename'){const n=resolve(parts[0]??'');if(n&&parts[1])fs.rename(n.id,parts.slice(1).join(' '));else output='Usage: ren <file> <new name>';}
    else if(op==='copy'){const n=resolve(parts[0]??'');if(n&&parts[1]){const id=fs.copy(n.id,cwd);fs.rename(id,parts.slice(1).join(' '));}else output='Usage: copy <file> <new name>';}
    else if(op==='date')output=new Date().toLocaleString();
    else if(op==='whoami')output=path.split('\\')[2]??'User';
    else if(op==='start'){if(COMMANDS[name])openApp(COMMANDS[name]);else{const n=resolve(name);if(n)openNode(n);else output='App or file not found.';}}
    else if(COMMANDS[op])openApp(COMMANDS[op]);else if(op)output=`'${op}' is not a recognized virtual command.`;
    setLines(old=>[...old,`${path}> ${command}`,...(output?[output]:[]),''].slice(-500));
  };
  return <AppFrame id="terminal"><pre className="terminal-output">{lines.join('\n')}</pre><form className="terminal-prompt" onSubmit={e=>{e.preventDefault();execute(input);setHistory(h=>[...h,input]);historyIndex.current=history.length+1;setInput('');}}><span>{path}&gt;</span><input autoFocus aria-label="Terminal command" value={input} onChange={e=>setInput(e.target.value)} autoComplete="off" spellCheck={false} onKeyDown={e=>{if(e.key==='ArrowUp'){e.preventDefault();historyIndex.current=Math.max(0,historyIndex.current-1);setInput(history[historyIndex.current]??'');}if(e.key==='ArrowDown'){e.preventDefault();historyIndex.current=Math.min(history.length,historyIndex.current+1);setInput(history[historyIndex.current]??'');}}}/></form><div ref={bottom}/></AppFrame>;
}

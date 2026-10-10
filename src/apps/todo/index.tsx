import { useState } from 'react';
import { Button } from '@/components/controls';
import { AppFrame, Empty, useLocal } from '../shared';
type Task={id:string;text:string;done:boolean;important:boolean;list:string};
export default function Todo() {
  const [tasks,setTasks]=useLocal<Task[]>('wc.todo',[]);const [lists,setLists]=useLocal('wc.todo.lists',['My Day','Personal','Work']);
  const [list,setList]=useState('My Day');const [text,setText]=useState('');const [newList,setNewList]=useState('');
  const shown=tasks.filter(t=>list==='Important'?t.important:list==='Completed'?t.done:t.list===list);
  const change=(id:string,patch:Partial<Task>)=>setTasks(ts=>ts.map(t=>t.id===id?{...t,...patch}:t));
  return <AppFrame id="todo"><div className="app-split"><nav className="app-sidebar">{[...lists,'Important','Completed'].map(l=><button key={l} className={l===list?'selected':''} onClick={()=>setList(l)}>{l}<span className="app-grow"/><span aria-hidden="true">{tasks.filter(t=>l==='Important'?t.important:l==='Completed'?t.done:t.list===l).length}</span></button>)}
  <form className="app-pad" onSubmit={e=>{e.preventDefault();const name=newList.trim();if(name&&!['Important','Completed',...lists].includes(name)){setLists(ls=>[...ls,name]);setList(name);setNewList('');}}}><input aria-label="New list name" style={{width:'100%'}} placeholder="New list" value={newList} onChange={e=>setNewList(e.target.value)}/></form></nav>
  <div className="app-grow" style={{overflow:'auto'}}><div className="todo-hero"><h1>{list}</h1><span>{new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</span></div><div className="app-pad">
  {shown.map(t=><div key={t.id} className={`todo-item ${t.done?'completed':''}`}><input type="checkbox" aria-label={`Complete ${t.text}`} checked={t.done} onChange={e=>change(t.id,{done:e.target.checked})}/><span className="app-grow">{t.text}</span><Button aria-label={`Mark ${t.text} important`} onClick={()=>change(t.id,{important:!t.important})}>{t.important?'★':'☆'}</Button><Button aria-label={`Delete ${t.text}`} onClick={()=>setTasks(ts=>ts.filter(x=>x.id!==t.id))}>×</Button></div>)}
  {!shown.length&&<Empty title="A little room for a fresh start">Add a task and make a plan for your day.</Empty>}
  <form className="app-row" onSubmit={e=>{e.preventDefault();if(text.trim()){setTasks(ts=>[...ts,{id:crypto.randomUUID(),text:text.trim(),done:false,important:list==='Important',list:['Important','Completed'].includes(list)?'My Day':list}]);setText('');}}}><input className="app-grow" aria-label="New task" placeholder="Add a task" value={text} onChange={e=>setText(e.target.value)}/><Button variant="accent" type="submit">Add task</Button></form>
  </div></div></div></AppFrame>;
}

'use client'

import {useEffect,useState} from 'react'
import Link from 'next/link'

const steps=[
 {title:'Review today’s position',detail:'Start with pending decisions, overdue actions, the next meeting and evidence freshness.',href:'#today'},
 {title:'Confirm decisions and accountability',detail:'Review meeting evidence, approve decision records, assign owners and track due dates.',href:'/ceo/minutes'},
 {title:'Load evidence and configure KPIs',detail:'Upload a verified organisational dataset, inspect its quality and map decision-critical indicators.',href:'#data'},
 {title:'Test an assumption',detail:'Run a transparent scenario against a configured KPI before committing resources.',href:'#scenarios'},
 {title:'Record strategic direction',detail:'Save the evidence, commitments, assumptions and review date as a protected direction statement.',href:'#direction'},
]

export default function ExecutiveGuide(){
 const[open,setOpen]=useState(false)
 const[done,setDone]=useState<number[]>([])
 useEffect(()=>{
  try{
   setDone(JSON.parse(localStorage.getItem('dqi-executive-guide')||'[]'))
   setOpen(localStorage.getItem('dqi-executive-guide-open')==='true')
  }catch{}
 },[])
 function toggleStep(index:number){
  const next=done.includes(index)?done.filter(x=>x!==index):[...done,index]
  setDone(next)
  localStorage.setItem('dqi-executive-guide',JSON.stringify(next))
 }
 function toggleOpen(){
  const next=!open
  setOpen(next)
  localStorage.setItem('dqi-executive-guide-open',String(next))
 }
 const progress=Math.round(done.length/steps.length*100)
 return <section className="ceo-guide" aria-labelledby="guide-title">
  <div className="ceo-guide-brief">
   <div>
    <p>WORKSPACE BRIEF</p>
    <h2 id="guide-title">What Executive Intelligence can do</h2>
    <span>Bring meeting records, organisational evidence, KPIs, risks, decisions, delegated actions, scenarios and strategic direction into one accountable leadership workflow.</span>
   </div>
   <button type="button" onClick={toggleOpen} aria-expanded={open} aria-controls="executive-guide-steps">{open?'Hide interactive guide':'Start interactive guide'}</button>
  </div>
  <div className="ceo-capabilities" aria-label="Executive workspace capabilities">
   <span><b>SEE</b> priorities, exceptions and evidence freshness</span>
   <span><b>DECIDE</b> with traceable records and human confirmation</span>
   <span><b>DELEGATE</b> ownership, deadlines and follow-up</span>
   <span><b>TEST</b> assumptions through transparent scenarios</span>
   <span><b>DIRECT</b> strategy with recorded evidence and review dates</span>
  </div>
  {open&&<div id="executive-guide-steps" className="ceo-guide-panel">
   <div className="ceo-guide-progress"><div><b>{done.length}/{steps.length} steps reviewed</b><span>{progress}%</span></div><progress max={100} value={progress}>{progress}%</progress></div>
   <ol>{steps.map((step,index)=><li key={step.title} className={done.includes(index)?'complete':''}>
    <button type="button" className="guide-check" onClick={()=>toggleStep(index)} aria-label={`${done.includes(index)?'Mark incomplete':'Mark complete'}: ${step.title}`} aria-pressed={done.includes(index)}>{done.includes(index)?'✓':index+1}</button>
    <div><h3>{step.title}</h3><p>{step.detail}</p></div>
    {step.href.startsWith('/')?<Link href={step.href}>Open →</Link>:<a href={step.href}>Go there →</a>}
   </li>)}</ol>
   <p className="ceo-guide-note">Guide progress is saved only in this browser and does not alter organisational records.</p>
  </div>}
 </section>
}

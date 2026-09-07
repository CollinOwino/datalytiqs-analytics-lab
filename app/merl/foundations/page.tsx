'use client'

import {useState} from 'react'

const modules=[
 ['01','Introduction to Monitoring, Evaluation and Learning','Classify evidence functions'],
 ['02','Project and Programme Logic','Build a results chain'],
 ['03','Theory of Change','Build and critique causal logic'],
 ['04','Logical Frameworks','Construct a professional logframe'],
 ['05','Introduction to Indicators','Design and calculate indicators'],
]

export default function MerlFoundations(){
 const[done,setDone]=useState<string[]>([])
 const toggle=(id:string)=>setDone(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])
 const progress=Math.round(done.length/modules.length*100)
 return <main style={{maxWidth:1100,margin:'0 auto',padding:'40px 24px',fontFamily:'system-ui'}}>
  <a href="/">← DatalytIQs Analytics Lab</a>
  <p style={{letterSpacing:2,fontSize:12,marginTop:28}}>MERL PROFESSIONAL PATHWAY · LEVEL 1</p>
  <h1 style={{fontSize:42,margin:'8px 0'}}>Monitoring & Evaluation Foundations</h1>
  <p style={{maxWidth:760,fontSize:18,lineHeight:1.6}}>Build the results architecture behind credible monitoring and evaluation. Every module produces professional evidence for your portfolio.</p>
  <section style={{padding:20,border:'1px solid #ddd',borderRadius:12,margin:'28px 0'}}><b>Progress {progress}%</b><div style={{height:8,background:'#eee',borderRadius:8,marginTop:10}}><div style={{height:8,width:`${progress}%`,background:'currentColor',borderRadius:8}}/></div></section>
  <section style={{display:'grid',gap:14}}>{modules.map(([id,title,output])=><article key={id} style={{border:'1px solid #ddd',borderRadius:12,padding:20,display:'grid',gridTemplateColumns:'60px 1fr auto',gap:16,alignItems:'center'}}><b style={{fontSize:24}}>{id}</b><div><h2 style={{margin:0,fontSize:20}}>{title}</h2><p style={{margin:'6px 0 0'}}>Professional output: {output}</p></div><button onClick={()=>toggle(id)} style={{padding:'10px 14px'}}>{done.includes(id)?'Completed ✓':'Mark practice complete'}</button></article>)}</section>
  <section style={{marginTop:32,padding:24,border:'1px solid #ddd',borderRadius:12}}><p style={{letterSpacing:1,fontSize:12}}>FOUNDATIONS CASE LAB</p><h2>County Youth Employment Programme</h2><p>Use the synthetic learner dataset to connect programme logic to measurable indicators. Calculate enrolment, completion and six-month employment results, then disaggregate responsibly by sex and county.</p><div style={{display:'flex',gap:12,flexWrap:'wrap'}}><a href="/api/merl/level1/dataset" download style={{padding:'11px 15px',border:'1px solid currentColor',borderRadius:8}}>Download synthetic dataset</a><a href="/python-editor?case=merl-foundations-001" style={{padding:'11px 15px',border:'1px solid currentColor',borderRadius:8}}>Open Analytics Workspace →</a></div></section>
  <section style={{marginTop:32}}><h2>Level 1 credential gate</h2><p>Complete all five modules, required quizzes and the professional portfolio: results chain + Theory of Change + logframe + indicator set. Minimum overall score: 70%; minimum gated competency: 60%.</p></section>
 </main>
}

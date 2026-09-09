'use client'

import {useMemo,useState} from 'react'

type Module={id:string;title:string;output:string;lessons:string[];quiz:number}
const modules:Module[]=[
 {id:'01',title:'Introduction to Monitoring, Evaluation and Learning',output:'Evidence-function classification matrix',quiz:70,lessons:['What M&E and Learning Are','Monitoring vs Evaluation vs Research vs Audit','Classify Evidence Functions in a Real Programme']},
 {id:'02',title:'Project and Programme Logic',output:'Results chain',quiz:70,lessons:['Projects, Programmes and Results','Inputs, Activities, Outputs, Outcomes and Impact','Build and Test a Results Chain']},
 {id:'03',title:'Theory of Change',output:'Theory of Change',quiz:70,lessons:['Theory of Change Fundamentals','Assumptions, Risks and Causal Pathways','Build and Critique a Theory of Change']},
 {id:'04',title:'Logical Frameworks',output:'Professional logframe',quiz:70,lessons:['Logical Framework Anatomy','Vertical and Horizontal Logic','Construct a Professional Logframe']},
 {id:'05',title:'Introduction to Indicators',output:'Quality-assured indicator set',quiz:70,lessons:['What Makes an Indicator Useful','Indicator Types and SMART/CREAM Tests','Design Indicators from a Results Framework']},
]

export default function MerlFoundations(){
 const[open,setOpen]=useState('01')
 const[lessonEvidence,setLessonEvidence]=useState<Record<string,boolean>>({})
 const[submitted,setSubmitted]=useState<Record<string,boolean>>({})
 const[quizPassed,setQuizPassed]=useState<Record<string,boolean>>({})
 const moduleComplete=(m:Module)=>m.lessons.every((_,i)=>lessonEvidence[`${m.id}-${i}`])&&submitted[m.id]&&quizPassed[m.id]
 const completed=modules.filter(moduleComplete).length
 const progress=Math.round(completed/modules.length*100)
 const nextLocked=(index:number)=>index>0&&!moduleComplete(modules[index-1])
 const portfolioReady=completed===modules.length
 const totalEvidence=useMemo(()=>modules.reduce((n,m)=>n+m.lessons.length+2,0),[])
 const achieved=modules.reduce((n,m)=>n+m.lessons.filter((_,i)=>lessonEvidence[`${m.id}-${i}`]).length+(submitted[m.id]?1:0)+(quizPassed[m.id]?1:0),0)
 return <main style={{maxWidth:1100,margin:'0 auto',padding:'40px 24px',fontFamily:'system-ui',color:'#0b2c4d'}}>
  <a href="/">← DatalytIQs Analytics Lab</a>
  <p style={{letterSpacing:2,fontSize:12,marginTop:28}}>MERL PROFESSIONAL PATHWAY · LEVEL 1</p>
  <h1 style={{fontSize:42,margin:'8px 0'}}>Monitoring & Evaluation Foundations</h1>
  <p style={{maxWidth:780,fontSize:18,lineHeight:1.6}}>Build the results architecture behind credible monitoring and evaluation. Progress is earned through lesson evidence, professional submissions and competency checks—not page views.</p>
  <section style={{padding:20,border:'1px solid #d7dee7',borderRadius:12,margin:'28px 0',background:'#f6f8fb'}}><b>Credential progress {progress}%</b><span style={{float:'right'}}>{achieved}/{totalEvidence} evidence gates</span><div style={{height:8,background:'#e5e7eb',borderRadius:8,marginTop:12}}><div style={{height:8,width:`${progress}%`,background:'#1565c0',borderRadius:8}}/></div></section>
  <section style={{display:'grid',gap:14}}>{modules.map((m,index)=>{const locked=nextLocked(index),complete=moduleComplete(m),expanded=open===m.id;return <article key={m.id} style={{border:'1px solid #d7dee7',borderRadius:12,overflow:'hidden',opacity:locked?.58:1}}>
   <button disabled={locked} onClick={()=>setOpen(expanded?'':m.id)} style={{width:'100%',border:0,background:complete?'#eef8f1':'white',padding:20,display:'grid',gridTemplateColumns:'60px 1fr auto',gap:16,alignItems:'center',textAlign:'left',color:'#0b2c4d',cursor:locked?'not-allowed':'pointer'}}><b style={{fontSize:24}}>{m.id}</b><div><h2 style={{margin:0,fontSize:20}}>{m.title}</h2><p style={{margin:'6px 0 0'}}>Professional output: {m.output}</p></div><b>{locked?'LOCKED':complete?'COMPETENT ✓':expanded?'CLOSE':'OPEN MODULE'}</b></button>
   {expanded&&!locked&&<div style={{padding:'0 24px 24px',background:'#fff'}}><hr style={{border:0,borderTop:'1px solid #e5e7eb'}}/><h3>Learning sequence</h3>{m.lessons.map((lesson,i)=>{const k=`${m.id}-${i}`;return <label key={k} style={{display:'flex',gap:12,padding:'10px 0',alignItems:'flex-start'}}><input type="checkbox" checked={!!lessonEvidence[k]} onChange={e=>setLessonEvidence(v=>({...v,[k]:e.target.checked}))}/><span><b>{m.id}.{i+1} {lesson}</b><br/><small>Complete the guided practice and retain the resulting evidence in your portfolio.</small></span></label>})}
    <div style={{marginTop:18,padding:16,border:'1px solid #d7dee7',borderRadius:10}}><b>Professional submission</b><p>Required evidence: {m.output}. Submission becomes available after all three lesson practices are evidenced.</p><button disabled={!m.lessons.every((_,i)=>lessonEvidence[`${m.id}-${i}`])} onClick={()=>setSubmitted(v=>({...v,[m.id]:true}))}>{submitted[m.id]?'Evidence submitted ✓':'Submit professional evidence'}</button></div>
    <div style={{marginTop:12,padding:16,border:'1px solid #d7dee7',borderRadius:10}}><b>Module competency check</b><p>Pass threshold: {m.quiz}%. This pilot control represents the scored Tutor LMS quiz gate and is disabled until professional evidence is submitted.</p><button disabled={!submitted[m.id]} onClick={()=>setQuizPassed(v=>({...v,[m.id]:true}))}>{quizPassed[m.id]?'Quiz passed ✓':'Record validated quiz pass'}</button></div>
    <p style={{marginTop:16,fontWeight:700}}>Module status: {complete?'COMPLETE — next module unlocked':'Complete all lesson evidence + professional submission + quiz.'}</p>
   </div>}
  </article>})}</section>
  <section style={{marginTop:32,padding:24,border:'1px solid #d7dee7',borderRadius:12}}><p style={{letterSpacing:1,fontSize:12}}>FOUNDATIONS CASE LAB</p><h2>County Youth Employment Programme</h2><p>Use the synthetic learner dataset to connect programme logic to measurable indicators. Calculate enrolment, completion and six-month employment results, then disaggregate responsibly by sex and county.</p><div style={{display:'flex',gap:12,flexWrap:'wrap'}}><a href="/api/merl/level1/dataset" download style={{padding:'11px 15px',border:'1px solid currentColor',borderRadius:8}}>Download synthetic dataset</a><a href="/merl/foundations/lab" style={{padding:'11px 15px',border:'1px solid currentColor',borderRadius:8}}>Open Analytics Workspace →</a></div></section>
  <section style={{marginTop:32,padding:24,borderRadius:12,background:portfolioReady?'#eef8f1':'#f6f8fb'}}><h2>Level 1 credential gate</h2><p>Required: all five competency-gated modules + professional portfolio + overall score ≥70% + each gated competency ≥60%.</p><p><b>{portfolioReady?'Portfolio gate unlocked — ready for final scoring and credential decision.':'Portfolio gate locked — complete the evidence sequence above.'}</b></p></section>
 </main>
}

'use client'

import {useEffect,useState} from 'react'
import {getMerlLevel1State,getModuleQuiz,gradeModuleQuiz,markLessonEvidence,submitProfessionalEvidence} from './actions'

type Module={id:string;title:string;output:string;lessons:string[]}
type Progress={module_id:string;lesson_evidence:Record<string,boolean>;evidence_submission:any;quiz_score:number|null;quiz_passed:boolean;quiz_attempts:number;module_completed_at:string|null}
type QuizItem={question_id:string;question_order:number;stem:string;options:string[]}
const modules:Module[]=[
 {id:'01',title:'Introduction to Monitoring, Evaluation and Learning',output:'Evidence-function classification matrix',lessons:['What M&E and Learning Are','Monitoring vs Evaluation vs Research vs Audit','Classify Evidence Functions in a Real Programme']},
 {id:'02',title:'Project and Programme Logic',output:'Results chain',lessons:['Projects, Programmes and Results','Inputs, Activities, Outputs, Outcomes and Impact','Build and Test a Results Chain']},
 {id:'03',title:'Theory of Change',output:'Theory of Change',lessons:['Theory of Change Fundamentals','Assumptions, Risks and Causal Pathways','Build and Critique a Theory of Change']},
 {id:'04',title:'Logical Frameworks',output:'Professional logframe',lessons:['Logical Framework Anatomy','Vertical and Horizontal Logic','Construct a Professional Logframe']},
 {id:'05',title:'Introduction to Indicators',output:'Quality-assured indicator set',lessons:['What Makes an Indicator Useful','Indicator Types and SMART/CREAM Tests','Design Indicators from a Results Framework']},
]

export default function MerlFoundations(){
 const[open,setOpen]=useState('01'),[progress,setProgress]=useState<Record<string,Progress>>({}),[loading,setLoading]=useState(true),[busy,setBusy]=useState(''),[message,setMessage]=useState('')
 const[evidence,setEvidence]=useState<Record<string,string>>({}),[quiz,setQuiz]=useState<Record<string,QuizItem[]>>({}),[answers,setAnswers]=useState<Record<string,Record<string,string>>>({})
 async function refresh(){const rows=await getMerlLevel1State();const map:Record<string,Progress>={};rows.forEach((r:Progress)=>map[r.module_id]=r);setProgress(map);setLoading(false)}
 useEffect(()=>{refresh().catch(e=>{setMessage(e.message);setLoading(false)})},[])
 const p=(id:string)=>progress[id]
 const complete=(id:string)=>!!p(id)?.module_completed_at
 const lessonsDone=(m:Module)=>m.lessons.every((_,i)=>!!p(m.id)?.lesson_evidence?.[`${m.id}-${i}`])
 const completed=modules.filter(m=>complete(m.id)).length,credentialProgress=Math.round(completed/5*100)
 const achieved=modules.reduce((n,m)=>n+m.lessons.filter((_,i)=>p(m.id)?.lesson_evidence?.[`${m.id}-${i}`]).length+(p(m.id)?.evidence_submission?1:0)+(p(m.id)?.quiz_passed?1:0),0)
 async function run(key:string,fn:()=>Promise<any>){setBusy(key);setMessage('');try{await fn();await refresh()}catch(e:any){setMessage(e.message||'Action failed.')}finally{setBusy('')}}
 async function loadQuiz(id:string){await run(`quiz-${id}`,async()=>{const q=await getModuleQuiz(id);setQuiz(v=>({...v,[id]:q}))})}
 return <main style={{maxWidth:1100,margin:'0 auto',padding:'40px 24px',fontFamily:'system-ui',color:'#0b2c4d'}}>
  <a href="/">← DatalytIQs Analytics Lab</a><p style={{letterSpacing:2,fontSize:12,marginTop:28}}>MERL PROFESSIONAL PATHWAY · LEVEL 1</p><h1 style={{fontSize:42,margin:'8px 0'}}>Monitoring & Evaluation Foundations</h1>
  <p style={{maxWidth:800,fontSize:18,lineHeight:1.6}}>Authenticated learner progress is stored in Supabase. Lesson evidence, professional submissions and quiz attempts survive refresh and sign-out; quiz scores are calculated by the database against a protected answer key.</p>
  {message&&<p style={{padding:14,border:'1px solid #f4a261',borderRadius:8}}>{message}</p>}
  <section style={{padding:20,border:'1px solid #d7dee7',borderRadius:12,margin:'28px 0',background:'#f6f8fb'}}><b>Credential progress {loading?'…':`${credentialProgress}%`}</b><span style={{float:'right'}}>{achieved}/25 evidence gates</span><div style={{height:8,background:'#e5e7eb',borderRadius:8,marginTop:12}}><div style={{height:8,width:`${credentialProgress}%`,background:'#1565c0',borderRadius:8}}/></div></section>
  <section style={{display:'grid',gap:14}}>{modules.map((m,index)=>{const locked=index>0&&!complete(modules[index-1].id),expanded=open===m.id,mp=p(m.id),isComplete=complete(m.id);return <article key={m.id} style={{border:'1px solid #d7dee7',borderRadius:12,overflow:'hidden',opacity:locked?.58:1}}>
   <button disabled={locked||loading} onClick={()=>setOpen(expanded?'':m.id)} style={{width:'100%',border:0,background:isComplete?'#eef8f1':'white',padding:20,display:'grid',gridTemplateColumns:'60px 1fr auto',gap:16,alignItems:'center',textAlign:'left',color:'#0b2c4d'}}><b style={{fontSize:24}}>{m.id}</b><div><h2 style={{margin:0,fontSize:20}}>{m.title}</h2><p style={{margin:'6px 0 0'}}>Professional output: {m.output}</p></div><b>{locked?'LOCKED':isComplete?'COMPETENT ✓':expanded?'CLOSE':'OPEN MODULE'}</b></button>
   {expanded&&!locked&&<div style={{padding:'0 24px 24px'}}><hr style={{border:0,borderTop:'1px solid #e5e7eb'}}/><h3>Learning sequence</h3>{m.lessons.map((lesson,i)=>{const k=`${m.id}-${i}`,done=!!mp?.lesson_evidence?.[k];return <div key={k} style={{display:'grid',gridTemplateColumns:'1fr auto',gap:12,padding:'10px 0'}}><span><b>{m.id}.{i+1} {lesson}</b><br/><small>Complete the guided practice, then record the evidence gate.</small></span><button disabled={done||!!busy} onClick={()=>run(k,()=>markLessonEvidence(m.id,i))}>{done?'Recorded ✓':busy===k?'Saving…':'Record lesson evidence'}</button></div>})}
    <div style={{marginTop:18,padding:16,border:'1px solid #d7dee7',borderRadius:10}}><b>Professional evidence submission</b><p>Submit the actual {m.output.toLowerCase()}. Minimum 20 characters; the submission is stored with your learner identity and timestamp.</p><textarea rows={5} value={evidence[m.id]||''} onChange={e=>setEvidence(v=>({...v,[m.id]:e.target.value}))} disabled={!!mp?.evidence_submission} style={{width:'100%',boxSizing:'border-box',padding:10}}/><button disabled={!lessonsDone(m)||!!mp?.evidence_submission||!!busy} onClick={()=>run(`ev-${m.id}`,()=>submitProfessionalEvidence(m.id,m.output,evidence[m.id]||''))}>{mp?.evidence_submission?'Submitted ✓':busy===`ev-${m.id}`?'Submitting…':'Submit professional evidence'}</button></div>
    <div style={{marginTop:12,padding:16,border:'1px solid #d7dee7',borderRadius:10}}><b>Scored module quiz</b><p>Pass mark 70%; maximum two attempts. Answers are graded server-side and the protected answer key is never sent to the browser.</p>{mp?.quiz_score!=null&&<p><b>Best score: {mp.quiz_score}% · Attempts: {mp.quiz_attempts}/2 {mp.quiz_passed?'· PASSED':''}</b></p>}
     {!mp?.quiz_passed&&mp?.evidence_submission&&!quiz[m.id]&&<button disabled={!!busy||mp.quiz_attempts>=2} onClick={()=>loadQuiz(m.id)}>Load quiz</button>}
     {quiz[m.id]?.map(q=><fieldset key={q.question_id} style={{margin:'12px 0',padding:12}}><legend><b>{q.stem}</b></legend>{q.options.map((o,j)=><label key={j} style={{display:'block',padding:'5px 0'}}><input type="radio" name={q.question_id} checked={answers[m.id]?.[q.question_id]===String(j)} onChange={()=>setAnswers(v=>({...v,[m.id]:{...(v[m.id]||{}),[q.question_id]:String(j)}}))}/> {o}</label>)}</fieldset>)}
     {quiz[m.id]?.length>0&&!mp?.quiz_passed&&<button disabled={!!busy||quiz[m.id].some(q=>answers[m.id]?.[q.question_id]===undefined)} onClick={()=>run(`grade-${m.id}`,async()=>{await gradeModuleQuiz(m.id,answers[m.id]||{});setQuiz(v=>({...v,[m.id]:[]}));setAnswers(v=>({...v,[m.id]:{}}))})}>Submit quiz for scoring</button>}
    </div><p style={{fontWeight:700}}>Module status: {isComplete?'COMPLETE — next module unlocked':'Server validation required: 3 lesson gates + evidence submission + quiz pass.'}</p>
   </div>}
  </article>})}</section>
  <section style={{marginTop:32,padding:24,border:'1px solid #d7dee7',borderRadius:12}}><p style={{letterSpacing:1,fontSize:12}}>FOUNDATIONS CASE LAB</p><h2>County Youth Employment Programme</h2><p>Use the synthetic dataset to connect programme logic to measurable indicators and disaggregate results responsibly.</p><div style={{display:'flex',gap:12}}><a href="/api/merl/level1/dataset" download>Download synthetic dataset</a><a href="/merl/foundations/lab">Open Analytics Workspace →</a></div></section>
  <section style={{marginTop:32,padding:24,borderRadius:12,background:completed===5?'#eef8f1':'#f6f8fb'}}><h2>Level 1 credential gate</h2><p><b>{completed===5?'All module competency gates passed — portfolio is ready for final credential review.':'Locked — complete all five persistent competency gates.'}</b></p></section>
 </main>
}

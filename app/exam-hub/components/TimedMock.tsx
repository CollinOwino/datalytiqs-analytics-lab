'use client'
import { useEffect,useMemo,useState } from 'react'

type Question={id:string;stem:string;options:{value:string;label:string}[]}
export default function TimedMock({assessmentId,title,timeLimit,questions}:{assessmentId:string;title:string;timeLimit:number;questions:Question[]}){
 const [attempt,setAttempt]=useState<any>(null),[answers,setAnswers]=useState<Record<string,string>>({}),[result,setResult]=useState<any>(null),[busy,setBusy]=useState(false),[now,setNow]=useState(Date.now())
 useEffect(()=>{if(!attempt)return;const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[attempt])
 const remaining=useMemo(()=>attempt?Math.max(0,Math.floor((new Date(attempt.expires_at).getTime()-now)/1000)):timeLimit*60,[attempt,now,timeLimit])
 async function start(){setBusy(true);const r=await fetch(`/api/exam-hub/mocks/${assessmentId}/start`,{method:'POST'});const j=await r.json();setBusy(false);if(r.ok)setAttempt(j);else alert(j.error||'Unable to start mock')}
 async function submit(){if(!attempt)return;setBusy(true);const r=await fetch(`/api/exam-hub/mocks/${attempt.id}/submit`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({answers})});const j=await r.json();setBusy(false);if(r.ok)setResult(j);else alert(j.error||'Unable to submit mock')}
 if(result)return <div className="exam-notice"><strong>{result.passed?'DatalytIQs readiness threshold met':'Remediation required'}</strong><p>Score: {result.score}/{result.max_score} · {result.percentage}%.</p><p>Domain-level evidence has been recorded and targeted remediation generated for domains below 70%.</p></div>
 if(!attempt)return <div className="exam-notice"><strong>{title}</strong><p>{questions.length} original DatalytIQs questions · {timeLimit} minutes. This is independent preparation, not the official Microsoft examination.</p><button className="exam-button primary" disabled={busy} onClick={start}>{busy?'Starting…':'Start timed mock'}</button></div>
 return <div><div className="exam-notice"><strong>Time remaining: {Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')}</strong><p>Answer every item, then submit before the timer expires.</p></div>{questions.map((q,i)=><article className="topic-card" key={q.id}><div className="topic-number">{String(i+1).padStart(2,'0')}</div><div className="topic-content"><h3>{q.stem}</h3>{q.options.map(o=><label key={o.value} style={{display:'block',margin:'8px 0'}}><input type="radio" name={q.id} checked={answers[q.id]===o.value} onChange={()=>setAnswers({...answers,[q.id]:o.value})}/> {o.label}</label>)}</div></article>)}<button className="exam-button primary" disabled={busy||remaining===0} onClick={submit}>{busy?'Scoring…':'Submit mock'}</button></div>
}

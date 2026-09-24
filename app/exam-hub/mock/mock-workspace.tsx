'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { saveMockResponses, submitFullMock } from './actions'

type Item={code:string;stem:string;title:string;options?:{value:string;label:string}[]}
export function MockWorkspace({attemptId,deadline,questions,practicals,initial}:{attemptId:string;deadline:string;questions:Item[];practicals:Item[];initial:Record<string,string>}){
  const [answers,setAnswers]=useState<Record<string,string>>(initial)
  const answersRef=useRef(answers);answersRef.current=answers
  const [remaining,setRemaining]=useState(Math.max(0,Math.ceil((new Date(deadline).getTime()-Date.now())/1000)))
  const [notice,setNotice]=useState('')
  const [busy,startTransition]=useTransition()
  const [special,setSpecial]=useState(initial['S-GOV']?.trim()?'S-GOV':'S-FIN')
  const expired=remaining<=0
  useEffect(()=>{const id=setInterval(()=>setRemaining(Math.max(0,Math.ceil((new Date(deadline).getTime()-Date.now())/1000))),1000);return()=>clearInterval(id)},[deadline])
  useEffect(()=>{const id=setInterval(async()=>{if(Date.now()>=new Date(deadline).getTime())return;const result=await saveMockResponses(attemptId,answersRef.current);setNotice(result.message)},45000);return()=>clearInterval(id)},[attemptId,deadline])
  const update=(code:string,value:string)=>setAnswers(previous=>({...previous,[code]:value}))
  const save=()=>startTransition(async()=>{const result=await saveMockResponses(attemptId,answersRef.current);setNotice(result.message)})
  const submit=()=>{if(!expired){const missing=questions.filter(q=>!answers[q.code]).length;const incomplete=practicals.filter(q=>q.code.startsWith('P')||q.code===special).filter(q=>(answers[q.code]||'').trim().length<250).length;if(missing||incomplete){setNotice(`Complete ${missing} unanswered questions and ${incomplete} practical responses (at least 250 characters each), or save a draft.`);return}}
    startTransition(async()=>{const result=await submitFullMock(attemptId,answersRef.current);if(!result.ok)setNotice(result.message)})}
  const clock=`${String(Math.floor(remaining/3600)).padStart(2,'0')}:${String(Math.floor(remaining%3600/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`
  return <div className="mock-workspace"><div className="mock-toolbar" role="status"><strong>{expired?'Time expired · submit saved work':`Time remaining ${clock}`}</strong><span>Attempt {attemptId.slice(0,8)} · auto saves every 45 seconds</span><button type="button" onClick={save} disabled={busy||expired}>{busy?'Working…':'Save draft'}</button></div>{notice&&<p className="mock-notice" role="status">{notice}</p>}
    <section aria-labelledby="mock-choice-title"><span className="exam-kicker">SECTION I · 20 MARKS</span><h2 id="mock-choice-title">Source-based decisions</h2><p>20 questions · one mark each. Select one answer per question.</p><div className="mock-questions">{questions.map((q,index)=><fieldset key={q.code} disabled={expired}><legend><b>{index+1}.</b> {q.stem}</legend>{q.options?.map(o=><label key={o.value}><input type="radio" name={q.code} value={o.value} checked={answers[q.code]===o.value} onChange={()=>update(q.code,o.value)}/>{o.label}</label>)}</fieldset>)}</div></section>
    <section aria-labelledby="mock-practical-title"><span className="exam-kicker">SECTION II · 60 MARKS</span><h2 id="mock-practical-title">Three required practical analyses</h2><p>Use the downloadable CA35P topic files. Each response needs calculations, checks, interpretation and a recommendation. Each task is worth 20 marks.</p>{practicals.filter(q=>q.code.startsWith('P')).map(q=><div className="mock-practical" key={q.code}><h3>{q.title}</h3><p>{q.stem}</p><label htmlFor={'mock-'+q.code}>Your analysis · at least 250 characters</label><textarea id={'mock-'+q.code} disabled={expired} value={answers[q.code]||''} maxLength={5000} onChange={e=>update(q.code,e.target.value)} rows={10}/><small>{(answers[q.code]||'').trim().length} characters · include your own workings</small></div>)}</section>
    <section aria-labelledby="mock-special-title"><span className="exam-kicker">SECTION III · 20 MARKS</span><h2 id="mock-special-title">Choose one specialisation</h2><div className="mock-special-options">{practicals.filter(q=>q.code.startsWith('S-')).map(q=><label key={q.code}><input type="radio" name="specialisation" disabled={expired} checked={special===q.code} onChange={()=>{setSpecial(q.code);setAnswers(previous=>({...previous,[special]:''}))}}/>{q.title}</label>)}</div>{practicals.filter(q=>q.code===special).map(q=><div className="mock-practical" key={q.code}><p>{q.stem}</p><label htmlFor="mock-special-response">Your specialisation analysis · at least 250 characters</label><textarea id="mock-special-response" disabled={expired} value={answers[q.code]||''} maxLength={5000} onChange={e=>update(q.code,e.target.value)} rows={10}/><small>{(answers[q.code]||'').trim().length} characters</small></div>)}</section>
    <div className="mock-submit"><p>Submission is final. Your 20 short questions are scored automatically; the four practical responses are reviewed against a 20-mark rubric each. You can save and return before time expires.</p><button type="button" onClick={submit} disabled={busy}>{busy?'Submitting…':expired?'Submit saved work':'Submit full mock for marking'}</button></div>
  </div>
}

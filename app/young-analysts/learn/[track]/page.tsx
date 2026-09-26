'use client'
import {useEffect,useMemo,useState} from 'react'
import Link from 'next/link'
import {youngAnalystTracks} from '../../curriculum'
import {youngAnalystLessons} from '../../lesson-content'
import {youngAnalystQuestionBank} from '../../question-bank'
import {youngDatasets} from '../../datasets'
import {getYoungAnalystState,gradeYoungQuiz,submitYoungEvidence} from '../../actions'
import '../../young-analysts.css'

export default function TrackWorkspace({params}:{params:Promise<{track:string}>}){
 const[trackSlug,setTrackSlug]=useState(''),[state,setState]=useState<any[]>([]),[answers,setAnswers]=useState<Record<string,number>>({}),[message,setMessage]=useState(''),[busy,setBusy]=useState(false)
 useEffect(()=>{params.then(p=>{setTrackSlug(p.track);getYoungAnalystState(p.track).then(setState).catch(e=>setMessage(e.message))})},[params])
 const track=youngAnalystTracks.find(t=>t.slug===trackSlug),lessons=youngAnalystLessons.filter(l=>l.track===trackSlug),dataset=youngDatasets.find(d=>d.track===trackSlug)
 const status=useMemo(()=>Object.fromEntries(state.map(x=>[x.module_code,x])),[state])
 if(!track)return <main className="ya-shell ya-preview"><section className="ya-section"><p>{trackSlug?'Unknown pathway.':'Loading pathway…'}</p></section></main>
 async function quiz(moduleCode:string){setBusy(true);const r=await gradeYoungQuiz(trackSlug,moduleCode,answers);setMessage(r.ok?('Scored '+r.score+'% · '+(r.passed?'knowledge check passed':'review and retry')):r.error);setBusy(false)}
 async function evidence(moduleCode:string,form:HTMLFormElement){setBusy(true);const fd=new FormData(form);try{await submitYoungEvidence({track:trackSlug,moduleCode,title:String(fd.get('title')||''),evidence:String(fd.get('evidence')||''),reflection:String(fd.get('reflection')||''),datasetId:dataset?.id});setMessage('Evidence submitted for review.');setState(await getYoungAnalystState(trackSlug));form.reset()}catch(e:any){setMessage(e.message)}finally{setBusy(false)}}
 return <main id="main-content" className="ya-shell ya-preview"><a className="ya-skip" href="#main-content">Skip to content</a><header className="ya-nav"><Link href="/young-analysts/learn">← Pathways</Link><strong>{track.title}</strong></header>
  <section className="ya-section"><span className="ya-kicker">{track.audience}</span><h1>{track.title}</h1><p>{track.purpose}</p>{message&&<div className="ya-test-banner" role="status">{message}</div>}
   {dataset&&<div className="ya-panel"><h2>Dataset workspace · {dataset.id}</h2><p><b>{dataset.title}</b> — {dataset.question}</p><div className="ya-table-wrap"><table className="ya-data-table"><thead><tr>{dataset.columns.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{dataset.rows.map((row,i)=><tr key={i}>{row.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></div><p><b>Quality notes:</b> {dataset.qualityNotes.join(' · ')}</p></div>}
   <div className="ya-grid products">{track.modules.map(m=>{const qs=youngAnalystQuestionBank.filter(q=>q.module===m.code),ls=lessons.filter(l=>l.module===m.code);return <article key={m.code}><span>{status[m.code]?.status?.toUpperCase()||'LEARNING'}</span><h2>{m.code} · {m.title}</h2><p>{m.outcome}</p><p><b>Applied project:</b> {m.project}</p>{ls.map(l=><p key={l.code}><Link href={'/young-analysts/learn/'+trackSlug+'/'+l.code}>{l.code} · {l.title} →</Link></p>)}
    {qs.length>0&&<details><summary><b>Scored knowledge check ({qs.length})</b></summary>{qs.map(q=><fieldset key={q.id}><legend>{q.prompt}</legend>{q.options.map((o,i)=><label key={i} style={{display:'block'}}><input type="radio" name={q.id} onChange={()=>setAnswers(a=>({...a,[q.id]:i}))}/> {o}</label>)}</fieldset>)}<button disabled={busy||qs.some(q=>answers[q.id]===undefined)} onClick={()=>quiz(m.code)}>Score knowledge check</button></details>}
    <details><summary><b>Submit applied evidence</b></summary><form onSubmit={e=>{e.preventDefault();evidence(m.code,e.currentTarget)}}><label>Evidence title<input name="title" required minLength={3}/></label><label>Work / evidence<textarea name="evidence" required minLength={40} rows={6}/></label><label>Reflection and limitation<textarea name="reflection" required minLength={30} rows={4}/></label><button disabled={busy}>Submit for review</button></form></details>
   </article>})}</div>
  </section></main>
}
'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {youngAnalystLessons} from '../../../lesson-content'
import {recordYoungLesson} from '../../../actions'
import '../../../young-analysts.css'

export default function LessonPage({params}:{params:Promise<{track:string;lesson:string}>}){
 const[track,setTrack]=useState(''),[code,setCode]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false)
 useEffect(()=>{params.then(p=>{setTrack(p.track);setCode(p.lesson)})},[params])
 const lesson=youngAnalystLessons.find(l=>l.track===track&&l.code===code)
 if(!lesson)return <main className="ya-shell ya-preview"><section className="ya-section"><p>{code?'Lesson content is not yet authored for this module.':'Loading lesson…'}</p>{track&&<Link href={'/young-analysts/learn/'+track}>← Return to pathway</Link>}</section></main>
 async function complete(){setBusy(true);try{await recordYoungLesson({track,moduleCode:lesson.module,lessonCode:lesson.code});setMessage('Lesson evidence gate recorded.')}catch(e:any){setMessage(e.message)}finally{setBusy(false)}}
 return <main id="main-content" className="ya-shell ya-preview"><a className="ya-skip" href="#main-content">Skip to content</a><header className="ya-nav"><Link href={'/young-analysts/learn/'+track}>← Pathway</Link><strong>{lesson.code}</strong></header><section className="ya-section"><span className="ya-kicker">{lesson.minutes} MIN · GUIDED LESSON</span><h1>{lesson.title}</h1>{message&&<div role="status" className="ya-test-banner">{message}</div>}
  <div className="ya-panel"><h2>Learning objectives</h2><ul>{lesson.objectives.map(x=><li key={x}>{x}</li>)}</ul></div>
  <div className="ya-panel"><h2>Core concepts</h2><ul>{lesson.concepts.map(x=><li key={x}>{x}</li>)}</ul></div>
  <div className="ya-panel"><h2>Worked example</h2><p>{lesson.workedExample}</p></div>
  <div className="ya-panel"><h2>Guided practice</h2><p>{lesson.guidedPractice}</p></div>
  <div className="ya-panel"><h2>Applied challenge</h2><p>{lesson.challenge}</p><h3>Quality checks</h3><ul>{lesson.qa.map(x=><li key={x}>{x}</li>)}</ul></div>
  <div className="ya-panel"><h2>Reflection</h2><p>{lesson.reflection}</p></div>
  <button className="ya-button primary" disabled={busy} onClick={complete}>{busy?'Saving…':'Record lesson evidence'}</button>
 </section></main>
}
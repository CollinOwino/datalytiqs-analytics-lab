import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { startFullMock } from './actions'
import { MockWorkspace } from './mock-workspace'
import '../exam-hub.css'
import './mock.css'

export const metadata: Metadata = { title: 'CA35P Full Online Mock Assignment | DatalytIQs', description: 'A timed 100-mark CA35P analytics assignment with original source-based questions and assessor-reviewed practical analyses.' }
const files = [
  ['Excel sales and product data','/downloads/ca35p/topic-1/ca35p-topic1-sales-practice.csv'],
  ['Channel performance','/downloads/ca35p/topic-2/ca35p-topic2-visualisation-data.csv'],
  ['Financial statements','/downloads/ca35p/topic-3/ca35p-topic3-financial-statements.csv'],
  ['Investment scenarios','/downloads/ca35p/topic-3/ca35p-topic3-investment-model.csv'],
  ['Audit transactions','/downloads/ca35p/topic-4/ca35p-topic4-audit-transactions.csv'],
  ['Budget and tax','/downloads/ca35p/topic-4/ca35p-topic4-budget-tax.csv'],
  ['Risk register','/downloads/ca35p/topic-5/ca35p-topic5-risk-register.csv'],
  ['Tool assessment','/downloads/ca35p/topic-5/ca35p-topic5-tool-assessment.csv'],
] as const

export default async function FullMockPage({searchParams}:{searchParams:Promise<{attempt?:string;state?:string}>}){
  const query=await searchParams
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user)redirect('/login?next=/exam-hub/mock')
  const admin=createAdminClient()
  const {data:programme}=await admin.from('exam_programmes').select('id').eq('code','CA35P').single()
  if(!programme)notFound()
  const {data:assessment}=await admin.from('exam_assessments').select('id,title,pass_mark,max_attempts,time_limit_minutes').eq('programme_id',programme.id).eq('assessment_type','mock').eq('status','published').single()
  if(!assessment)notFound()
  const [{data:enrollment},{data:grants},{data:attempts}]=await Promise.all([
    supabase.from('exam_enrollments').select('id,status').eq('programme_id',programme.id).eq('user_id',user.id).maybeSingle(),
    supabase.from('exam_access_grants').select('access_level,starts_at,expires_at').eq('programme_id',programme.id).eq('user_id',user.id).eq('access_level','full').is('revoked_at',null),
    supabase.from('exam_assessment_attempts').select('id,attempt_no,status,started_at,submitted_at,score,percentage,passed,integrity_metadata').eq('assessment_id',assessment.id).eq('user_id',user.id).order('attempt_no',{ascending:false}),
  ])
  const entitled=enrollment?.status==='active'&&Boolean(grants?.some(g=>(!g.starts_at||Date.parse(g.starts_at)<=Date.now())&&(!g.expires_at||Date.parse(g.expires_at)>Date.now())))
  const current=attempts?.find(a=>a.id===query.attempt)||(attempts||[]).find(a=>a.status==='in_progress')
  const active=current?.status==='in_progress'
  const {data:items}=entitled&&active?await admin.from('exam_assessment_items').select('sequence_no,points,exam_questions(id,stem,question_type,options,rights_metadata)').eq('assessment_id',assessment.id).order('sequence_no'): {data:[]}
  const {data:responses}=entitled&&active?await supabase.from('exam_assessment_responses').select('question_id,response').eq('attempt_id',current.id):{data:[]}
  const answers:Record<string,string>={}
  const ordered=(items||[]).map((item:any)=>({...item,question:Array.isArray(item.exam_questions)?item.exam_questions[0]:item.exam_questions}))
  for(const item of ordered){const saved=responses?.find(r=>r.question_id===item.question?.id);if(saved)answers[item.question.rights_metadata.mock_code]=(saved.response as {value:string}).value||''}
  const questions=ordered.filter(i=>i.question?.question_type==='single_choice').map(i=>({code:i.question.rights_metadata.mock_code,title:'',stem:i.question.stem,options:i.question.options}))
  const practicals=ordered.filter(i=>i.question?.question_type==='practical').map(i=>({code:i.question.rights_metadata.mock_code,title:i.question.rights_metadata.title,stem:i.question.stem}))
  const expired=active&&Date.now()>=Date.parse(current.started_at)+assessment.time_limit_minutes*60000
  return <main className="exam-hub mock-page"><header className="exam-header"><a className="exam-brand" href="/exam-hub"><span>D</span><b>DatalytIQs</b><small>Exam Competency Hub</small></a><nav aria-label="Mock navigation"><a href="/exam-hub">Exam Hub</a><a href="#sources">Source files</a><a href="#attempts">My attempts</a></nav><span className="account-chip">Signed in</span></header>
    <section className="mock-hero"><span className="exam-kicker">AVAILABLE ASSIGNMENT · CA35P</span><h1>{assessment.title}</h1><p>A 180-minute, 100-mark original decision case. Work from the supplied data, show your calculations and explain what the evidence supports.</p><div className="mock-facts"><span>20 source-based choices · 20 marks</span><span>Three required analyses · 60 marks</span><span>One specialisation · 20 marks</span><span>Pass mark {assessment.pass_mark}%</span></div></section>
    {query.state==='submitted'&&<p className="mock-notice" role="status">Submitted successfully. Short questions are scored; an assessor will mark your practical work.</p>}{query.state==='start-error'&&<p className="mock-notice error" role="alert">The assignment could not start. Check full programme access and your remaining attempts.</p>}
    <section className="mock-panel" id="sources"><h2>Controlled source files</h2><p>Download the CSVs and analyse them in Excel or your chosen spreadsheet tool. Check the period, units, denominators and missing data. Keep your calculations in your own workbook; enter the interpretation and workings below. Files are also available in each topic workspace.</p><div className="mock-files">{files.map(([label,href])=><a href={href} download key={href}>{label} <span>Download CSV ↓</span></a>)}</div></section>
    {!entitled?<section className="mock-panel"><h2>Full programme access required</h2><p>This assignment is included with an active CA35P full access grant. Your topic lessons and free practice remain available.</p><a className="exam-button primary" href="https://datalytiqsacademy.com/contact/?subject=Unlock%20CA35P%20Exam%20Competency%20Hub">Request full access</a></section>:active?<><section className="mock-panel"><h2>Attempt {current.attempt_no} · {expired?'Time expired':'In progress'}</h2><p>Started {new Date(current.started_at).toLocaleString('en-KE',{dateStyle:'medium',timeStyle:'short'})}. Drafts save to this account. Submission is final. After time runs out, submit saved work for marking.</p></section><MockWorkspace attemptId={current.id} deadline={new Date(Date.parse(current.started_at)+assessment.time_limit_minutes*60000).toISOString()} questions={questions} practicals={practicals} initial={answers}/></>:<section className="mock-panel"><h2>Start your assignment</h2><p>Have your source files ready before starting. The clock begins immediately, continues if you leave the page, and stops after 180 minutes. You have {Math.max(0,(assessment.max_attempts||2)-(attempts?.length||0))} of {assessment.max_attempts||2} attempts remaining.</p>{(attempts?.length||0)<(assessment.max_attempts||2)?<form action={startFullMock}><button className="exam-button primary" type="submit">Start 180-minute mock</button></form>:<p>Both attempts have been used. Review your results below.</p>}</section>}
    <section className="mock-panel" id="attempts"><h2>My attempts</h2>{attempts?.length?<div className="mock-attempts">{attempts.map(a=><article key={a.id}><strong>Attempt {a.attempt_no} · {a.status.replace('_',' ')}</strong><span>{new Date(a.started_at).toLocaleDateString('en-KE',{dateStyle:'medium'})}</span><span>{a.status==='graded'?`${a.score}/100 · ${a.passed?'Pass':'Further practice recommended'}`:a.status==='submitted'?`Short questions ${String((a.integrity_metadata as {mc_score?:number})?.mc_score??0)}/20 · practical review pending`:'Draft saved'}</span>{a.status==='graded'&&<p>{String((a.integrity_metadata as {reviewer_feedback?:string})?.reviewer_feedback||'')}</p>}{a.status==='in_progress'&&<a href={`/exam-hub/mock?attempt=${a.id}`}>Resume →</a>}</article>)}</div>:<p>No attempts yet. Your submitted work and feedback will appear here.</p>}</section>
    <p className="mock-foot"><a href="/exam-hub">← Back to Exam Hub</a> · This is an original practice assignment; confirm current examination rules with KASNEB.</p>
  </main>
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '../../../../../lib/supabase/admin'
import '../../../exam-hub.css'

const normalise=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')

export async function generateMetadata({params}:{params:Promise<{body:string;qualification:string;paper:string}>}):Promise<Metadata>{
  const {paper}=await params
  return {title:`${paper.toUpperCase()} Exam Preparation | DatalytIQs`,description:'Structured professional examination preparation, practice and readiness tracking from DatalytIQs.'}
}

export default async function ProfessionalPaperPage({params}:{params:Promise<{body:string;qualification:string;paper:string}>}){
  const {body,qualification,paper}=await params
  const admin=createAdminClient()
  const {data:programme}=await admin.from('exam_programmes')
    .select('id,code,title,description,status,metadata,exam_bodies!inner(code,name,website_url)')
    .ilike('code',paper).maybeSingle()
  if(!programme) notFound()
  const examBody=Array.isArray(programme.exam_bodies)?programme.exam_bodies[0]:programme.exam_bodies as any
  const meta=(programme.metadata||{}) as Record<string,any>
  if(normalise(examBody?.code||'')!==body||normalise(String(meta.qualification||''))!==qualification) notFound()
  const {data:syllabus}=await admin.from('exam_syllabus_versions').select('id,version_label,effective_from,source_url,status').eq('programme_id',programme.id).order('effective_from',{ascending:false}).limit(1).maybeSingle()
  const {data:topics}=syllabus?await admin.from('exam_topics').select('id,code,title,description,sequence_no').eq('syllabus_version_id',syllabus.id).eq('active',true).order('sequence_no'):{data:[]}
  const verified=meta.verification_status==='verified'
  const implementation=String(meta.implementation_status||'PLANNED').replaceAll('_',' ')
  const officialStructure=verified?String(meta.exam_structure||'See official source'):'Official examination structure verification pending.'

  return <main className="exam-hub">
    <header className="exam-header"><a className="exam-brand" href="/exam-hub"><span>D</span><b>DatalytIQs</b><small>Professional Exam Hub</small></a><nav><a href="/exam-hub">Catalogue</a><a href="#syllabus">Syllabus</a><a href="#study-path">Study Path</a><a href="/">Analytics Lab</a></nav></header>
    <section className="topic-hero"><div><a href="/exam-hub">← Professional catalogue</a><span className="exam-kicker">{examBody?.code} · {meta.qualification||'PROFESSIONAL EXAM'}</span><h1>{programme.code} — {programme.title}</h1><p>{programme.description||'Structured professional examination preparation pathway.'}</p></div><aside><span>IMPLEMENTATION STATUS</span><b>{implementation}</b><small>{verified?'Official paper identity verified':'Verification in progress'}</small></aside></section>

    <section className="exam-status">
      <article><span>PAPER</span><b>{programme.code}</b><small>{programme.title}</small></article>
      <article><span>LEVEL</span><b>{meta.level||'Pending'}</b><small>Official verification status: {verified?'verified':'pending'}</small></article>
      <article><span>ASSESSMENT</span><b>{meta.assessment_mode||'Pending'}</b><small>{officialStructure}</small></article>
      <article><span>TOOLS</span><b>{Array.isArray(meta.tools)&&meta.tools.length?meta.tools.join(' · '):'Pending'}</b><small>Only verified requirements are labelled official.</small></article>
    </section>

    <section className="exam-section" id="syllabus"><div className="exam-section-head"><div><span className="exam-kicker">SYLLABUS</span><h2>{syllabus?.version_label||'Pending official verification'}</h2></div><p>{syllabus?.status==='published'?'Published preparation syllabus mapping.':'Official syllabus detail has not yet been activated in DatalytIQs.'}</p></div>
      {topics?.length?<div className="topic-list">{topics.map((t:any)=><article className="topic-card" key={t.id}><div className="topic-number">{String(t.sequence_no).padStart(2,'0')}</div><div className="topic-content"><h3>{t.code} · {t.title}</h3><p>{t.description}</p></div></article>)}</div>:<div className="exam-notice">Official examination structure verification pending. No syllabus topics have been fabricated.</div>}
    </section>

    <section className="assessment-band" id="study-path"><div className="exam-section-head inverse"><div><span className="exam-kicker">PREPARATION PATH</span><h2>Learn → Practise → Demonstrate → Review</h2></div><p>This paper uses the shared Exam Hub architecture; capabilities activate only as verified content and assessments become available.</p></div><div className="assessment-grid">
      <article><span>THEORY</span><h3>Academy Course</h3><p>{meta.academy_course_id?'Linked to the Academy preparation course.':'Course mapping pending; no duplicate course has been created.'}</p></article>
      <article><span>PRACTICE</span><h3>Exam Workspace</h3><p>{meta.practical_workspace?'Practical workspace available.':'Practice architecture reserved; substantive activities are still in development.'}</p></article>
      <article><span>ASSESSMENT</span><h3>Mocks & Readiness</h3><p>{meta.mock_available?'Mock assessment available.':'Mocks and readiness remain unavailable until question-bank and evidence gates are satisfied.'}</p></article>
    </div></section>

    <section className="unlock-panel"><div><span className="exam-kicker">STATUS CONTROL</span><h2>{implementation}</h2><p>Catalogue inclusion is not a claim of official endorsement or production readiness. DatalytIQs is an independent professional learning and examination-preparation platform.</p></div>{programme.code==='CA35P'?<a className="exam-button primary" href="/exam-hub/ca35p">Open full CA35P workspace</a>:<a className="exam-button primary" href="/exam-hub">Back to catalogue</a>}</section>
  </main>
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '../../../../lib/supabase/admin'
import '../../exam-hub.css'

const slugify=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')

export async function generateMetadata({params}:{params:Promise<{provider:string}>}):Promise<Metadata>{
  const {provider}=await params
  return {title:`${provider.toUpperCase()} Exam Preparation | DatalytIQs Exam Hub`,description:'Independent professional examination and certification preparation from DatalytIQs.'}
}

export default async function ProviderPage({params}:{params:Promise<{provider:string}>}){
  const {provider}=await params
  const admin=createAdminClient()
  const {data:bodies}=await admin.from('exam_bodies').select('id,code,name,website_url').eq('active',true)
  const body=(bodies||[]).find((x:any)=>slugify(x.code)===provider||slugify(x.name)===provider)
  if(!body) notFound()
  const {data:programmes}=await admin.from('exam_programmes').select('id,code,title,description,status,metadata').eq('exam_body_id',body.id).order('code')
  const active=(programmes||[]).filter((x:any)=>x.status==='published')
  const coming=(programmes||[]).filter((x:any)=>x.status!=='published')
  return <main className="exam-hub">
    <header className="exam-header"><a className="exam-brand" href="/exam-hub"><span>D</span><b>DatalytIQs</b><small>Professional Exam Hub</small></a><nav><a href="/exam-hub">Catalogue</a><a href="/">Analytics Lab</a></nav></header>
    <section className="topic-hero"><div><a href="/exam-hub">← Exam Hub</a><span className="exam-kicker">EXAM PROVIDER</span><h1>{body.name}</h1><p>Independent DatalytIQs preparation pathways mapped to verified current requirements where verification is complete.</p></div><aside><span>PATHWAYS</span><b>{programmes?.length||0}</b><small>{active.length} active · {coming.length} in development</small></aside></section>
    <section className="exam-section"><div className="exam-section-head"><div><span className="exam-kicker">QUALIFICATIONS & EXAMS</span><h2>Preparation catalogue</h2></div><p>Catalogue presence does not imply production readiness. Each pathway carries its own verification and implementation state.</p></div>
      <div className="topic-list">{(programmes||[]).map((p:any)=>{const m=p.metadata||{}; const qualification=String(m.qualification||'Qualification pending'); const q=slugify(qualification); return <article className="topic-card" key={p.id}><div className="topic-number">{p.code}</div><div className="topic-content"><h3>{p.title}</h3><p>{p.description}</p><p><strong>{qualification}</strong> · {m.verification_status==='verified'?'Official requirements verified':'Pending official verification'} · {String(m.implementation_status||p.status).replaceAll('_',' ')}</p>{m.verification_status==='verified'?<a className="exam-button primary" href={`/exam-hub/papers/${slugify(body.code)}/${q}/${p.code.toLowerCase()}`}>Open pathway</a>:null}</div></article>})}</div>
    </section>
    <section className="exam-section"><div className="exam-notice">DatalytIQs is an independent learning and examination-preparation platform. Qualification names, examination names, certification marks and trademarks belong to their respective owners. Unless explicitly stated, DatalytIQs is not affiliated with or endorsed by the respective examining or certification bodies.</div></section>
  </main>
}

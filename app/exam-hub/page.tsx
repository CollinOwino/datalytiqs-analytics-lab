import type { Metadata } from 'next'
import { createAdminClient } from '../../lib/supabase/admin'
import './exam-hub.css'

export const metadata: Metadata = {
  title: 'Professional Exam Preparation | DatalytIQs Exam Hub',
  description: 'Professional examination preparation with structured study, practical analytics, mocks and measurable readiness.',
  alternates: { canonical: 'https://datalytiqs-analytics-lab.vercel.app/exam-hub' },
}

type Programme = {
  id:string; code:string; title:string; description:string|null; status:string; metadata:Record<string,any>;
  exam_bodies:{code:string;name:string}|Array<{code:string;name:string}>
}

const slug=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
const bodyOf=(p:Programme)=>Array.isArray(p.exam_bodies)?p.exam_bodies[0]:p.exam_bodies

export default async function ExamHubPage({searchParams}:{searchParams:Promise<{q?:string;body?:string;qualification?:string;status?:string}>}){
  const query=await searchParams
  const admin=createAdminClient()
  const {data,error}=await admin.from('exam_programmes')
    .select('id,code,title,description,status,metadata,exam_bodies!inner(code,name)')
    .order('code')
  if(error) throw new Error('The professional examination catalogue could not be loaded.')
  let programmes=(data||[]) as Programme[]
  const q=(query.q||'').trim().toLowerCase()
  if(q) programmes=programmes.filter(p=>[p.code,p.title,p.metadata?.qualification,bodyOf(p)?.name].some(v=>String(v||'').toLowerCase().includes(q)))
  if(query.body) programmes=programmes.filter(p=>bodyOf(p)?.code===query.body)
  if(query.qualification) programmes=programmes.filter(p=>p.metadata?.qualification===query.qualification)
  if(query.status) programmes=programmes.filter(p=>p.metadata?.implementation_status===query.status)
  const qualifications=[...new Set(((data||[]) as Programme[]).map(p=>String(p.metadata?.qualification||'')).filter(Boolean))].sort()
  const statuses=[...new Set(((data||[]) as Programme[]).map(p=>String(p.metadata?.implementation_status||'')).filter(Boolean))].sort()
  const bodies=[...new Map(((data||[]) as Programme[]).map(p=>[bodyOf(p)?.code,bodyOf(p)])).values()].filter(Boolean)

  return <main className="exam-hub">
    <header className="exam-header">
      <a className="exam-brand" href="/"><span>D</span><b>DatalytIQs</b><small>Professional Exam Hub</small></a>
      <nav aria-label="Exam Hub navigation"><a href="/exam-hub">Catalogue</a><a href="/exam-hub/ca35p">CA35P</a><a href="/">Analytics Lab</a><a href="https://datalytiqsacademy.com/">Academy</a></nav>
    </header>

    <section className="exam-hero" id="overview">
      <div><span className="exam-kicker">DATALYTIQS EXAM HUB</span><h1>Prepare. Practise. Analyse. <em>Pass with Evidence.</em></h1><p>Structured professional examination preparation combining theory, practical analytics, examination-style exercises, timed mocks and measurable readiness.</p><div className="exam-actions"><a className="exam-button primary" href="#catalogue">Explore professional papers</a><a className="exam-button outline" href="/exam-hub/ca35p">Open CA35P workspace</a></div></div>
      <aside aria-label="Catalogue facts"><div><b>{(data||[]).length}</b><span>catalogued papers</span></div><div><b>{bodies.length}</b><span>examining bodies</span></div><div><b>1</b><span>reference implementation</span></div><div><b>Evidence</b><span>readiness model</span></div></aside>
    </section>

    <section className="exam-section" id="catalogue">
      <div className="exam-section-head"><div><span className="exam-kicker">PROFESSIONAL EXAMINATION CATALOGUE</span><h2>Find a paper</h2></div><p>Catalogue presence does not mean a preparation pathway is complete. Each card shows its current implementation status.</p></div>
      <form method="get" className="study-plan-bar" aria-label="Filter professional papers">
        <label>Search<input name="q" defaultValue={query.q||''} placeholder="Search professional papers..." /></label>
        <label>Examining body<select name="body" defaultValue={query.body||''}><option value="">All</option>{bodies.map((b:any)=><option key={b.code} value={b.code}>{b.name}</option>)}</select></label>
        <label>Qualification<select name="qualification" defaultValue={query.qualification||''}><option value="">All</option>{qualifications.map(v=><option key={v} value={v}>{v}</option>)}</select></label>
        <label>Status<select name="status" defaultValue={query.status||''}><option value="">All</option>{statuses.map(v=><option key={v} value={v}>{v.replaceAll('_',' ')}</option>)}</select></label>
        <button type="submit">Apply filters</button>
      </form>

      <div className="competency-grid">
        {programmes.map(p=>{
          const body=bodyOf(p)
          const qualification=String(p.metadata?.qualification||'Professional examination')
          const implementation=String(p.metadata?.implementation_status||'PLANNED')
          const route=p.code==='CA35P'?'/exam-hub/ca35p':`/exam-hub/papers/${slug(body?.code||'body')}/${slug(qualification)}/${p.code.toLowerCase()}`
          return <article key={p.id}>
            <span>{body?.code} · {qualification}</span>
            <h3>{p.code} — {p.title}</h3>
            <p>{p.description||'Structured examination preparation pathway.'}</p>
            <p><b>{implementation.replaceAll('_',' ')}</b> · {String(p.metadata?.assessment_mode||'Assessment format pending official verification')}</p>
            <a href={route}>{p.code==='CA35P'?'Continue Preparation':'Explore Paper'} →</a>
          </article>
        })}
      </div>
      {!programmes.length&&<div className="exam-notice">No papers match the current filters.</div>}
    </section>

    <section className="unlock-panel"><div><span className="exam-kicker">INDEPENDENT PREPARATION PLATFORM</span><h2>Official requirements remain authoritative</h2><p>DatalytIQs is an independent professional learning and examination-preparation platform. Examination trademarks and qualification names belong to their respective owners.</p></div><a className="exam-button primary" href="/exam-hub/ca35p">Open reference implementation</a></section>
    <footer><span>DatalytIQs Academy · Professional Exam Hub</span><a href="https://datalytiqsacademy.com/">Academy</a><a href="https://community.datalytiqsacademy.com/">Community</a><a href="/">Analytics Lab</a></footer>
  </main>
}

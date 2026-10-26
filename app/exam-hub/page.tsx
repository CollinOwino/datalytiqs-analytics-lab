import type { Metadata } from 'next'
import { createAdminClient } from '../../lib/supabase/admin'
import './exam-hub.css'

export const metadata: Metadata = {
  title: 'Professional Exam Preparation | DatalytIQs Exam Hub',
  description: 'Evidence-led preparation for KASNEB, KNEC, Cambridge International, Pearson Edexcel and professional certification examinations.',
  alternates: { canonical: 'https://datalytiqs-analytics-lab.vercel.app/exam-hub' },
}

type ExamBody={code:string;name:string}
type Programme = {
  id:string; code:string; title:string; description:string|null; status:string; metadata:Record<string,any>;
  exam_bodies:ExamBody|ExamBody[]
}

const slug=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
const bodyOf=(p:Programme)=>Array.isArray(p.exam_bodies)?p.exam_bodies[0]:p.exam_bodies
const statusView=(value:string)=>{
 const key=value.toUpperCase()
 if(key==='PRODUCTION_READY_REFERENCE')return{label:'Ready now',tone:'ready',description:'Complete reference preparation workspace'}
 if(key==='PRACTICAL_MAPPED_DRAFT')return{label:'Practical pilot',tone:'pilot',description:'Mapped practical work; assessment build continues'}
 if(key==='CONTENT_DEVELOPMENT')return{label:'In development',tone:'building',description:'Preparation content is being developed'}
 if(key==='CATALOGUED_PLANNED')return{label:'Planned',tone:'planned',description:'Paper identity verified; syllabus mapping pending'}
 return{label:'Verification underway',tone:'verification',description:'Official structure is still being verified'}
}

export default async function ExamHubPage({searchParams}:{searchParams:Promise<{q?:string;body?:string;qualification?:string;status?:string}>}){
 const query=await searchParams
 const admin=createAdminClient()
 const{data,error}=await admin.from('exam_programmes')
  .select('id,code,title,description,status,metadata,exam_bodies!inner(code,name)')
  .order('code')
 if(error)throw new Error('The professional examination catalogue could not be loaded.')
 const all=(data||[]) as Programme[]
 let programmes=[...all]
 const q=(query.q||'').trim().toLowerCase()
 if(q)programmes=programmes.filter(p=>[p.code,p.title,p.metadata?.qualification,bodyOf(p)?.name].some(v=>String(v||'').toLowerCase().includes(q)))
 if(query.body)programmes=programmes.filter(p=>bodyOf(p)?.code===query.body)
 if(query.qualification)programmes=programmes.filter(p=>p.metadata?.qualification===query.qualification)
 if(query.status)programmes=programmes.filter(p=>p.metadata?.implementation_status===query.status)
 const qualifications=[...new Set(all.map(p=>String(p.metadata?.qualification||'')).filter(Boolean))].sort()
 const statuses=[...new Set(all.map(p=>String(p.metadata?.implementation_status||'')).filter(Boolean))].sort()
 const bodies=[...new Map(all.map(p=>[bodyOf(p)?.code,bodyOf(p)])).values()].filter(Boolean) as ExamBody[]
 const bodyCounts=new Map(bodies.map(b=>[b.code,all.filter(p=>bodyOf(p)?.code===b.code).length]))
 const grouped=bodies.map(body=>({body,papers:programmes.filter(p=>bodyOf(p)?.code===body.code)})).filter(group=>group.papers.length)
 const readyCount=all.filter(p=>p.metadata?.implementation_status==='PRODUCTION_READY_REFERENCE').length
 const activeFilterCount=[q,query.body,query.qualification,query.status].filter(Boolean).length

 return <main className="exam-hub">
  <a className="exam-skip" href="#catalogue">Skip to examination catalogue</a>
  <header className="exam-header">
   <a className="exam-brand" href="/"><span>D</span><b>DatalytIQs</b><small>Professional Exam Hub</small></a>
   <nav aria-label="Exam Hub navigation"><a href="/">Analytics Lab</a><a className="nav-cta" href="https://datalytiqsacademy.com/academy/">Academy</a></nav>
  </header>

  <section className="exam-hero" id="overview">
   <div><span className="exam-kicker">DATALYTIQS EXAM HUB</span><h1>Find your paper. Know its status. <em>Prepare with evidence.</em></h1><p>One catalogue for professional and secondary examination pathways, with transparent readiness labels and direct access to official requirements.</p><div className="exam-actions"><a className="exam-button primary" href="#bodies">Choose an examining body</a><a className="exam-button outline" href="/exam-hub/ca35p">Open ready workspace</a></div></div>
   <aside aria-label="Catalogue facts"><div><b>{all.length}</b><span>catalogued papers</span></div><div><b>{bodies.length}</b><span>examining bodies</span></div><div><b>{readyCount}</b><span>ready workspace</span></div><div><b>Verified</b><span>paper identities</span></div></aside>
  </section>

  <section className="exam-body-directory" id="bodies" aria-labelledby="bodies-title">
   <div className="exam-section-head"><div><span className="exam-kicker">EXAMINING BODIES</span><h2 id="bodies-title">Choose your route</h2></div><p>Browse the subjects most closely aligned with analytics, computing, mathematics, economics, business and accounting.</p></div>
   <div className="exam-body-grid">{bodies.map(body=><a key={body.code} href={`?body=${body.code}#catalogue`} className={query.body===body.code?'active':undefined} aria-current={query.body===body.code?'true':undefined}><span>{body.code}</span><b>{body.name}</b><small>{bodyCounts.get(body.code)} paper{bodyCounts.get(body.code)===1?'':'s'}</small><em>View papers →</em></a>)}</div>
  </section>

  <section className="readiness-guide" id="readiness" aria-labelledby="readiness-title">
   <div><span className="exam-kicker">READINESS GUIDE</span><h2 id="readiness-title">Know what each status means</h2></div>
   <ul><li className="ready"><b>Ready now</b><span>Structured learning, practice and assessment workspace available.</span></li><li className="pilot"><b>Practical pilot</b><span>Mapped activities are available while assessment development continues.</span></li><li className="building"><b>In development</b><span>Content is being built against verified requirements.</span></li><li className="planned"><b>Planned</b><span>Paper identity is verified; full syllabus mapping is not yet complete.</span></li></ul>
  </section>

  <section className="exam-section" id="catalogue">
   <div className="exam-section-head"><div><span className="exam-kicker">EXAMINATION CATALOGUE</span><h2>Find a paper</h2><p className="result-count" aria-live="polite">{programmes.length} of {all.length} papers shown{activeFilterCount?` · ${activeFilterCount} filter${activeFilterCount===1?'':'s'} active`:''}</p></div><p>Catalogue presence does not imply a completed preparation course. Readiness is stated on every card.</p></div>
   <form method="get" className="study-plan-bar" aria-label="Filter examination papers">
    <label>Search<input name="q" defaultValue={query.q||''} placeholder="Code, paper or qualification" /></label>
    <label>Examining body<select name="body" defaultValue={query.body||''}><option value="">All bodies</option>{bodies.map(body=><option key={body.code} value={body.code}>{body.name}</option>)}</select></label>
    <label>Qualification<select name="qualification" defaultValue={query.qualification||''}><option value="">All qualifications</option>{qualifications.map(value=><option key={value} value={value}>{value}</option>)}</select></label>
    <label>Readiness<select name="status" defaultValue={query.status||''}><option value="">All statuses</option>{statuses.map(value=><option key={value} value={value}>{statusView(value).label}</option>)}</select></label>
    <button type="submit">Apply filters</button>
    {activeFilterCount>0&&<a className="clear-filters" href="/exam-hub#catalogue">Clear filters</a>}
   </form>

   <div className="exam-body-results">
   {grouped.map((group,index)=><details className="exam-body-group" key={group.body.code} open={Boolean(query.body)||index===0}>
    <summary><span><b>{group.body.code}</b>{group.body.name}</span><em>{group.papers.length} paper{group.papers.length===1?'':'s'}</em></summary>
    <div className="competency-grid">{group.papers.map(p=>{
     const body=bodyOf(p)
     const qualification=String(p.metadata?.qualification||'Professional examination')
     const implementation=String(p.metadata?.implementation_status||'SYLLABUS_VERIFICATION_PENDING')
     const view=statusView(implementation)
     const route=p.code==='CA35P'?'/exam-hub/ca35p':`/exam-hub/papers/${slug(body?.code||'body')}/${slug(qualification)}/${p.code.toLowerCase()}`
     const official=String(p.metadata?.official_source_url||p.metadata?.official_source||'')
     const verified=['verified','paper_identity_verified'].includes(String(p.metadata?.verification_status||''))
     return <article key={p.id} className={`paper-card status-${view.tone}`} aria-labelledby={`paper-${p.id}`}>
      <div className="paper-card-top"><span>{body?.code}</span><strong className={`status-badge ${view.tone}`}>{view.label}</strong></div>
      <small>{qualification}</small>
      <h3 id={`paper-${p.id}`}>{p.code} — {p.title}</h3>
      <p>{p.description||'Structured examination preparation pathway.'}</p>
      <ul className="paper-facts"><li>{String(p.metadata?.assessment_mode||'Assessment structure pending verification')}</li><li>{verified?'Official paper identity verified':'Verification in progress'}</li></ul>
      <p className="readiness-note"><b>{view.description}</b></p>
      <div className="paper-actions"><a className="paper-primary" href={route}>{view.tone==='ready'?'Start preparation':'View pathway'} →</a>{official&&<a href={official}>Official source ↗</a>}</div>
     </article>
    })}</div>
   </details>)}
   </div>
   {!programmes.length&&<div className="exam-notice"><h3>No matching papers</h3><p>Remove one or more filters, or search using a paper code such as CA35P, 0478 or 4CP0.</p><a href="/exam-hub#catalogue">Reset catalogue</a></div>}
  </section>

  <section className="unlock-panel"><div><span className="exam-kicker">INDEPENDENT PREPARATION PLATFORM</span><h2>Official requirements remain authoritative</h2><p>DatalytIQs independently organises preparation pathways. Examination-body names and qualification titles identify the applicable official requirements and do not imply endorsement.</p></div><a className="exam-button primary" href="/exam-hub/ca35p">Open ready reference</a></section>
  <footer><span>DatalytIQs Academy · Professional Exam Hub</span><a href="https://datalytiqsacademy.com/academy/">Academy</a><a href="https://community.datalytiqsacademy.com/">Community</a><a href="/">Analytics Lab</a></footer>
 </main>
}

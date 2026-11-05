import {createClient} from '../lib/supabase/server'

const navigation = [
  ['Home','/'],['Evidence Lab','/evidence-lab'],['Playgrounds','/playgrounds'],['Analytics Workspace','/python-editor'],['Exam Hub','/exam-hub'],['Applied Pathways','/#pathways'],['Executive','/executive'],
]
const primaryActions = [
 {eyebrow:'GUIDED PYTHON PROJECTS',title:'Enter the Evidence Lab',description:'Work through a Jupyter-style project with 16 guided activities, isolated Python execution and a reviewable evidence pack.',href:'/evidence-lab',cta:'Open Evidence Lab'},
 {eyebrow:'PROFESSIONAL EXAMS',title:'Prepare in Exam Hub',description:'Move from theory to quizzes, assignments, practicals, timed mocks, readiness evidence and targeted remediation.',href:'/exam-hub',cta:'Enter Exam Hub'},
 {eyebrow:'STRUCTURED PATHWAYS',title:'Continue a pathway',description:'Resume MERL, data science, Python foundations or another applied pathway without browsing the full catalogue.',href:'#pathways',cta:'View pathways'},
]
const pathways = [
 ['Kenya Housing Modelling','Progressive regression, held-out validation and a professional valuation evidence pack.','/playgrounds/pathway?dataset=housing'],
 ['Concrete Strength · PyTorch','A bounded neural-network regression project with model-risk controls.','/playgrounds/pathway?dataset=concrete'],
 ['Crop Disease · Computer Vision','A privacy-safe CNN pathway with class-level diagnostics and field-validation planning.','/playgrounds/pathway?dataset=cropvision'],
 ['Evidence Lab','Jupyter-style guided projects with code, outputs and evidence.','/evidence-lab'],
 ['Playgrounds','Independent Python investigations with autosaved notebooks.','/playgrounds'],
 ['MERL','Monitoring, evaluation, research and learning with evidence gates.','/merl/foundations'],
 ['Data Science','Applied analytical practice from foundations to advanced work.','/data-science'],
 ['Python for Kids','Safeguarded coding foundations and guided practical progression.','/python-for-kids'],
 ['Case 001','Secondary-school performance analytics and evidence-based management.','/cases/001'],
 ['Field Data','Questionnaire, collection, cleaning, analysis and reporting practicals.','/practicals/dtq-101'],
 ['Executive','Organisational KPIs, evidence, scenarios and decision intelligence.','/executive'],
]
export default async function Home() {
 const supabase=await createClient()
 const{data:{user}}=await supabase.auth.getUser()
 let workspace={label:'Learner',detail:'Applied workspace',initial:'L',aria:'Learner workspace'}
 if(user){
  const{data:membership}=await supabase.from('ceo_memberships').select('role,ceo_organisations(premium_status,premium_expires_at)').eq('user_id',user.id).eq('active',true).maybeSingle()
  const organisation=Array.isArray(membership?.ceo_organisations)?membership.ceo_organisations[0]:membership?.ceo_organisations
  const entitlementValid=organisation&&['trial','active'].includes(organisation.premium_status)&&(!organisation.premium_expires_at||new Date(organisation.premium_expires_at).getTime()>=Date.now())
  if(entitlementValid)workspace={label:'Executive',detail:'CEO Intelligence workspace',initial:'E',aria:'Executive workspace'}
 }
 return <main className="app-shell">
  <a className="skip-link" href="#main-content">Skip to Analytics Lab</a>
  <aside className="sidebar" aria-label="Analytics Lab navigation"><div className="brand"><div className="brand-mark" aria-hidden="true">D</div><div><strong>DatalytIQs</strong><span>Analytics Lab</span></div></div><nav aria-label="Primary navigation">{navigation.map(([label,href])=><a aria-current={href==='/'?'page':undefined} className={href==='/'?'active':''} href={href} key={label}>{label}</a>)}</nav><div className="sidebar-footer"><small>THE DATALYTIQS METHOD</small><p>Problem → Data → Analysis → Evidence → Decision</p><a href="https://datalytiqsacademy.com/academy/">Academy ↗</a><a href="https://community.datalytiqsacademy.com">Community ↗</a><a href="https://datalytiqsacademy.com/dashboard/">Learner Dashboard ↗</a></div></aside>
  <section className="content" id="main-content">
   <header className="topbar"><div><span className="eyebrow">DATALYTIQS ECOSYSTEM</span><h1>Analytics Lab</h1></div>{user?<div className="user" aria-label={workspace.aria}><span className="status" aria-hidden="true"/><div><strong>{workspace.label}</strong><small>{workspace.detail}</small></div><div className="avatar" aria-hidden="true">{workspace.initial}</div></div>:<a className="button primary" href="/login">Sign in or create account</a>}</header>
   <section className="hero lab-home-hero" aria-labelledby="hero-title"><div><span className="eyebrow gold">PRACTISE · APPLY · PROVE</span><h2 id="hero-title">Turn learning into<br/><em>demonstrable capability.</em></h2><p>Work through guided analytics and AI projects, run reproducible practicals and assemble evidence portfolios that show how you reason—not merely what you watched.</p><div className="actions"><a className="button primary" href="/playgrounds?tab=datasets">Explore practical pathways</a><a className="button secondary" href="/login">Create learner account</a></div></div><div className="hero-model" aria-label="DatalytIQs capability flow"><span>CAPABILITY FLOW</span><b>Learn</b><i aria-hidden="true">↓</i><b>Practise</b><i aria-hidden="true">↓</i><b>Apply</b><i aria-hidden="true">↓</i><b>Evidence</b><i aria-hidden="true">↓</i><b>Advance</b></div></section>
   <section className="home-trust" aria-label="Learning safeguards"><article><span>ORIGINAL WORK</span><strong>Purpose-built projects</strong><small>Original teaching datasets and scenarios with transparent provenance.</small></article><article><span>CONTROLLED PRACTICE</span><strong>Bounded execution</strong><small>Authenticated projects, fixed limits and no learner-controlled network access.</small></article><article><span>VISIBLE PROGRESS</span><strong>Five evidence stages</strong><small>Lessons, notebooks, independent labs, mastery checks and portfolios.</small></article><article><span>RESPONSIBLE AI</span><strong>Human review retained</strong><small>Model cards, limitations and prohibited-use boundaries are built into assessment.</small></article></section>
   <section className="lab-start" id="start" aria-labelledby="start-title"><div className="section-title"><div><span className="eyebrow">START HERE</span><h3 id="start-title">What do you need to do?</h3></div><p>Go directly to the work that matters now.</p></div><div className="lab-primary-grid">{primaryActions.map(x=><article key={x.title}><span className="eyebrow">{x.eyebrow}</span><h3>{x.title}</h3><p>{x.description}</p><a className="button primary" href={x.href}>{x.cta} <span aria-hidden="true">→</span></a></article>)}</div></section>
   <section className="lab-pathways" id="pathways" aria-labelledby="pathways-title"><div className="section-title"><div><span className="eyebrow">PATHWAY DIRECTORY</span><h3 id="pathways-title">Choose an applied pathway</h3></div><p>Preview the learning design freely. Sign in when you are ready to save checkpoints and run practical work.</p></div><div className="lab-pathway-grid">{pathways.map(([title,description,href])=><a href={href} key={title}><strong>{title}</strong><span>{description}</span><b aria-hidden="true">→</b></a>)}</div></section>
   <section className="lab-handoff" aria-label="DatalytIQs ecosystem handoff"><div><span className="eyebrow gold">ONE LEARNER JOURNEY</span><h3>Ready to move from browsing to evidence?</h3><p>Create a learner account to retain checkpoints and notebook work. Use the Institute for structured theory, Community for collaboration and your learner dashboard for course progress.</p><div className="actions"><a className="button primary" href="/login">Start a learner account</a></div></div><div className="lab-handoff-links"><a href="https://datalytiqsacademy.com/courses/">DatalytIQs Institute <span>Structured learning ↗</span></a><a href="https://community.datalytiqsacademy.com">Community <span>Peer & facilitator collaboration ↗</span></a><a href="https://datalytiqsacademy.com/dashboard/">Learner Dashboard <span>Courses & progress ↗</span></a></div></section>
  </section>
 </main>
}

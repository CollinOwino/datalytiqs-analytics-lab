const navigation = [
  ['Home','/'],['Learn','https://datalytiqsacademy.com/courses/'],['Practise','/python-editor'],['Exam Hub','/exam-hub'],['MERL','/merl/foundations'],['Executive','/ceo'],
]
const primaryActions = [
 {eyebrow:'APPLIED ANALYTICS',title:'Practise in the Lab',description:'Work with datasets, code, analytical cases and practical activities that produce reviewable competency evidence.',href:'/python-editor',cta:'Open practice workspace'},
 {eyebrow:'PROFESSIONAL EXAMS',title:'Prepare in Exam Hub',description:'Move from theory to quizzes, assignments, practicals, timed mocks, readiness evidence and targeted remediation.',href:'/exam-hub',cta:'Enter Exam Hub'},
 {eyebrow:'STRUCTURED PATHWAYS',title:'Continue a pathway',description:'Resume MERL, data science, Python foundations or another applied pathway without browsing the full catalogue.',href:'#pathways',cta:'View pathways'},
]
const pathways = [
 ['MERL','Monitoring, evaluation, research and learning with evidence gates.','/merl/foundations'],
 ['Data Science','Applied analytical practice from foundations to advanced work.','/data-science'],
 ['Python for Kids','Safeguarded coding foundations and guided practical progression.','/python-for-kids'],
 ['Case 001','Secondary-school performance analytics and evidence-based management.','/cases/001'],
 ['Field Data','Questionnaire, collection, cleaning, analysis and reporting practicals.','/practicals/dtq-101'],
 ['Executive','Organisational KPIs, evidence, scenarios and decision intelligence.','/ceo'],
]
export default function Home() {
 return <main className="app-shell">
  <a className="skip-link" href="#main-content">Skip to Analytics Lab</a>
  <aside className="sidebar" aria-label="Analytics Lab navigation"><div className="brand"><div className="brand-mark" aria-hidden="true">D</div><div><strong>DatalytIQs</strong><span>Analytics Lab</span></div></div><nav aria-label="Primary navigation">{navigation.map(([label,href])=><a aria-current={href==='/'?'page':undefined} className={href==='/'?'active':''} href={href} key={label}>{label}</a>)}</nav><div className="sidebar-footer"><small>THE DATALYTIQS METHOD</small><p>Problem → Data → Analysis → Evidence → Decision</p><a href="https://community.datalytiqsacademy.com">Community ↗</a></div></aside>
  <section className="content" id="main-content">
   <header className="topbar"><div><span className="eyebrow">DATALYTIQS ECOSYSTEM</span><h1>Analytics Lab</h1></div><div className="user" aria-label="Learner workspace"><span className="status" aria-hidden="true"/><div><strong>Learner</strong><small>Applied workspace</small></div><div className="avatar" aria-hidden="true">L</div></div></header>
   <section className="hero lab-home-hero" aria-labelledby="hero-title"><div><span className="eyebrow gold">PRACTISE · APPLY · PROVE</span><h2 id="hero-title">Turn learning into<br/><em>demonstrable capability.</em></h2><p>The practical layer of DatalytIQs. Choose a workspace, complete applied analytical work and build evidence of what you can do.</p><div className="actions"><a className="button primary" href="#start">Choose a workspace</a><a className="button secondary" href="https://datalytiqsacademy.com/dashboard/">Return to learner dashboard</a></div></div><div className="hero-model" aria-label="DatalytIQs capability flow"><span>CAPABILITY FLOW</span><b>Learn</b><i aria-hidden="true">↓</i><b>Practise</b><i aria-hidden="true">↓</i><b>Apply</b><i aria-hidden="true">↓</i><b>Evidence</b><i aria-hidden="true">↓</i><b>Advance</b></div></section>
   <section className="lab-start" id="start" aria-labelledby="start-title"><div className="section-title"><div><span className="eyebrow">START HERE</span><h3 id="start-title">What do you need to do?</h3></div><p>Go directly to the work that matters now.</p></div><div className="lab-primary-grid">{primaryActions.map(x=><article key={x.title}><span className="eyebrow">{x.eyebrow}</span><h3>{x.title}</h3><p>{x.description}</p><a className="button primary" href={x.href}>{x.cta} <span aria-hidden="true">→</span></a></article>)}</div></section>
   <section className="lab-pathways" id="pathways" aria-labelledby="pathways-title"><div className="section-title"><div><span className="eyebrow">PATHWAY DIRECTORY</span><h3 id="pathways-title">Continue where you left off</h3></div><p>Open a focused workspace. Full course theory and enrolment remain in DatalytIQs Academy.</p></div><div className="lab-pathway-grid">{pathways.map(([title,description,href])=><a href={href} key={title}><strong>{title}</strong><span>{description}</span><b aria-hidden="true">→</b></a>)}</div></section>
   <section className="lab-handoff" aria-label="DatalytIQs ecosystem handoff"><div><span className="eyebrow gold">ONE LEARNER JOURNEY</span><h3>Need theory, collaboration or your learning record?</h3><p>The Lab is for applied work. Use Academy for structured theory, Community for collaboration and your learner dashboard for course progress and account activity.</p></div><div className="lab-handoff-links"><a href="https://datalytiqsacademy.com/courses/">Academy <span>Structured learning ↗</span></a><a href="https://community.datalytiqsacademy.com">Community <span>Peer & facilitator collaboration ↗</span></a><a href="https://datalytiqsacademy.com/dashboard/">Learner Dashboard <span>Courses & progress ↗</span></a></div></section>
  </section>
 </main>
}
import Link from 'next/link'

const programmes = [
  {
    eyebrow: 'PROFESSIONAL PATHWAY',
    title: 'Data Science',
    description: 'Progress from analytical foundations to reproducible modelling, machine-learning operations and a defensible professional portfolio.',
    meta: '3 levels · 10 modules · 30 guided lessons',
    href: '/data-science',
    action: 'Explore Data Science',
  },
  {
    eyebrow: 'PROFESSIONAL PATHWAY',
    title: 'MERL',
    description: 'Build practical competence in monitoring, evaluation, research and learning through evidence-gated modules and workplace-standard outputs.',
    meta: 'Foundations · Applied monitoring systems · Portfolio',
    href: '/merl/foundations',
    action: 'Explore MERL',
  },
  {
    eyebrow: 'PREMIUM ORGANISATION PROGRAMME',
    title: 'CEO Intelligence Workspace',
    description: 'Ingest organisational data, configure KPIs, interpret trends, test scenarios and convert evidence into protected strategic direction.',
    meta: 'Organisation-scoped · Premium access · Executive analytics',
    href: '/ceo',
    action: 'Open CEO Workspace',
  },
]

const stages = [
  ['01', 'Understand the Management Problem', 'Define the decision context, stakeholders and analytical questions.'],
  ['02', 'Inspect & Prepare the Dataset', 'Review variables, data types, missingness and analytical readiness.'],
  ['03', 'Conduct Descriptive Analysis', 'Summarise performance patterns with statistics, tables and visualisations.'],
  ['04', 'Investigate Performance Drivers', 'Examine relationships and factors associated with learner outcomes.'],
  ['05', 'Translate Findings into Insights', 'Connect statistical evidence to management implications and action.'],
  ['06', 'Prepare the Analytical Report', 'Consolidate evidence, limitations, recommendations and final submission.'],
]

const nav = [
  ['Dashboard', '/'],
  ['Programmes', '#programmes'],
  ['Case Studies', '/cases/001'],
  ['Analytics Workspace', '/data-explorer'],
]

export default function Home(){
  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">D</div><div><strong>DatalytIQs</strong><span>Analytics Lab</span></div></div>
      <nav>{nav.map(([label,href],i)=><a className={i===0?'active':''} href={href} key={label}>{label}</a>)}</nav>
      <div className="sidebar-footer"><small>LEARNING PHILOSOPHY</small><p>Management Problem → Data → Evidence → Decision</p><a href="https://community.datalytiqsacademy.com">Community ↗</a></div>
    </aside>
    <section className="content">
      <header className="topbar"><div><span className="eyebrow">DATALYTIQS ACADEMY</span><h1>Analytics Lab</h1></div><div className="user"><span className="status"></span><div><strong>Learner</strong><small>Student workspace</small></div><div className="avatar">L</div></div></header>
      <section className="hero"><div><span className="eyebrow gold">APPLIED ANALYTICS LEARNING ENVIRONMENT</span><h2>Turn data into <em>evidence.</em><br/>Turn evidence into decisions.</h2><p>Develop practical analytical competence through real datasets, reproducible analysis and decision-oriented programmes and case studies.</p><div className="actions"><a className="button primary" href="#programmes">Explore programmes</a><a className="button secondary" href="/cases/001">Open Case 001</a></div></div><div className="hero-model"><span>THE DATALYTIQS METHOD</span><b>Problem</b><i>↓</i><b>Data</b><i>↓</i><b>Analysis</b><i>↓</i><b>Evidence</b><i>↓</i><b>Decision</b></div></section>

      <section className="metrics"><article><span>ACTIVE CASE</span><strong>001</strong><small>Secondary School Performance</small></article><article><span>PROGRAMMES</span><strong>3</strong><small>Data Science · MERL · CEO Intelligence</small></article><article><span>LEARNING MODEL</span><strong className="text-status">Applied</strong><small>Evidence-gated progression</small></article><article><span>PROJECT STATUS</span><strong className="text-status">Ready</strong><small>Choose your next pathway</small></article></section>

      <section id="programmes" className="pathway" aria-labelledby="programmes-heading">
        <div className="section-title"><div><span className="eyebrow">DATALYTIQS PROGRAMMES</span><h3 id="programmes-heading">Choose your applied pathway</h3></div><p>Every programme connects learning or organisational data to evidence, decisions and accountable action.</p></div>
        <div className="stage-list">
          {programmes.map((p,i)=><article key={p.title}>
            <span className="stage-num">0{i+1}</span>
            <div><small className="eyebrow">{p.eyebrow}</small><h4>{p.title}</h4><p>{p.description}</p><small>{p.meta}</small></div>
            <span className="stage-state">AVAILABLE</span>
            <Link className="button primary" href={p.href}>{p.action} →</Link>
          </article>)}
        </div>
      </section>

      <section id="case001" className="case-card"><div className="case-head"><div><span className="case-number">CASE STUDY 001</span><h3>Secondary School Performance Analytics</h3><p>Evidence-Based Academic Management</p></div><span className="pill">FOUNDATION CASE</span></div><div className="case-grid"><div><h4>Management challenge</h4><p>A school leadership team needs defensible evidence about academic performance patterns and the factors associated with student outcomes so that interventions can be prioritised intelligently.</p></div><div><h4>Your analytical mission</h4><p>Transform the supplied school dataset into statistically sound findings, management insights and actionable recommendations.</p></div></div><div className="case-actions"><a className="button primary" href="/cases/001">Open Case Workspace →</a><span>Python · Excel/CSV · Statistical Analysis · Management Interpretation</span></div></section>

      <section id="stages" className="pathway"><div className="section-title"><div><span className="eyebrow">CASE 001 PATHWAY</span><h3>Your analytical workflow</h3></div><p>Complete each stage sequentially. Your work becomes part of the final analytical report.</p></div><div className="stage-list">{stages.map(([n,t,d])=><article key={n}><span className="stage-num">{n}</span><div><h4>{t}</h4><p>{d}</p></div><span className="stage-state">NOT STARTED</span><a href={`/cases/001#stage-${n}`}>→</a></article>)}</div></section>
    </section>
  </main>
}

const stages = [
  ['01', 'Understand the Management Problem', 'Define the decision context, stakeholders and analytical questions.'],
  ['02', 'Inspect & Prepare the Dataset', 'Review variables, data types, missingness and analytical readiness.'],
  ['03', 'Conduct Descriptive Analysis', 'Summarise performance patterns with statistics, tables and visualisations.'],
  ['04', 'Investigate Performance Drivers', 'Examine relationships and factors associated with learner outcomes.'],
  ['05', 'Translate Findings into Insights', 'Connect statistical evidence to management implications and action.'],
  ['06', 'Prepare the Analytical Report', 'Consolidate evidence, limitations, recommendations and final submission.']
]

const nav = ['Dashboard', 'Case Studies', 'Analytics Workspace', 'Datasets', 'Projects']

export default function Home() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">D</div>
          <div><strong>DatalytIQs</strong><span>Analytics Lab</span></div>
        </div>
        <nav>
          {nav.map((item, i) => <a className={i === 0 ? 'active' : ''} href="#" key={item}>{item}</a>)}
        </nav>
        <div className="sidebar-footer">
          <small>LEARNING PHILOSOPHY</small>
          <p>Management Problem → Data → Evidence → Decision</p>
          <a href="https://community.datalytiqsacademy.com">Community ↗</a>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div><span className="eyebrow">DATALYTIQS ACADEMY</span><h1>Analytics Lab</h1></div>
          <div className="user"><span className="status"></span><div><strong>Learner</strong><small>Student workspace</small></div><div className="avatar">L</div></div>
        </header>

        <section className="hero">
          <div>
            <span className="eyebrow gold">APPLIED ANALYTICS LEARNING ENVIRONMENT</span>
            <h2>Turn data into <em>evidence.</em><br/>Turn evidence into decisions.</h2>
            <p>Develop practical analytical competence through real datasets, reproducible analysis and decision-oriented case studies.</p>
            <div className="actions"><a className="button primary" href="#case001">Continue Case Study 001</a><a className="button secondary" href="#stages">View learning pathway</a></div>
          </div>
          <div className="hero-model"><span>THE DATALYTIQS METHOD</span><b>Problem</b><i>↓</i><b>Data</b><i>↓</i><b>Analysis</b><i>↓</i><b>Evidence</b><i>↓</i><b>Decision</b></div>
        </section>

        <section className="metrics">
          <article><span>ACTIVE CASE</span><strong>001</strong><small>Secondary School Performance</small></article>
          <article><span>PROGRESS</span><strong>0%</strong><small>6 analytical stages</small></article>
          <article><span>DATASETS</span><strong>1</strong><small>Ready for analysis</small></article>
          <article><span>PROJECT STATUS</span><strong className="text-status">Ready</strong><small>Begin analytical workflow</small></article>
        </section>

        <section id="case001" className="case-card">
          <div className="case-head"><div><span className="case-number">CASE STUDY 001</span><h3>Secondary School Performance Analytics</h3><p>Evidence-Based Academic Management</p></div><span className="pill">FOUNDATION CASE</span></div>
          <div className="case-grid">
            <div><h4>Management challenge</h4><p>A school leadership team needs defensible evidence about academic performance patterns and the factors associated with student outcomes so that interventions can be prioritised intelligently.</p></div>
            <div><h4>Your analytical mission</h4><p>Transform the supplied school dataset into statistically sound findings, management insights and actionable recommendations.</p></div>
          </div>
          <div className="case-actions"><button>Open Case Workspace →</button><span>Python · Excel/CSV · Statistical Analysis · Management Interpretation</span></div>
        </section>

        <section id="stages" className="pathway">
          <div className="section-title"><div><span className="eyebrow">CASE 001 PATHWAY</span><h3>Your analytical workflow</h3></div><p>Complete each stage sequentially. Your work becomes part of the final analytical report.</p></div>
          <div className="stage-list">
            {stages.map(([n,t,d]) => <article key={n}><span className="stage-num">{n}</span><div><h4>{t}</h4><p>{d}</p></div><span className="stage-state">NOT STARTED</span><button aria-label={`Open ${t}`}>→</button></article>)}
          </div>
        </section>
      </section>
    </main>
  )
}

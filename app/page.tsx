const stages = [
  ['01', 'Understand the Management Problem', 'Define the decision context, stakeholders and analytical questions.'],
  ['02', 'Inspect & Prepare the Dataset', 'Review variables, data types, missingness and analytical readiness.'],
  ['03', 'Conduct Descriptive Analysis', 'Summarise performance patterns with statistics, tables and visualisations.'],
  ['04', 'Investigate Performance Drivers', 'Examine relationships and factors associated with learner outcomes.'],
  ['05', 'Translate Findings into Insights', 'Connect statistical evidence to management implications and action.'],
  ['06', 'Prepare the Analytical Report', 'Consolidate evidence, limitations, recommendations and final submission.'],
]

const academyCatalogueUrl = 'https://datalytiqsacademy.com/courses/'

const navigation = [
  ['Home', '/'],
  ['Learn', 'https://datalytiqsacademy.com/courses/'],
  ['Practise', '/python-editor'],
  ['Exam Hub', '/exam-hub'],
  ['MERL', '/merl/foundations'],
  ['Executive', '/ceo'],
]

const ecosystem = [
  ['LEARN', 'DatalytIQs Academy', 'Structured theory, courses and professional pathways.', 'https://datalytiqsacademy.com/courses/'],
  ['PRACTISE', 'Analytics Lab', 'Applied datasets, coding, cases and competency evidence.', '#environments'],
  ['COLLABORATE', 'DatalytIQs Community', 'Peer learning, facilitator interaction and professional exchange.', 'https://community.datalytiqsacademy.com'],
  ['APPLY', 'Executive & Professional Services', 'Turn organisational evidence into decisions, action and performance.', '/ceo'],
]

const environments = [
  { eyebrow: 'FREE FOUNDATIONS', title: 'Python for Kids: Code, Create & Solve', description: 'Safeguarded coding practice for ages 10–16. Complete Modules 1–3 free with private progress and competency evidence.', href: '/python-for-kids', cta: 'Start Python foundations' },
  { eyebrow: 'EXAM COMPETENCY HUB', title: 'KASNEB CA35P Business Data Analytics', description: 'Syllabus-led preparation, practical-paper readiness, progress tracking and gated assessment access.', href: '/exam-hub', cta: 'Open CA35P hub' },
  { eyebrow: 'FOUNDATION CASE', title: 'Secondary School Performance Analytics', description: 'Applied school-performance case study for evidence-based academic management.', href: '/cases/001', cta: 'Open school analytics' },
  { eyebrow: 'LAB PATHWAY', title: 'MERL Foundations', description: 'Monitoring, evaluation, research and learning competence pathway with evidence gates.', href: '/merl/foundations', cta: 'Explore MERL' },
  { eyebrow: 'LAB PATHWAY', title: 'Data Science', description: 'Applied data-science learning and analytical practice environment.', href: '/data-science', cta: 'Explore data science' },
  { eyebrow: 'EXECUTIVE WORKSPACE', title: 'CEO Intelligence Workspace', description: 'Premium executive intelligence workspace for organisational data, KPIs and scenarios.', href: '/ceo', cta: 'Open CEO workspace' },
]

const courseGroups = [
  {
    title: 'Professional analytics pathways',
    description: 'Programme theory is delivered in the Academy. The Lab supplies the assessed practical work.',
    courses: [
      { code: 'MERL-101', title: 'MERL Foundations', labHref: '/merl/foundations' },
      { code: 'DS-101', title: 'Data Science — Beginner to Advanced', labHref: '/data-science' },
      { code: 'BI-101', title: 'Business Intelligence', labHref: '/practicals/bi-101' },
      { code: 'DA-101', title: 'Data Analytics', labHref: '/practicals/da-101' },
      { code: 'DT-101', title: 'Digital Transformation & Data Systems for Executives', labHref: '/practicals/dte-101' },
      { code: 'STAT-101', title: 'Practical Statistics', labHref: '/practicals/stats-101' },
      { code: 'EXCEL-101', title: 'Comprehensive Excel for School Bursars — Kenya', labHref: '/practicals/excel-bursars-101' },
      { code: 'LDR-101', title: 'Leadership for Public Officers', labHref: '/practicals/public-leadership-101' },
      { code: 'SM-101', title: 'Senior Management', labHref: '/practicals/senior-management-101' },
    ],
  },
  {
    title: 'DatalytIQs field-data pathway',
    description: 'Build practical competence across the full data lifecycle: define, collect, clean, analyse and decide.',
    courses: [
      { code: 'DTQ-101', title: 'Questionnaire Design' , labHref: '/practicals/dtq-101' },
      { code: 'DTQ-102', title: 'KoboToolbox Data Collection' , labHref: '/practicals/dtq-102' },
      { code: 'DTQ-103', title: 'Sampling & Sample Size Determination' , labHref: '/practicals/dtq-103' },
      { code: 'DTQ-104', title: 'Field Data Quality Assurance' , labHref: '/practicals/dtq-104' },
      { code: 'DTQ-105', title: 'Data Cleaning in Excel' , labHref: '/practicals/dtq-105' },
      { code: 'DTQ-106', title: 'Survey Data Analysis in Excel' , labHref: '/practicals/dtq-106' },
      { code: 'DTQ-107', title: 'Data Visualization & Dashboarding' , labHref: '/practicals/dtq-107' },
      { code: 'DTQ-108', title: 'Statistical Interpretation' , labHref: '/practicals/dtq-108' },
      { code: 'DTQ-109', title: 'Data-Driven Report Writing' , labHref: '/practicals/dtq-109' },
      { code: 'DTQ-110', title: 'From Evidence to Management Decisions' , labHref: '/practicals/dtq-110' },
    ],
  },
]

export default function Home() {
  return (
    <main className="app-shell">
      <a className="skip-link" href="#main-content">Skip to course options</a>
      <aside className="sidebar" aria-label="Analytics Lab navigation">
        <div className="brand"><div className="brand-mark" aria-hidden="true">D</div><div><strong>DatalytIQs</strong><span>Analytics Lab</span></div></div>
        <nav aria-label="Primary navigation">
          {navigation.map(([label, href]) => <a aria-current={href === '/' ? 'page' : undefined} className={href === '/' ? 'active' : ''} href={href} key={label}>{label}</a>)}
        </nav>
        <div className="sidebar-footer"><small>LEARNING PHILOSOPHY</small><p>Management Problem → Data → Evidence → Decision</p><a href="https://community.datalytiqsacademy.com">Community ↗</a></div>
      </aside>

      <section className="content" id="main-content">
        <header className="topbar"><div><span className="eyebrow">DATALYTIQS ACADEMY</span><h1>Analytics Lab</h1></div><div className="user" aria-label="Learner workspace"><span className="status" aria-hidden="true" /><div><strong>Learner</strong><small>Student workspace</small></div><div className="avatar" aria-hidden="true">L</div></div></header>
        <section className="hero" aria-labelledby="hero-title"><div><span className="eyebrow gold">DATALYTIQS · EVIDENCE-TO-DECISION ECOSYSTEM</span><h2 id="hero-title">Learn. Practise. Collaborate.<br /><em>Apply with evidence.</em></h2><p>One connected environment for analytical learning, professional examination preparation, practical competency, collaborative problem-solving and executive decision intelligence.</p><div className="actions"><a className="button primary" href="#environments">Choose your workspace</a><a className="button secondary" href="#ecosystem">Explore the ecosystem</a></div></div><div className="hero-model" aria-label="The DatalytIQs method"><span>THE DATALYTIQS METHOD</span><b>Problem</b><i aria-hidden="true">↓</i><b>Data</b><i aria-hidden="true">↓</i><b>Analysis</b><i aria-hidden="true">↓</i><b>Evidence</b><i aria-hidden="true">↓</i><b>Decision</b></div></section>

        <section className="ecosystem-strip" id="ecosystem" aria-label="DatalytIQs ecosystem">{ecosystem.map(([stage,title,description,href])=><a href={href} key={stage}><span>{stage}</span><strong>{title}</strong><small>{description}</small><b aria-hidden="true">→</b></a>)}</section>

        <section className="programme-hub" id="environments" aria-labelledby="environment-title"><div className="section-title"><div><span className="eyebrow">WORKSPACE DIRECTORY</span><h3 id="environment-title">Choose what you need to accomplish</h3></div><p>Move directly into a learning, examination, analytical or executive workspace. Your evidence and progress remain part of the wider DatalytIQs journey.</p></div><div className="programme-grid">{environments.map(({ eyebrow, title, description, href, cta }) => <article key={href}><span className="eyebrow">{eyebrow}</span><h3>{title}</h3><p>{description}</p><a className="button primary" href={href}>{cta} <span aria-hidden="true">→</span></a></article>)}</div></section>

        <section className="course-catalogue" id="course-catalogue" aria-labelledby="catalogue-title"><div className="section-title"><div><span className="eyebrow">FULL LEARNING CATALOGUE</span><h3 id="catalogue-title">Every course, one clear journey</h3></div><p>Begin theory in DatalytIQs Academy, then return here for practical evidence and portfolio work. No duplicate assignments.</p></div><div className="course-groups">{courseGroups.map((group) => { const id = group.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase(); return <section className="course-group" key={group.title} aria-labelledby={id}><div className="course-group-head"><h4 id={id}>{group.title}</h4><p>{group.description}</p></div><ul className="course-list">{group.courses.map((course) => <li key={course.code}><span className="course-code">{course.code}</span><strong>{course.title}</strong>{course.labHref ? <a href={course.labHref}>Open Lab <span aria-hidden="true">→</span></a> : <a href={academyCatalogueUrl}>View Academy theory <span aria-hidden="true">↗</span></a>}</li>)}</ul></section>})}</div></section>

        <section className="home-trust" aria-label="Platform operating principles"><article><span>LEARNING MODEL</span><strong>Evidence-first</strong><small>Practice produces reviewable outputs, not passive completion.</small></article><article><span>PROGRESSION</span><strong>Competency-gated</strong><small>Assessment and evidence determine progression.</small></article><article><span>WORKFLOW</span><strong>Decision-oriented</strong><small>Analysis is translated into management action.</small></article><article><span>ECOSYSTEM</span><strong>Connected</strong><small>Academy, Lab, Community and executive application work together.</small></article></section>
        <section className="metrics" aria-label="Case 001 summary"><article><span>ACTIVE CASE</span><strong>001</strong><small>Secondary School Performance</small></article><article><span>PROGRESS</span><strong>0%</strong><small>6 analytical stages</small></article><article><span>DATASETS</span><strong>1</strong><small>Ready for analysis</small></article><article><span>PROJECT STATUS</span><strong className="text-status">Ready</strong><small>Begin analytical workflow</small></article></section>
        <section id="case001" className="case-card" aria-labelledby="case-title"><div className="case-head"><div><span className="case-number">CASE STUDY 001</span><h3 id="case-title">Secondary School Performance Analytics</h3><p>Evidence-Based Academic Management</p></div><span className="pill">FOUNDATION CASE</span></div><div className="case-grid"><div><h4>Management challenge</h4><p>A school leadership team needs defensible evidence about academic performance patterns and the factors associated with student outcomes so that interventions can be prioritised intelligently.</p></div><div><h4>Your analytical mission</h4><p>Transform the supplied school dataset into statistically sound findings, management insights and actionable recommendations.</p></div></div><div className="case-actions"><a className="button primary" href="/cases/001">Open case workspace <span aria-hidden="true">→</span></a><span>Python · Excel/CSV · Statistical Analysis · Management Interpretation</span></div></section>
        <section id="stages" className="pathway" aria-labelledby="pathway-title"><div className="section-title"><div><span className="eyebrow">CASE 001 PATHWAY</span><h3 id="pathway-title">Your analytical workflow</h3></div><p>Complete each stage sequentially. Your work becomes part of the final analytical report.</p></div><div className="stage-list">{stages.map(([number, title, description]) => <article key={number}><span className="stage-num">{number}</span><div><h4>{title}</h4><p>{description}</p></div><span className="stage-state">NOT STARTED</span><a aria-label={`Open Stage ${number}: ${title}`} href={`/cases/001#stage-${number}`}>→</a></article>)}</div></section>
      </section>
    </main>
  )
}

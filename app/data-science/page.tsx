import Link from 'next/link'
import './data-science.css'

const levels = [
  {
    id: '01',
    label: 'BEGINNER',
    title: 'Data Science Foundations',
    credential: 'Foundation Certificate',
    description: 'Build dependable analytical habits before introducing predictive models.',
    modules: [
      ['01', 'Data, Decisions and the Data Science Workflow', 'Problem framing brief'],
      ['02', 'Python for Data Analysis', 'Reproducible analysis notebook'],
      ['03', 'Statistics for Evidence', 'Statistical interpretation report'],
      ['04', 'Data Preparation and Quality', 'Auditable cleaned dataset'],
      ['05', 'Exploratory Analysis and Visualisation', 'Decision-focused insight brief'],
    ],
  },
  {
    id: '02',
    label: 'INTERMEDIATE',
    title: 'Applied Data Science',
    credential: 'Applied Practitioner Certificate',
    description: 'Develop, validate and communicate models against authentic organisational problems.',
    modules: [
      ['06', 'SQL and Analytical Data Systems', 'Documented analytical dataset'],
      ['07', 'Regression and Classification', 'Validated predictive model'],
      ['08', 'Feature Engineering and Model Selection', 'Model comparison dossier'],
      ['09', 'Unsupervised Learning', 'Segmentation study'],
      ['10', 'Model Interpretation and Responsible AI', 'Model accountability report'],
    ],
  },
  {
    id: '03',
    label: 'ADVANCED',
    title: 'Advanced Data Science Systems',
    credential: 'Advanced Professional Diploma',
    description: 'Move from isolated models to governed, production-oriented analytical systems.',
    modules: [
      ['11', 'Time Series and Forecasting', 'Forecasting system'],
      ['12', 'Natural Language Processing', 'Text analytics application'],
      ['13', 'Advanced Machine Learning', 'Ensemble modelling study'],
      ['14', 'MLOps, Monitoring and Deployment', 'Production-readiness specification'],
      ['15', 'Professional Capstone', 'End-to-end data science portfolio'],
    ],
  },
]

const principles = [
  ['PROBLEM FIRST', 'Every analysis begins with a decision, stakeholder and measurable question.'],
  ['EVIDENCE, NOT OUTPUT', 'Code and models count only when their assumptions, quality and meaning are defensible.'],
  ['BUILD TO PROFESSIONAL STANDARD', 'Each module produces a reusable workplace artefact, not a disposable classroom exercise.'],
]

export const metadata = {
  title: 'Data Science Pathway | DatalytIQs Academy',
  description: 'A competency-based Data Science programme from foundations to advanced professional practice.',
}

export default function DataScienceProgramme() {
  return (
    <main className="ds-page" id="main-content">
      <a className="ds-skip" href="#programme-levels">Skip to programme levels</a>
      <header className="ds-header">
        <Link href="/" className="ds-brand" aria-label="DatalytIQs Analytics Lab home">
          <span aria-hidden="true">D</span>
          <strong>DatalytIQs <small>Academy</small></strong>
        </Link>
        <nav aria-label="Programme navigation">
          <a href="#programme-levels">Pathway</a>
          <a href="#assessment">Assessment</a>
          <Link href="/login">Learner sign-in</Link>
        </nav>
      </header>

      <section className="ds-hero">
        <div>
          <p className="ds-kicker">DATA SCIENCE PROFESSIONAL PATHWAY · VERSION 0.1</p>
          <h1>From analytical foundations to production-ready data science.</h1>
          <p className="ds-lead">Learn to frame consequential questions, prepare trustworthy data, build defensible models and translate results into decisions. The programme advances through demonstrated competence—not attendance alone.</p>
          <div className="ds-actions">
            <a className="ds-primary" href="#programme-levels">Explore the pathway</a>
            <a className="ds-secondary" href="#assessment">Review competency gates</a>
          </div>
        </div>
        <aside className="ds-method" aria-label="DatalytIQs data science method">
          <p>THE DATELYTIQS METHOD</p>
          {['Problem', 'Data', 'Method', 'Evidence', 'Decision', 'Learning'].map((step, index) => (
            <div key={step}><b>{String(index + 1).padStart(2, '0')}</b><span>{step}</span></div>
          ))}
        </aside>
      </section>

      <section className="ds-facts" aria-label="Programme summary">
        <div><strong>3</strong><span>progressive levels</span></div>
        <div><strong>15</strong><span>competency modules</span></div>
        <div><strong>45</strong><span>guided lessons</span></div>
        <div><strong>1</strong><span>integrated portfolio</span></div>
      </section>

      <section className="ds-principles" aria-labelledby="learning-standard">
        <div className="ds-section-heading">
          <p>LEARNING STANDARD</p>
          <h2 id="learning-standard">A professional pathway, not a catalogue of software.</h2>
        </div>
        <div className="ds-principle-grid">
          {principles.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section id="programme-levels" className="ds-levels" aria-labelledby="pathway-heading">
        <div className="ds-section-heading">
          <p>BEGINNER → ADVANCED</p>
          <h2 id="pathway-heading">The complete learning sequence</h2>
          <span>Learners progress only after completing lesson practice, a professional output and a scored assessment at each module.</span>
        </div>
        <div className="ds-level-list">
          {levels.map((level, levelIndex) => (
            <article className="ds-level" key={level.id}>
              <header>
                <div className="ds-level-number">{level.id}</div>
                <div><p>{level.label}</p><h3>{level.title}</h3><span>{level.description}</span></div>
                <strong>{level.credential}</strong>
              </header>
              <ol>
                {level.modules.map(([id, title, output]) => (
                  <li key={id}>
                    <b>{id}</b>
                    <div><h4>{title}</h4><p>Professional output: {output}</p></div>
                    <span>{levelIndex === 0 && id === '01' ? 'NEXT TO BUILD' : 'PLANNED'}</span>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section id="assessment" className="ds-assessment" aria-labelledby="assessment-heading">
        <div>
          <p>COMPETENCY ARCHITECTURE</p>
          <h2 id="assessment-heading">Completion must demonstrate capability.</h2>
          <span>Every module combines guided practice with persistent evidence and a protected assessment. Higher levels add portfolio review and increasingly independent work.</span>
        </div>
        <ol>
          <li><b>01</b><span><strong>Learn and practise</strong>Three applied lessons with immediate explanatory feedback.</span></li>
          <li><b>02</b><span><strong>Produce evidence</strong>A workplace-standard notebook, dataset, model or decision brief.</span></li>
          <li><b>03</b><span><strong>Pass assessment</strong>Server-graded knowledge checks with a minimum score of 70%.</span></li>
          <li><b>04</b><span><strong>Defend the work</strong>Human review of validity, reproducibility, ethics and decision usefulness.</span></li>
        </ol>
      </section>

      <section className="ds-next" aria-labelledby="next-build-heading">
        <p>DEVELOPMENT STARTING POINT</p>
        <h2 id="next-build-heading">Module 01: Data, Decisions and the Data Science Workflow</h2>
        <span>The next build will deliver three complete lessons, a problem-framing template, guided classification practice, professional evidence submission and a protected module quiz.</span>
      </section>

      <footer><span>Data Science Professional Pathway · Development version 0.1</span><Link href="/">DatalytIQs Analytics Lab</Link></footer>
    </main>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import {competencyDomains,learningCycle} from './preview/data'
import {youngAnalystTracks} from './curriculum'
import './young-analysts.css'

export const metadata: Metadata={title:'Young Analysts & Digital Skills Academy | DatalytIQs',description:'Coding, data, AI, statistics, research and digital problem solving for young learners and schools.'}

const pathways=[
 ['EXPLORER','7–10','Notice patterns, ask questions, represent simple data and practise safe digital habits.','Explain a pattern or simple finding using a visual or sequence.'],
 ['BUILDER','10–13','Use Python, spreadsheets, charts, basic statistics and responsible AI tools.','Build, test and explain a small working data or coding artefact.'],
 ['ANALYST','13–16','Frame questions, analyse data, interpret uncertainty and communicate evidence.','Complete a reproducible analysis and defend the conclusion and limitations.'],
 ['INNOVATOR','16–18+','Apply analytics, Python and AI foundations to authentic problems and projects.','Deliver a scoped project with evidence, validation, reflection and presentation.'],
]
const products=[
 ['Python for Kids','Code, create and solve through 30 practical lessons.','/python-for-kids','LIVE'],
 ['Excel for Young Analysts','Build spreadsheet confidence, formulas, charts and analytical habits.','#','PLANNED'],
 ['Data Analytics for Teens','Turn real questions into defensible analysis, interpretation and communication.','#','PLANNED'],
 ['AI Literacy for Young Analysts','Use AI responsibly, verify outputs and understand limitations.','#','PLANNED'],
]

export default function YoungAnalystsPage(){
 return <main id="main-content" className="ya-shell"><a className="ya-skip" href="#main-content">Skip to content</a>
  <header className="ya-nav"><Link href="/" className="ya-brand"><b>D</b><span><strong>DatalytIQs Academy</strong><small>Young Analysts & Digital Skills</small></span></Link><nav aria-label="Young Analysts navigation"><a href="#pathways">Pathways</a><a href="#competencies">Competencies</a><a href="#courses">Courses</a><Link href="/young-analysts/schools">For schools</Link><Link href="/python-for-kids">Start free</Link></nav></header>
  <section className="ya-hero"><div><span className="ya-kicker">DATALYTIQS YOUNG ANALYSTS & DIGITAL SKILLS ACADEMY</span><h1>Learn to code.<br/>Learn to analyse.<br/><em>Learn to solve.</em></h1><p>A competency-based pathway in computational thinking, data literacy, statistics, research, AI literacy and evidence communication. Learners progress by producing useful work—not by accumulating screen time.</p><div className="ya-actions"><Link className="ya-button primary" href="/python-for-kids">Start Python free →</Link><Link className="ya-button secondary" href="/young-analysts/schools">Bring it to your school</Link></div></div><aside><span>LEARNING CYCLE</span>{learningCycle.map((x,i)=><div key={x}><b>{String(i+1).padStart(2,'0')}</b><strong>{x}</strong></div>)}</aside></section>
  <section className="ya-pillars" aria-label="Learning disciplines">{['CODING','DATA','AI','STATISTICS','RESEARCH','COMMUNICATION'].map(x=><span key={x}>{x}</span>)}</section>
  <section id="pathways" className="ya-section"><header><span className="ya-kicker">PROGRESSION ARCHITECTURE</span><h2>Age suggests an entry point. Evidence determines progression.</h2><p>The bands are developmental guides rather than rigid age gates. A learner can start where prior knowledge and demonstrated competence indicate.</p></header><div className="ya-grid pathways">{pathways.map(([level,age,desc,evidence])=><article key={level}><span>{age}</span><h3>{level}</h3><p>{desc}</p><small><b>Progression evidence:</b> {evidence}</small></article>)}</div></section>
  <section id="competencies" className="ya-section ya-courses"><header><span className="ya-kicker">WHAT LEARNERS SHOULD BE ABLE TO DO</span><h2>Six observable competency domains.</h2><p>Evidence is attached to work products, explanations and reflection. Scores should support feedback and progression—not public ranking.</p></header><div className="ya-grid products">{competencyDomains.map(c=><article key={c.name}><span>COMPETENCY</span><h3>{c.name}</h3><p>{c.evidence}</p></article>)}</div></section>
  <section className="ya-section"><header><span className="ya-kicker">BROADER YOUNG ANALYSTS CURRICULUM</span><h2>Five structured pathways beyond Python.</h2><p>Each pathway now has six sequenced modules, applied evidence and an explicit competency outcome. These are curriculum specifications; only implemented products are labelled live.</p></header><div className="ya-grid products">{youngAnalystTracks.map(t=><article key={t.slug}><span>{t.audience}</span><h3>{t.title}</h3><p>{t.purpose}</p><small>{t.modules.length} modules · {t.modules.map(m=>m.code).join(' · ')}</small></article>)}</div></section>
  <section id="courses" className="ya-section"><header><span className="ya-kicker">LEARNING PRODUCTS</span><h2>Start with a real programme.</h2><p>Python for Kids is the implemented entry programme. The remaining products are deliberately labelled planned until their curriculum and entitlement paths are implemented.</p></header><div className="ya-grid products">{products.map(([name,desc,href,status])=><article key={name}><span>{status}</span><h3>{name}</h3><p>{desc}</p>{href!=='#'?<Link href={href}>Open programme →</Link>:<small>Planned · not yet open for enrolment</small>}</article>)}</div></section>
  <section className="ya-school"><div><span className="ya-kicker">DATALYTIQS YOUNG ANALYSTS CLUB</span><h2>A structured analytics and digital-skills programme for schools.</h2><p>The operating model combines curriculum, challenges, facilitator guidance, private learner evidence and cohort-level instructional insight. Schools can use the same framework across successive cohorts without creating public learner rankings.</p><Link className="ya-button primary" href="/young-analysts/schools">Explore school programme →</Link></div><div className="ya-school-flow">{['Institution','Club','Cohort','Instructor','Learner evidence','Progress review'].map((x,i)=><p key={x}><b>{i+1}</b>{x}</p>)}</div></section>
  <section className="ya-safety"><b>Safeguarding by design</b><p>Young learner evidence is private. The architecture excludes public child profiles, public leaderboards and unrestricted direct messaging. Production role access and guardian relationships must be technically enforced before real learner records are introduced.</p></section>
 </main>
}
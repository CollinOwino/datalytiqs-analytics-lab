import type { Metadata } from 'next'
import Link from 'next/link'
import '../young-analysts.css'

export const metadata: Metadata = {
  title: 'Young Analysts & Digital Skills Academy | DatalytIQs',
  description: 'Coding, data, AI, statistics, research and digital problem solving for young learners and schools.'
}

const pathways=[
  ['EXPLORER','7–10','Logic, patterns, visual coding, digital safety and simple data'],
  ['BUILDER','10–13','Python, spreadsheets, charts, basic statistics and AI literacy'],
  ['ANALYST','13–16','Coding, analytics, statistics, research and evidence interpretation'],
  ['INNOVATOR','16–18+','Applied analytics, Python for data, AI foundations and real-world projects']
]
const products=[
  ['Python for Kids','Code, create and solve through 30 practical lessons.','/python-for-kids','LIVE'],
  ['Excel for Young Analysts','Build spreadsheet confidence, formulas, charts and analytical habits.','#','PLANNED'],
  ['Data Analytics for Kids','Turn everyday numbers into questions, charts and explanations.','#','PLANNED'],
  ['AI for Kids','Understand AI, use it responsibly and test what it can and cannot do.','#','PLANNED']
]

export default function YoungAnalystsPage(){
 return <main className="ya-shell">
  <header className="ya-nav"><Link href="/" className="ya-brand"><b>D</b><span><strong>DatalytIQs Academy</strong><small>Young Analysts & Digital Skills</small></span></Link><nav><a href="#pathways">Pathways</a><a href="#courses">Courses</a><Link href="/young-analysts/schools">For schools</Link><Link href="/python-for-kids">Start free</Link></nav></header>
  <section className="ya-hero"><div><span className="ya-kicker">DATALYTIQS YOUNG ANALYSTS & DIGITAL SKILLS ACADEMY</span><h1>Learn to code.<br/>Learn to analyse.<br/><em>Learn to solve.</em></h1><p>Build computational thinking, data literacy and evidence-based problem solving through practical projects—not passive screen time.</p><div className="ya-actions"><Link className="ya-button primary" href="/python-for-kids">Start Python free →</Link><Link className="ya-button secondary" href="/young-analysts/schools">Bring it to your school</Link></div></div><aside><span>LEARNING MODEL</span>{['Explore','Learn','Code','Analyse','Solve','Present'].map((x,i)=><div key={x}><b>{String(i+1).padStart(2,'0')}</b><strong>{x}</strong></div>)}</aside></section>
  <section className="ya-pillars" aria-label="Learning disciplines">{['CODING','DATA','AI','STATISTICS','RESEARCH','DIGITAL PROBLEM SOLVING'].map(x=><span key={x}>{x}</span>)}</section>
  <section id="pathways" className="ya-section"><header><span className="ya-kicker">PROGRESSION ARCHITECTURE</span><h2>Grow from explorer to analyst.</h2><p>Age guides the starting point; demonstrated competence guides progression.</p></header><div className="ya-grid pathways">{pathways.map(([level,age,desc])=><article key={level}><span>{age}</span><h3>{level}</h3><p>{desc}</p></article>)}</div></section>
  <section id="courses" className="ya-section ya-courses"><header><span className="ya-kicker">LEARNING PRODUCTS</span><h2>Start with a real programme.</h2><p>Python for Kids is live first; additional products reuse the same learner identity, evidence and competency architecture.</p></header><div className="ya-grid products">{products.map(([name,desc,href,status])=><article key={name}><span>{status}</span><h3>{name}</h3><p>{desc}</p>{href!=='#'?<Link href={href}>Open programme →</Link>:<small>Architecture reserved</small>}</article>)}</div></section>
  <section className="ya-school"><div><span className="ya-kicker">DATALYTIQS YOUNG ANALYSTS CLUB</span><h2>A ready-to-run analytics and digital-skills programme for schools.</h2><p>DatalytIQs supplies the learning environment, weekly challenges, facilitator materials, practical work, assessment and progress analytics.</p><Link className="ya-button primary" href="/young-analysts/schools">Explore school programme →</Link></div><div className="ya-school-flow">{['School','Club','Cohort','Instructor','Learners','Challenge'].map((x,i)=><p key={x}><b>{i+1}</b>{x}</p>)}</div></section>
  <section className="ya-safety"><b>Designed for young learners</b><p>Private evidence, age-appropriate experiences and controlled school structures are part of the architecture. Public child profiles and unrestricted messaging are not part of this shell.</p></section>
 </main>
}
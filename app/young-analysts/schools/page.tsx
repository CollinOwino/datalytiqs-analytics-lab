import type { Metadata } from 'next'
import Link from 'next/link'
import '../young-analysts.css'

export const metadata: Metadata={title:'Young Analysts Club for Schools | DatalytIQs',description:'A structured coding, data and AI club with curriculum, challenges, instructor materials, assessment and progress analytics.'}

export default function SchoolsPage(){
 const features=[['CURRICULUM','Structured learning pathways instead of isolated computer-club activities.'],['CHALLENGES','Reusable data, coding and research challenges grounded in practical problems.'],['FACILITATION','Session plans, learner briefs, datasets, rubrics and model guidance for instructors.'],['EVIDENCE','Private learner submissions feed progress and competency records.'],['ANALYTICS','Cohort-level instructional insight without turning children into public rankings.'],['CHALLENGE','A pathway toward the annual DatalytIQs Young Analysts Challenge.']]
 return <main className="ya-shell"><header className="ya-nav"><Link href="/young-analysts" className="ya-brand"><b>D</b><span><strong>Young Analysts Club</strong><small>DatalytIQs Academy · For schools</small></span></Link><nav aria-label="School programme navigation"><Link href="/young-analysts">Academy</Link><a href="#model">Club model</a><a href="#access">Access</a></nav></header>
 <section className="ya-hero ya-school-hero"><div><span className="ya-kicker">B2B / SCHOOL PROGRAMME</span><h1>Bring data, coding and AI skills <em>to your school.</em></h1><p>A school does not need to invent the programme. DatalytIQs provides the curriculum, learning platform, practical activities, assessment framework and progress analytics.</p></div><aside><span>INSTITUTION MODEL</span>{['Institution','Club','Cohort','Instructor','Learner','Evidence'].map((x,i)=><div key={x}><b>{String(i+1).padStart(2,'0')}</b><strong>{x}</strong></div>)}</aside></section>
 <section id="model" className="ya-section"><header><span className="ya-kicker">WHAT THE SCHOOL RECEIVES</span><h2>One operating model, reusable across cohorts.</h2></header><div className="ya-grid products">{features.map(([t,d])=><article key={t}><span>INCLUDED</span><h3>{t}</h3><p>{d}</p></article>)}</div></section>
 <section id="access" className="ya-school"><div><span className="ya-kicker">LICENSING ARCHITECTURE</span><h2>School access is a first-class entitlement.</h2><p>The existing DatalytIQs learning engine already distinguishes school access from individual full and guided access. The next schema increment will add institution, club and cohort ownership without duplicating learner progress.</p></div><div className="ya-school-flow">{['Institution licence','Coordinator','Cohort','Assignments','Evidence','Progress report'].map((x,i)=><p key={x}><b>{i+1}</b>{x}</p>)}</div></section>
 </main>
}

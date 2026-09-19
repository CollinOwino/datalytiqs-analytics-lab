import Link from 'next/link'
import {previewChallenges} from '../data'
import '../../young-analysts.css'

export default function Learner(){
 return <main id="main-content" className="ya-shell ya-preview"><a className="ya-skip" href="#main-content">Skip to content</a>
  <header className="ya-nav"><Link href="/young-analysts/preview">← Preview</Link><strong>Learner challenge view</strong></header>
  <section className="ya-section"><div className="ya-test-banner" role="status"><strong>Synthetic learner workspace.</strong> No real learner evidence is shown.</div><span className="ya-kicker">LEARNER · SYNTHETIC</span><h2>Amani&apos;s challenge board</h2><p>Each challenge starts with a question and ends with evidence, explanation and reflection. There is no public leaderboard.</p>
   <div className="ya-grid products">{previewChallenges.map(c=><article key={c.id}><span>{c.status}</span><h3>{c.title}</h3><p><b>{c.skill}</b><br/>{c.question}</p><small><b>Evidence:</b> {c.output}</small></article>)}</div>
   <div className="ya-panel"><h3>How work is reviewed</h3><p>Instructor feedback considers method, evidence quality, explanation and responsible data handling. A challenge is not complete merely because a file was uploaded.</p></div>
   <div className="ya-safety"><b>Safe learning space</b><p>Production evidence must be visible only to authorised learning roles. This preview contains synthetic records and does not claim that production authorisation is already implemented.</p></div>
  </section>
 </main>
}
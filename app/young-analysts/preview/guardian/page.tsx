import Link from 'next/link'
import {previewGuardian as g} from '../data'
import '../../young-analysts.css'

export default function Guardian(){
 return <main id="main-content" className="ya-shell ya-preview">
  <a className="ya-skip" href="#main-content">Skip to content</a>
  <header className="ya-nav"><Link href="/young-analysts/preview">← Preview</Link><strong>Guardian progress view</strong></header>
  <section className="ya-section">
   <div className="ya-test-banner" role="status"><strong>Synthetic guardian view.</strong> Relationship status and learner data are acceptance-test fixtures only.</div>
   <span className="ya-kicker">GUARDIAN VIEW · RELATIONSHIP-GATED MODEL</span><h2>{g.learner}&apos;s learning progress</h2><p>{g.note}</p>
   <div className="ya-panel"><h3>Access relationship</h3><p>{g.relationship} · {g.relationshipVerified?'Verified for preview':'Not verified'}</p><small>Production access must be relationship-gated; this preview does not establish a real guardian relationship.</small></div>
   <div className="ya-metrics">{[['Progress',g.progress+'%'],['Lessons',g.completed],['Projects',g.projects],['Badges',g.badges]].map(([a,b])=><article key={a}><b>{b}</b><span>{a}</span></article>)}</div>
   <div className="ya-panel"><h3>Next learning step</h3><p>{g.next}</p><small>This view deliberately excludes private messages, public ranking and unnecessary behavioural surveillance.</small></div>
  </section>
 </main>
}
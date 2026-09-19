import Link from 'next/link'
import {previewInstitution,previewChallenges,previewMetrics} from './data'
import '../young-analysts.css'

export default function PreviewInstitution(){
 return <main id="main-content" className="ya-shell ya-preview">
  <a className="ya-skip" href="#main-content">Skip to content</a>
  <header className="ya-nav">
   <Link href="/young-analysts" className="ya-brand"><b>D</b><span><strong>Preview Institution</strong><small>SYNTHETIC ACCEPTANCE TEST</small></span></Link>
   <nav aria-label="Preview roles"><Link href="/young-analysts/preview/club">Club</Link><Link href="/young-analysts/preview/cohort">Cohort</Link><Link href="/young-analysts/preview/instructor">Instructor</Link><Link href="/young-analysts/preview/learner">Learner</Link><Link href="/young-analysts/preview/guardian">Guardian</Link></nav>
  </header>
  <section className="ya-section">
   <div className="ya-test-banner" role="status"><strong>Synthetic acceptance environment.</strong> No real child, guardian or school records are displayed.</div>
   <span className="ya-kicker">PREVIEW · NO REAL CHILD DATA</span><h2>{previewInstitution.name}</h2><p>{previewInstitution.term} · {previewInstitution.code}</p>
   <div className="ya-metrics" aria-label="Institution metrics">{[['Learners',previewMetrics.learners],['Instructors',previewMetrics.instructors],['Guardians',previewMetrics.guardians],['Open challenges',previewMetrics.openChallenges]].map(([a,b])=><article key={a}><b>{b}</b><span>{a}</span></article>)}</div>
   <div className="ya-panel"><h3>Institution → Club → Cohort</h3><p>{previewInstitution.name} → {previewInstitution.club} → {previewInstitution.cohort}</p><Link href="/young-analysts/preview/club">Open club dashboard →</Link></div>
   <div className="ya-panel"><h3>Current challenges</h3>{previewChallenges.map(c=><p key={c.id}><b>{c.title}</b> · {c.skill} · due {c.due}</p>)}</div>
  </section>
 </main>
}
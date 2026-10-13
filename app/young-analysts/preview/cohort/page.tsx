import Link from 'next/link'
import {previewInstitution,previewLearners} from '../data'
import '../../young-analysts.css'

export default function Cohort(){
 return <main id="main-content" className="ya-shell ya-preview">
  <a className="ya-skip" href="#main-content">Skip to content</a>
  <header className="ya-nav"><Link href="/young-analysts/preview/club">← Club</Link><strong>Cohort roster</strong></header>
  <section className="ya-section">
   <div className="ya-test-banner" role="status"><strong>Synthetic learner roster.</strong> Names and progress values are fabricated for acceptance testing.</div>
   <span className="ya-kicker">COHORT · SYNTHETIC LEARNERS</span><h2>{previewInstitution.cohort}</h2>
   <div className="ya-table-wrap"><table className="ya-data-table"><caption className="sr-only">Synthetic cohort roster and instructional signals</caption><thead><tr><th scope="col">Learner</th><th scope="col">Level</th><th scope="col">Progress</th><th scope="col">Instructional signal</th></tr></thead><tbody>{previewLearners.map(l=><tr key={l.id}><th scope="row">{l.name}<small>{l.id}</small></th><td>{l.level}</td><td><progress value={l.progress} max="100" aria-label={`${l.name} progress ${l.progress}%`}/><span> {l.progress}%</span></td><td>{l.status}</td></tr>)}</tbody></table></div>
   <Link className="ya-button primary" href="/young-analysts/preview/instructor">Open instructor workspace →</Link>
  </section>
 </main>
}
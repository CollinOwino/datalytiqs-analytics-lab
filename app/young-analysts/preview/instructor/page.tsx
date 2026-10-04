import Link from 'next/link'
import {previewLearners,previewChallenges,previewMetrics} from '../data'
import '../../young-analysts.css'

export default function Instructor(){
 const attention=previewLearners.filter(x=>x.progress<60)
 return <main id="main-content" className="ya-shell ya-preview"><a className="ya-skip" href="#main-content">Skip to content</a>
  <header className="ya-nav"><Link href="/young-analysts/preview/cohort">← Cohort</Link><strong>Instructor workspace</strong></header>
  <section className="ya-section"><div className="ya-test-banner" role="status"><strong>Synthetic instructor view.</strong> Signals below are instructional prompts, not automated judgements about children.</div><span className="ya-kicker">INSTRUCTOR VIEW · SYNTHETIC</span><h2>Facilitate from evidence.</h2>
   <div className="ya-metrics">{[['Average progress',previewMetrics.averageProgress+'%'],['Learners needing review',previewMetrics.attention],['Open challenges',previewMetrics.openChallenges],['Cohort learners',previewMetrics.learners]].map(([a,b])=><article key={a}><b>{b}</b><span>{a}</span></article>)}</div>
   <div className="ya-grid products">{previewChallenges.map(c=><article key={c.id}><span>{c.status}</span><h3>{c.title}</h3><p>{c.question}</p><small><b>Expected evidence:</b> {c.output}</small><p><small><b>Review:</b> {c.criteria.join(' · ')}</small></p></article>)}</div>
   <div className="ya-panel"><h3>Instructional attention</h3>{attention.map(x=><p key={x.id}><b>{x.name}</b> · {x.progress}% · {x.status}</p>)}<small>Low progress is a prompt to inspect evidence and context. It must not automatically determine ability, discipline, certification or access.</small></div>
  </section>
 </main>
}
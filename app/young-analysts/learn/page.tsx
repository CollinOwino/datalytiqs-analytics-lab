import Link from 'next/link'
import {youngAnalystTracks} from '../curriculum'
import {createClient} from '../../../lib/supabase/server'
import '../young-analysts.css'

export default async function YoungAnalystsLearn(){
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser()
 if(!user)return <main className="ya-shell ya-preview"><section className="ya-section"><h1>Young Analysts learning workspace</h1><p>Sign in to keep lesson, quiz and competency evidence attached to one private learner record.</p><Link className="ya-button primary" href="/login?next=/young-analysts/learn">Sign in →</Link></section></main>
 return <main id="main-content" className="ya-shell ya-preview"><a className="ya-skip" href="#main-content">Skip to content</a><header className="ya-nav"><Link href="/young-analysts">← Young Analysts</Link><strong>Learning workspace</strong></header>
  <section className="ya-section"><span className="ya-kicker">PRIVATE LEARNER WORKSPACE</span><h1>Choose a competency pathway.</h1><p>Lessons lead into scored checks and applied evidence. Competency requires evidence and review, not completion clicks alone.</p>
   <div className="ya-grid products">{youngAnalystTracks.map(t=><article key={t.slug}><span>{t.audience}</span><h2>{t.title}</h2><p>{t.purpose}</p><p><b>{t.modules.length} modules</b> · applied evidence · competency review</p><Link href={'/young-analysts/learn/'+t.slug}>Open pathway →</Link></article>)}</div>
  </section></main>
}
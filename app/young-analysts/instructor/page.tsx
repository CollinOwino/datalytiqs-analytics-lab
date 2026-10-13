import Link from 'next/link'
import {createClient} from '../../../lib/supabase/server'
import '../young-analysts.css'

export default async function InstructorReview(){
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser()
 if(!user)return <main className="ya-shell ya-preview"><section className="ya-section"><h1>Instructor review</h1><Link href="/login?next=/young-analysts/instructor">Sign in →</Link></section></main>
 return <main id="main-content" className="ya-shell ya-preview"><a className="ya-skip" href="#main-content">Skip to content</a><header className="ya-nav"><Link href="/young-analysts">← Young Analysts</Link><strong>Instructor review</strong></header><section className="ya-section"><span className="ya-kicker">ROLE-GATED WORKSPACE</span><h1>Evidence review is intentionally closed.</h1><div className="ya-test-banner"><strong>Security boundary:</strong> the persistence schema does not grant broad authenticated users access to other learners&apos; evidence. Institution/cohort instructor membership must be verified before the review queue is enabled.</div><div className="ya-panel"><h2>Rubric prepared</h2><p>Method & correctness 0–3 · Evidence & testing 0–3 · Reasoning & communication 0–3 · Responsible practice 0–3.</p><p>Provisional competency rule: 8/12 and Responsible Practice above zero. This remains a pilot rule, not a validated certification cut score.</p></div></section></main>
}
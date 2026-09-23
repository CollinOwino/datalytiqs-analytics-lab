import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { reviewTopicPractical } from '../actions'
import '../exam-hub.css'
import '../topic-workspace.css'

export const metadata: Metadata = { title: 'CA35P Practical Review | DatalytIQs' }

export default async function PracticalReviewPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/exam-hub/review')
  const { data: programme } = await supabase.from('exam_programmes').select('id').eq('code', 'CA35P').single()
  if (!programme) notFound()
  const { data: staff } = await supabase.from('exam_programme_staff').select('role').eq('programme_id', programme.id).eq('user_id', user.id).eq('active', true).in('role', ['reviewer', 'instructor', 'administrator']).limit(1)
  if (!staff?.length) notFound()

  const { data: syllabus } = await supabase.from('exam_syllabus_versions').select('id').eq('programme_id', programme.id).eq('status', 'published').order('effective_from', { ascending: false }).limit(1).single()
  if (!syllabus) notFound()
  const { data: topics } = await supabase.from('exam_topics').select('id,code,title').eq('syllabus_version_id', syllabus.id)
  const topicById = new Map((topics || []).map(topic => [topic.id, topic]))
  const { data: submissions, error } = await supabase.from('exam_topic_practical_submissions')
    .select('id,topic_id,user_id,status,summary,evidence_link,submitted_at')
    .in('topic_id', [...topicById.keys()])
    .in('status', ['submitted', 'under_review', 'revision_required'])
    .order('submitted_at', { ascending: true }).limit(50)

  return <main className="exam-hub topic-workspace">
    <header className="exam-header"><a className="exam-brand" href="/exam-hub"><span>D</span><b>DatalytIQs</b><small>CA35P Assessor</small></a><nav aria-label="Assessor navigation"><a href="/exam-hub">Dashboard</a><a href="#review-queue">Review queue</a></nav><span className="account-chip">Reviewer</span></header>
    <section className="exam-section practice-bank" id="review-queue"><div className="exam-section-head"><div><span className="exam-kicker">AUTHORIZED ASSESSORS</span><h1>Practical review queue</h1></div><p>Review source evidence, score each criterion and provide actionable feedback. The database verifies your active reviewer role on every decision.</p></div>
      {state === 'review-saved' && <p className="exam-notice" role="status">Assessment saved. The learner’s competency gates were recalculated.</p>}
      {state === 'review-error' && <p className="exam-notice error" role="alert">Review could not be saved. Refresh the queue and confirm the submission is still open.</p>}
      {state === 'review-invalid' && <p className="exam-notice error" role="alert">Enter four whole-number scores from 0 to 5 and at least 20 characters of feedback.</p>}
      {error ? <p role="alert">The review queue could not be loaded. Try again shortly.</p> : !submissions?.length ? <p>No practical submissions currently require review.</p> : <div className="review-list">{submissions.map(item => { const topic = topicById.get(item.topic_id); if (!topic) return null; return <article className="review-card" key={item.id}><span className="exam-kicker">{topic.code} · {topic.title} · {item.status.replace('_', ' ')}</span><h2>Submission {item.id.slice(0, 8)}</h2><p>Learner reference: {item.user_id.slice(0, 8)} · Submitted {new Date(item.submitted_at).toLocaleDateString('en-KE')}</p><h3>Analytical summary</h3><p className="review-summary">{item.summary}</p>{item.evidence_link && <p><a href={item.evidence_link} target="_blank" rel="noopener noreferrer">Open learner evidence ↗</a></p>}<form action={reviewTopicPractical}><input type="hidden" name="submission_id" value={item.id}/><input type="hidden" name="topic_code" value={topic.code}/><input type="hidden" name="return_to" value="review"/><div className="review-scores">{[['structure','Structure and integrity'],['method','Method and accuracy'],['interpretation','Interpretation'],['recommendation','Recommendation']].map(([name,label])=><label key={name}>{label}<input name={name} type="number" min="0" max="5" step="1" required/></label>)}</div><label>Evidence-based feedback<textarea name="reviewer_feedback" minLength={20} rows={4} required/></label><button className="exam-button primary" type="submit">Save review</button></form></article> })}</div>}
    </section>
  </main>
}

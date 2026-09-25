import { redirect } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { DTQ_COURSE, dtqAccess } from '../../../../lib/practicals/dtq101'
import { ReviewForm } from './review-form'

export const dynamic = 'force-dynamic'
export default async function DTQReviewerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=%2Fpracticals%2Fdtq-101%2Freview')
  const { reviewer } = await dtqAccess(user.id)
  if (!reviewer) return <main><h1>Instructor access required</h1><p>Your account is not assigned to DTQ-101 assessment.</p></main>
  const admin = createAdminClient()
  const { data: submissions, error } = await admin.from('practical_submissions')
    .select('id,user_id,summary,submitted_at,status,questionnaire_path,codebook_path,pilot_note_path')
    .eq('course_code', DTQ_COURSE).eq('status', 'submitted')
    .order('submitted_at', { ascending: true }).limit(50)
  if (error) throw error
  const evidence = [['questionnaire','Questionnaire'],['codebook','Codebook'],['pilot_note','Pilot-revision note']] as const
  return <main style={{ maxWidth: 900, margin: 'auto', padding: 24, fontFamily: 'Arial, sans-serif' }}>
    <a href="/practicals/dtq-101">← DTQ-101 checkpoint</a>
    <h1>DTQ-101 · Instructor review queue</h1>
    <p>{submissions?.length || 0} submissions awaiting assessment. Evidence links expire shortly after opening.</p>
    {!submissions?.length && <p>No pending submissions.</p>}
    {submissions?.map(submission => <article key={submission.id} style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: 20, marginBlock: 18 }}>
      <h2>Submission {submission.id.slice(0, 8)}</h2>
      <p>Learner reference: {submission.user_id.slice(0, 8)} · Submitted: {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString('en-KE') : 'Unknown'}</p>
      <p style={{ whiteSpace: 'pre-wrap' }}>{submission.summary}</p>
      <ul>{evidence.map(([kind, label]) => <li key={kind}>
        <a href={`/api/practicals/dtq-101/evidence?submission=${submission.id}&kind=${kind}`}>{label} ↗</a>
      </li>)}</ul>
      {submission.user_id === user.id ? <p>You cannot assess your own work.</p> : <ReviewForm id={submission.id} code={DTQ_COURSE}/>}
    </article>)}
  </main>
}

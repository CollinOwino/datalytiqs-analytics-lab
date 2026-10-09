import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import '../certification.css'

export const dynamic = 'force-dynamic'

export default async function CourseCompletionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=%2Fcertification%2Fcompletions')

  const syntheticAccount = /(^dtq[._-]?acceptance|acceptance[._-]?test|synthetic|test[._-]?learner)/i.test(user.email || '')
  const { data: link } = await supabase.from('learner_identity_links')
    .select('tutor_user_id,last_verified_at').eq('learner_id',user.id).maybeSingle()
  const { data: completions, error } = await supabase.from('tutor_lab_entitlements')
    .select('tutor_course_id,state,completion_event_id,updated_at')
    .eq('user_id',user.id).eq('state','completed')
    .not('completion_event_id','is',null).order('updated_at',{ascending:false})

  return <main className="cert-shell">
    <header className="cert-hero"><div><a href="/certification">← Certification Centre</a>
      <p>DATALYTIQS ACADEMY · VERIFIED COURSE COMPLETIONS</p>
      <h1>My course completion records</h1>
      <span>These records originate from signed Tutor LMS events and verified Academy–Lab identity links. A completion record is not a professional Certificate of Competence.</span>
    </div></header>
    <section className="cert-panel">
      <h2>Academy completion evidence</h2>
      {syntheticAccount && <p role="status"><strong>ACCEPTANCE-TEST ACCOUNT:</strong> This account is excluded from genuine certificate issuance. Completion evidence is for quality assurance only.</p>}
      {!link && <p>Your Academy and Analytics Lab identities are not yet linked. Sign in using the verified account associated with your Academy enrolment, or request an administrator-assisted identity check.</p>}
      {error && <p role="alert">Completion records are temporarily unavailable. Please contact Academy support.</p>}
      {link && !error && (!completions || completions.length===0) && <p>No verified completed Tutor LMS courses are linked to this account yet. Completing a course in Tutor LMS does not immediately guarantee a printable credential.</p>}
      {link && !error && completions && completions.length>0 && <div className="cert-list">
        {completions.map(row=><article key={row.tutor_course_id}>
          <div><b>Academy course #{row.tutor_course_id}</b><span>Completion event recorded · {new Date(row.updated_at).toLocaleDateString('en-KE')}</span></div>
          <span className="status-valid">COMPLETED</span>
          <span>{syntheticAccount ? 'QA ONLY · CERTIFICATE INELIGIBLE' : 'Certificate issuance pending verified assessment results'}</span>
        </article>)}
      </div>}
      <p>For a printable, verifiable completion certificate, the Academy must validate the course title, learner name, assessment policy and authorised issuance configuration. This page deliberately does not create unverified certificates.</p>
    </section>
  </main>
}

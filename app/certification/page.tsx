import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import { requestMerlFoundationsReview } from './actions'
import './certification.css'

export default async function CertificationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=%2Fcertification')

  const [{ data: eligibility }, { data: template }, { data: request }, { data: credentials }, { data: admin }] = await Promise.all([
    supabase.rpc('merl_foundations_eligibility', { p_user_id: user.id }),
    supabase.from('certificate_templates').select('id,code,certificate_title,programme_title,credential_type,result_label').eq('code','MERL-FOUNDATIONS-COMP').eq('active',true).order('version',{ascending:false}).limit(1).maybeSingle(),
    supabase.from('credential_review_requests').select('id,status,learner_name,requested_at,reviewer_notes').eq('user_id',user.id).order('requested_at',{ascending:false}).limit(1).maybeSingle(),
    supabase.from('credentials').select('credential_id,certificate_number,programme_title,result,issue_date,status').eq('learner_user_id',user.id).order('created_at',{ascending:false}),
    supabase.from('certification_admins').select('role').eq('user_id',user.id).eq('active',true).maybeSingle(),
  ])

  const e = (eligibility || {}) as any
  const isEligible = e.eligible === true
  const issued = request?.status === 'issued'

  return <main className="cert-shell">
    <header className="cert-hero">
      <div>
        <a href="/">← Analytics Lab</a>
        <p>DATALYTIQS ACADEMY · CREDENTIALS</p>
        <h1>Certification Centre</h1>
        <span>Competence credentials are issued only after persistent module gates and professional review requirements are satisfied.</span>
      </div>
      {admin && <a className="cert-admin-link" href="/certification/admin">Certification administration →</a>}
    </header>

    <section className="cert-grid">
      <article className="cert-card">
        <small>MASTER CREDENTIAL</small>
        <h2>{template?.certificate_title || 'Certificate of Competence'}</h2>
        <h3>MERL Foundations</h3>
        <p>{template?.programme_title}</p>
        <dl>
          <div><dt>Modules competent</dt><dd>{e.modules_competent ?? 0}/{e.modules_required ?? 5}</dd></div>
          <div><dt>Eligibility</dt><dd className={isEligible?'ok':'pending'}>{isEligible?'READY FOR REVIEW':'IN PROGRESS'}</dd></div>
          <div><dt>Result standard</dt><dd>{template?.result_label || 'Competent'}</dd></div>
        </dl>
      </article>

      <article className="cert-card">
        <small>REVIEW STATUS</small>
        <h2>{request ? request.status.replaceAll('_',' ').toUpperCase() : 'NOT REQUESTED'}</h2>
        {request ? <>
          <p>Requested for <b>{request.learner_name}</b> on {new Date(request.requested_at).toLocaleDateString('en-KE')}.</p>
          {request.reviewer_notes && <p><b>Reviewer note:</b> {request.reviewer_notes}</p>}
        </> : <p>Complete all five MERL Foundations competency gates before requesting professional credential review.</p>}
      </article>
    </section>

    {!issued && <section className="cert-panel">
      <h2>Request MERL Foundations credential review</h2>
      <p>Your name below will be used on the certificate if the review is approved. Test accounts are automatically excluded from certification.</p>
      <form action={requestMerlFoundationsReview} className="cert-form">
        <label>Name exactly as it should appear on the certificate
          <input name="learner_name" required minLength={3} defaultValue={request?.learner_name || ''}/>
        </label>
        <label className="cert-check">
          <input type="checkbox" name="declaration" required/>
          <span>I confirm that the submitted portfolio is my professional work, contains no unauthorised confidential data, and accurately represents the competencies I can demonstrate.</span>
        </label>
        <button type="submit" disabled={!isEligible}>{isEligible?'Request professional review':'Complete all competency gates first'}</button>
      </form>
    </section>}

    <section className="cert-panel">
      <h2>Issued credentials</h2>
      {credentials?.length ? <div className="cert-list">{credentials.map((c:any)=><article key={c.credential_id}>
        <div><b>{c.programme_title}</b><span>{c.certificate_number} · Issued {new Date(c.issue_date).toLocaleDateString('en-KE')}</span></div>
        <span className={`status-${c.status}`}>{c.status.toUpperCase()}</span>
        <div className="cert-actions"><a href={`/certificate/${c.credential_id}`}>View certificate</a><a href={`/verify/${c.credential_id}`}>Verify</a></div>
      </article>)}</div> : <p>No credential has been issued yet.</p>}
    </section>
  </main>
}

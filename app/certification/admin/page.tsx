import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import { issueMerlFoundationsCredential, updateCertificateSignatory } from '../actions'
import '../certification.css'

export default async function CertificationAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=%2Fcertification%2Fadmin')

  const { data: admin } = await supabase
    .from('certification_admins')
    .select('role,active')
    .eq('user_id', user.id)
    .eq('active', true)
    .maybeSingle()
  if (!admin) redirect('/certification')

  const { data: template } = await supabase
    .from('certificate_templates')
    .select('id,code,version,certificate_title,programme_title,achievement_statement,detail_statement,result_label')
    .eq('code','MERL-FOUNDATIONS-COMP')
    .eq('active',true)
    .order('version',{ascending:false})
    .limit(1)
    .maybeSingle()

  const [{ data: signatories }, { data: requests }, { data: credentials }] = await Promise.all([
    template ? supabase.from('certificate_signatories').select('*').eq('template_id',template.id).order('sort_order') : Promise.resolve({data:[] as any[]}),
    template ? supabase.from('credential_review_requests').select('id,user_id,status,learner_name,learner_declaration,requested_at,reviewer_notes').eq('template_id',template.id).order('requested_at',{ascending:false}) : Promise.resolve({data:[] as any[]}),
    template ? supabase.from('credentials').select('credential_id,certificate_number,learner_name,issue_date,status').eq('template_id',template.id).order('created_at',{ascending:false}).limit(20) : Promise.resolve({data:[] as any[]}),
  ])

  return <main className="cert-shell">
    <header className="cert-hero">
      <div>
        <a href="/certification">← Certification Centre</a>
        <p>DATALYTIQS ACADEMY · CREDENTIAL GOVERNANCE</p>
        <h1>Certification Administration</h1>
        <span>Edit authorized signatories, review eligible learners and issue immutable MERL Foundations credentials.</span>
      </div>
      <span>ADMIN ROLE: {admin.role.toUpperCase()}</span>
    </header>

    <section className="cert-panel">
      <small>MASTER TEMPLATE · {template?.code} · v{template?.version}</small>
      <h2>{template?.certificate_title}</h2>
      <p><b>{template?.programme_title}</b></p>
      <p>{template?.detail_statement}</p>
    </section>

    <section className="cert-panel">
      <h2>Editable authorized signatories</h2>
      <p>Signature images should be transparent PNG/SVG assets hosted at an approved HTTPS URL. Changing these fields affects future credentials only; issued credentials retain their frozen signatory snapshot.</p>
      <div className="cert-admin-grid">
        {(signatories || []).map((s:any)=><article className="cert-admin-card" key={s.id}>
          <small>{s.signatory_key.toUpperCase()}</small>
          <form action={updateCertificateSignatory}>
            <input type="hidden" name="id" value={s.id}/>
            <label>Display name<input name="display_name" defaultValue={s.display_name} required/></label>
            <label>Title<input name="title" defaultValue={s.title} required/></label>
            <label>Signature image URL<input name="signature_image_url" type="url" placeholder="https://…/signature.png" defaultValue={s.signature_image_url || ''}/></label>
            <button type="submit">Save signatory</button>
          </form>
        </article>)}
      </div>
    </section>

    <section className="cert-panel">
      <h2>Credential review queue</h2>
      <div className="cert-review">
        {(requests || []).length ? requests!.map((r:any)=><article key={r.id}>
          <b>{r.learner_name || 'Learner name not supplied'}</b>
          <p>Status: <strong>{r.status.toUpperCase()}</strong> · Requested {new Date(r.requested_at).toLocaleString('en-KE')}</p>
          <small>Learner ID: {r.user_id}</small>
          {r.status !== 'issued' && <form action={issueMerlFoundationsCredential}>
            <input type="hidden" name="user_id" value={r.user_id}/>
            <label>Certificate learner name<input name="learner_name" defaultValue={r.learner_name || ''} required minLength={3}/></label>
            <label>Reviewer notes<textarea name="review_notes" rows={3} placeholder="Quality/authenticity review notes"/></label>
            <button type="submit">Approve and issue credential</button>
          </form>}
        </article>) : <p>No credential review requests are waiting.</p>}
      </div>
    </section>

    <section className="cert-panel">
      <h2>Recent issued credentials</h2>
      {credentials?.length ? <div className="cert-list">{credentials.map((c:any)=><article key={c.credential_id}>
        <div><b>{c.learner_name}</b><span>{c.certificate_number} · {new Date(c.issue_date).toLocaleDateString('en-KE')}</span></div>
        <span className={`status-${c.status}`}>{c.status.toUpperCase()}</span>
        <div className="cert-actions"><a href={`/certificate/${c.credential_id}`}>Certificate</a><a href={`/verify/${c.credential_id}`}>Verify</a></div>
      </article>)}</div> : <p>No credentials issued from this template yet.</p>}
    </section>
  </main>
}

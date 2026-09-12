import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import './certificate.css'

export default async function CertificatePage({ params }: { params: Promise<{ credentialId: string }> }) {
  const { credentialId } = await params
  const supabase = await createClient()
  const { data } = await supabase.rpc('render_credential', { p_credential_id: credentialId })
  const credential = Array.isArray(data) ? data[0] : null
  if (!credential) notFound()

  const snapshot = (credential.snapshot || {}) as any
  const template = snapshot.template || {}
  const signatories = Array.isArray(snapshot.signatories) ? snapshot.signatories : []
  const director = signatories.find((s:any)=>s.key==='director')
  const facilitator = signatories.find((s:any)=>s.key==='facilitator')
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host') || ''
  const proto = h.get('x-forwarded-proto') || 'https'
  const verificationUrl = `${proto}://${host}/verify/${credential.credential_id}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&data=${encodeURIComponent(verificationUrl)}`
  const revoked = credential.status !== 'valid'

  return <main className="credential-page">
    <div className="credential-toolbar">
      <a href={`/verify/${credential.credential_id}`}>Verify credential</a>
      <button type="button" onClick={undefined} className="print-hint">Use browser Print → Save as PDF</button>
    </div>
    <section className="credential-paper" aria-label="DatalytIQs Academy Certificate of Competence">
      <div className="corner corner-left"></div><div className="corner corner-right"></div>
      <header className="credential-brand">
        <div className="brand-side">Data<br/>People<br/>Insights<br/>Impact</div>
        <div className="brand-centre">
          <h1>Datalyt<span>iQ</span>s Academy</h1>
          <p>An initiative of <b>DatalytIQs Baseline Enterprises Limited</b></p>
          <small>LEARN · PRACTISE · COLLABORATE · APPLY</small>
        </div>
        <div className="brand-side right">Evidence<br/>for Better<br/>Decisions</div>
      </header>

      <section className="credential-body">
        <h2>{template.certificate_title || 'CERTIFICATE OF COMPETENCE'}</h2>
        <div className="rule-title"><span></span><b>THIS IS TO CERTIFY THAT</b><span></span></div>
        <h3>{credential.learner_name}</h3>
        <p>{template.achievement_statement || 'has successfully demonstrated the required competencies in'}</p>
        <h4>{credential.programme_title}</h4>
        <p className="detail">{template.detail_statement}</p>
      </section>

      <section className="impact-row">
        <div><b>▥</b><span>STRONGER<br/>INSTITUTIONS</span></div>
        <div><b>⚙</b><span>BETTER<br/>DECISIONS</span></div>
        <div><b>◉</b><span>BRIGHTER<br/>COMMUNITIES</span></div>
        <div><b>◆</b><span>A MORE RESILIENT<br/>AFRICA</span></div>
      </section>

      <section className="credential-lower">
        <div className="signatory">
          <div className="signature-box">{director?.signature_image_url ? <img src={director.signature_image_url} alt="Director signature"/> : <span>AUTHORIZED SIGNATURE</span>}</div>
          <b>{director?.display_name || 'Director Name'}</b>
          <span>{director?.title || 'Director, DatalytIQs Academy'}</span>
        </div>

        <div className="seal"><span>D</span><small>DATALYTIQS ACADEMY</small></div>

        <div className="signatory">
          <div className="signature-box">{facilitator?.signature_image_url ? <img src={facilitator.signature_image_url} alt="Facilitator signature"/> : <span>AUTHORIZED SIGNATURE</span>}</div>
          <b>{facilitator?.display_name || 'Facilitator Name'}</b>
          <span>{facilitator?.title || 'Lead Facilitator, DatalytIQs Academy'}</span>
        </div>

        <div className="verification-panel">
          <dl>
            <div><dt>Certificate No.</dt><dd>{credential.certificate_number}</dd></div>
            <div><dt>Date of Issue</dt><dd>{new Date(credential.issue_date).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})}</dd></div>
            <div><dt>Credential ID</dt><dd>{credential.credential_id}</dd></div>
            <div><dt>Final Result</dt><dd>{credential.result}</dd></div>
          </dl>
          <div className="qr-row">
            <img src={qrUrl} alt="QR code for credential verification"/>
            <div><b>Scan to Verify</b><small>{verificationUrl}</small></div>
          </div>
        </div>
      </section>

      <footer className="credential-footer">
        <div><b>DatalytIQs Academy</b><br/>Nairobi, Kenya · datalytiqsacademy.com</div>
        <div>KNOWLEDGE · SKILLS · IMPACT</div>
        <blockquote>“Data is the modern oil —<br/>we turn it into opportunity.”</blockquote>
      </footer>

      {revoked && <div className="revoked-banner">{credential.status.toUpperCase()} CREDENTIAL</div>}
    </section>
  </main>
}

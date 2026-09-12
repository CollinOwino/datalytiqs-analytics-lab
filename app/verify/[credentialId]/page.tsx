import { createClient } from '../../../lib/supabase/server'

export default async function VerifyCredentialPage({ params }: { params: Promise<{ credentialId: string }> }) {
  const { credentialId } = await params
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('verify_credential', { p_credential_id: credentialId })
  const credential = Array.isArray(data) ? data[0] : null
  const valid = credential?.status === 'valid'

  return <main style={{maxWidth:760,margin:'60px auto',padding:24,fontFamily:'system-ui',color:'#0B2C4D'}}>
    <section style={{border:'1px solid #D8E0E8',borderTop:'5px solid #F4A261',borderRadius:14,padding:30,background:'#fff'}}>
      <a href="/" style={{color:'#1565C0'}}>← DatalytIQs Analytics Lab</a>
      <p style={{letterSpacing:1.5,fontWeight:800,fontSize:12,marginTop:28}}>DATALYTIQS ACADEMY · CREDENTIAL VERIFICATION</p>
      <h1 style={{fontFamily:'Georgia,serif',fontSize:38,margin:'8px 0 18px'}}>Verify credential</h1>
      {error || !credential ? <>
        <span style={{display:'inline-block',padding:'7px 10px',background:'#FDECEC',color:'#9b2f2f',fontWeight:800,borderRadius:999}}>NOT FOUND</span>
        <p>No DatalytIQs credential matching <b>{credentialId}</b> could be verified.</p>
      </> : <>
        <span style={{display:'inline-block',padding:'7px 10px',background:valid?'#EAF7F0':'#FDECEC',color:valid?'#176248':'#9b2f2f',fontWeight:800,borderRadius:999}}>{valid?'VALID CREDENTIAL':credential.status.toUpperCase()}</span>
        <dl style={{display:'grid',gridTemplateColumns:'170px 1fr',gap:10,marginTop:24}}>
          <dt style={{color:'#657384'}}>Learner</dt><dd style={{margin:0,fontWeight:700}}>{credential.learner_name}</dd>
          <dt style={{color:'#657384'}}>Programme</dt><dd style={{margin:0,fontWeight:700}}>{credential.programme_title}</dd>
          <dt style={{color:'#657384'}}>Credential</dt><dd style={{margin:0,fontWeight:700}}>Certificate of Competence</dd>
          <dt style={{color:'#657384'}}>Certificate No.</dt><dd style={{margin:0,fontWeight:700}}>{credential.certificate_number}</dd>
          <dt style={{color:'#657384'}}>Credential ID</dt><dd style={{margin:0,fontWeight:700}}>{credential.credential_id}</dd>
          <dt style={{color:'#657384'}}>Result</dt><dd style={{margin:0,fontWeight:700}}>{credential.result}</dd>
          <dt style={{color:'#657384'}}>Issued</dt><dd style={{margin:0,fontWeight:700}}>{new Date(credential.issue_date).toLocaleDateString('en-KE')}</dd>
        </dl>
        {valid && <p style={{marginTop:26}}><a href={`/certificate/${credential.credential_id}`} style={{display:'inline-block',background:'#0B2C4D',color:'#fff',padding:'11px 16px',borderRadius:7,textDecoration:'none',fontWeight:800}}>View certificate</a></p>}
      </>}
    </section>
  </main>
}

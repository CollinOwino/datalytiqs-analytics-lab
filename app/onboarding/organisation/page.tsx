import { getOrganizationContext } from '../../../lib/organizations/context'
import { provisionPremiumOrganization, updateOrganizationConfiguration } from './actions'

export default async function OrganizationOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; org?: string }>
}) {
  const q = await searchParams
  const existing = await getOrganizationContext(q.org)

  return <main style={{maxWidth:1040,margin:'0 auto',padding:'48px 24px',color:'#0B2C4D'}}>
    <p style={{letterSpacing:2,fontSize:12}}>DATALYTIQS PREMIUM · EXECUTIVE ONBOARDING</p>
    <h1 style={{fontSize:44,marginBottom:8}}>{existing ? 'Configure your organisation' : 'Provision your organisation account'}</h1>
    <p style={{maxWidth:760,lineHeight:1.7}}>Set the organisation identity, learning priorities and executive reporting configuration. The signed-in executive becomes the initial CEO owner for a newly provisioned organisation.</p>
    {q.error && <p role="alert" style={{padding:14,background:'#fff3f3',border:'1px solid #f1caca'}}>{q.error}</p>}

    <form action={existing ? updateOrganizationConfiguration : provisionPremiumOrganization}
      style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20,marginTop:32,padding:28,border:'1px solid #d7dee7',borderRadius:16,background:'#fff'}}>
      {existing && <input type="hidden" name="organization_id" value={existing.organization.id}/>}
      <label>Organisation name
        <input name="name" required={!existing} disabled={!!existing} defaultValue={existing?.organization.name ?? ''} style={{display:'block',width:'100%',padding:12,marginTop:7}}/>
      </label>
      {!existing && <label>Workspace slug
        <input name="slug" placeholder="organisation-kenya" style={{display:'block',width:'100%',padding:12,marginTop:7}}/>
      </label>}
      <label>Sector
        <input name="sector" required defaultValue={existing?.organization.sector ?? ''} placeholder="Education, Health, NGO, Public Sector..." style={{display:'block',width:'100%',padding:12,marginTop:7}}/>
      </label>
      {!existing && <label>Country
        <input name="country" defaultValue="Kenya" style={{display:'block',width:'100%',padding:12,marginTop:7}}/>
      </label>}
      <label style={{gridColumn:'1 / -1'}}>Learning priorities
        <textarea name="learning_priorities" rows={4} defaultValue={existing?.settings?.learning_priorities.join(', ') ?? ''} placeholder="MERL, data analytics, evidence-based management, dashboarding" style={{display:'block',width:'100%',padding:12,marginTop:7}}/>
        <small>Separate priorities with commas.</small>
      </label>
      <label>Executive reporting period
        <select name="reporting_period" defaultValue={existing?.settings?.reporting_period ?? 'rolling_90_days'} style={{display:'block',width:'100%',padding:12,marginTop:7}}>
          <option value="rolling_30_days">Rolling 30 days</option>
          <option value="rolling_90_days">Rolling 90 days</option>
          <option value="quarter">Current quarter</option>
          <option value="year_to_date">Year to date</option>
        </select>
      </label>
      <div style={{display:'flex',alignItems:'end'}}>
        <button type="submit" style={{padding:'13px 20px',background:'#0B2C4D',color:'white',border:0,borderRadius:8,fontWeight:700}}>
          {existing ? 'Save executive configuration' : 'Provision premium organisation'}
        </button>
      </div>
    </form>

    <section style={{marginTop:32,padding:24,background:'#F6F8FB',borderRadius:14}}>
      <h2>What is activated</h2>
      <p>Premium organisation profile · CEO ownership · subscription shell · role-based membership · executive dashboard configuration · future team invitations.</p>
    </section>
  </main>
}

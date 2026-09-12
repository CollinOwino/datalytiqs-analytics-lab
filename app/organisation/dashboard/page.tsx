import { requireExecutiveOrganization } from '@/lib/organizations/context'
import { createClient } from '@/lib/supabase/server'

const widgetMeta = {
  workforce_learning: ['Workforce Learning','Assigned learning, active learners and participation'],
  competency_certification: ['Competency & Certification','Competency attainment and credentials'],
  analytics_activity: ['Analytics Lab Activity','Cases, executions and applied analytical work'],
  evidence_portfolio: ['Evidence & Portfolio','Submitted evidence and professional outputs'],
  organisation_impact: ['Organisation Impact','Outcome indicators connected to learning investment'],
} as const

export default async function OrganizationDashboard({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>
}) {
  const q = await searchParams
  const ctx = await requireExecutiveOrganization(q.org)
  const supabase = await createClient()

  const { count: memberCount } = await supabase
    .from('organization_members')
    .select('*',{count:'exact',head:true})
    .eq('organization_id',ctx.organization.id)
    .eq('status','active')

  const configured = ctx.settings?.dashboard_config?.widgets ?? Object.keys(widgetMeta)
  const seats = ctx.subscription?.seats ?? 0
  const utilisation = seats ? Math.round(((memberCount ?? 0) / seats) * 100) : 0

  return <main style={{maxWidth:1220,margin:'0 auto',padding:'36px 24px',color:'#0B2C4D'}}>
    <header style={{display:'flex',justifyContent:'space-between',gap:24,alignItems:'start',flexWrap:'wrap'}}>
      <div>
        <p style={{letterSpacing:2,fontSize:12}}>DATALYTIQS PREMIUM · CEO COMMAND CENTRE</p>
        <h1 style={{fontSize:42,margin:'8px 0'}}>{ctx.organization.name}</h1>
        <p>{ctx.organization.sector || 'Organisation'} · {ctx.organization.country} · {ctx.subscription?.plan?.toUpperCase() ?? 'PREMIUM'}</p>
      </div>
      <div style={{textAlign:'right'}}>
        <b>{ctx.membership.role === 'ceo' ? 'CEO' : 'Organisation Admin'}</b><br/>
        <a href={'/onboarding/organisation?org='+ctx.organization.id}>Configure organisation →</a>
      </div>
    </header>

    <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14,margin:'30px 0'}}>
      <Metric label="Active members" value={String(memberCount ?? 0)} note="Provisioned organisation users"/>
      <Metric label="Premium seats" value={String(seats)} note={String(utilisation)+'% seat utilisation'}/>
      <Metric label="Subscription" value={ctx.subscription?.status ?? 'not set'} note={ctx.subscription?.plan ?? 'premium'}/>
      <Metric label="Organisation status" value={ctx.organization.onboarding_status} note={ctx.settings?.reporting_period ?? 'rolling_90_days'}/>
    </section>

    <section style={{padding:22,border:'1px solid #d7dee7',borderRadius:14,marginBottom:28}}>
      <p style={{fontSize:12,letterSpacing:1.5}}>LEARNING PRIORITIES</p>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {(ctx.settings?.learning_priorities?.length ? ctx.settings.learning_priorities : ['Configure priorities']).map(p =>
          <span key={p} style={{background:'#F6F8FB',padding:'8px 12px',borderRadius:999}}>{p}</span>)}
      </div>
    </section>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:18}}>
      {configured.map(key => {
        const meta = widgetMeta[key as keyof typeof widgetMeta]
        if (!meta) return null
        return <article key={key} style={{minHeight:190,padding:24,border:'1px solid #d7dee7',borderRadius:14,background:'white'}}>
          <p style={{fontSize:12,letterSpacing:1.5}}>EXECUTIVE VIEW</p>
          <h2>{meta[0]}</h2>
          <p style={{lineHeight:1.6}}>{meta[1]}</p>
          <div style={{marginTop:24,padding:12,background:'#F6F8FB',borderRadius:8}}>
            Stage 01 shell active. Organisation-specific metrics will be wired in Stage 02.
          </div>
        </article>
      })}
    </div>

    <section style={{marginTop:32,padding:24,background:'#0B2C4D',color:'white',borderRadius:14}}>
      <h2>Executive operating model</h2>
      <p>Learn → Practise → Collaborate → Apply. The next pass connects Academy enrolments, MERL competency, Analytics Lab activity, evidence portfolios and organisation-level impact indicators to these executive views.</p>
    </section>
  </main>
}

function Metric({label,value,note}:{label:string;value:string;note:string}) {
  return <article style={{padding:20,border:'1px solid #d7dee7',borderRadius:12,background:'#fff'}}>
    <span style={{fontSize:12,letterSpacing:1}}>{label.toUpperCase()}</span>
    <strong style={{display:'block',fontSize:30,margin:'8px 0',textTransform:'capitalize'}}>{value}</strong>
    <small>{note}</small>
  </article>
}

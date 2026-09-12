import ExecutiveShell from '../_components/ExecutiveShell'
import { getExecutiveContext } from '../../../lib/executive/context'

export default async function OrganizationPage({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  const q = await searchParams
  const ctx = await getExecutiveContext(q.org)
  const orgId = ctx.selected?.id
  if (!orgId) return <ExecutiveShell organizations={ctx.organizations} selectedId={null} role={ctx.membership?.role} currentPath="/executive/organization"><section className="exec-page"><div className="exec-empty"><h3>No organisation selected</h3></div></section></ExecutiveShell>

  const [{ data: members }, { data: settings }, { data: workspaces }, { data: integrations }] = await Promise.all([
    ctx.supabase.from('organization_members').select('user_id,role,job_title,status,joined_at').eq('organization_id',orgId).order('joined_at'),
    ctx.supabase.from('organization_settings').select('*').eq('organization_id',orgId).maybeSingle(),
    ctx.supabase.from('executive_workspaces').select('id,name,workspace_type,status,created_at').eq('organization_id',orgId).order('created_at'),
    ctx.supabase.from('executive_integrations').select('id,integration_type,name,status,created_at').eq('organization_id',orgId).order('created_at'),
  ])

  return <ExecutiveShell organizations={ctx.organizations} selectedId={orgId} role={ctx.membership?.role} currentPath="/executive/organization">
    <section className="exec-page">
      <div className="exec-section-head"><div><span className="eyebrow">TENANCY & GOVERNANCE</span><h2>Organisation Workspace</h2><p>Membership, executive workspaces, reporting context and ecosystem integration readiness.</p></div></div>
      <section className="exec-grid">
        <article className="exec-stat"><small>MEMBERS</small><strong>{members?.length || 0}</strong><span>Active organisational identities</span></article>
        <article className="exec-stat"><small>WORKSPACES</small><strong>{workspaces?.length || 0}</strong><span>Executive operating contexts</span></article>
        <article className="exec-stat"><small>REPORTING</small><strong style={{fontSize:20}}>{settings?.reporting_period || '—'}</strong><span>{settings?.timezone || 'Africa/Nairobi'}</span></article>
        <article className="exec-stat"><small>INTEGRATIONS</small><strong>{integrations?.length || 0}</strong><span>Configured ecosystem links</span></article>
      </section>

      <div className="exec-columns">
        <section className="exec-panel">
          <h3>Workspaces</h3>
          <div className="exec-table-wrap"><table className="exec-table"><thead><tr><th>NAME</th><th>TYPE</th><th>STATUS</th></tr></thead><tbody>{(workspaces||[]).map((w:any)=><tr key={w.id}><td>{w.name}</td><td>{w.workspace_type}</td><td><span className={`exec-badge ${w.status==='active'?'good':'neutral'}`}>{w.status}</span></td></tr>)}</tbody></table></div>
        </section>
        <section className="exec-panel">
          <h3>Membership & roles</h3>
          <div className="exec-list">{(members||[]).map((m:any)=><article key={m.user_id}><h4>{m.job_title || 'Organisation member'}</h4><p>User identity protected by Supabase Auth.</p><div className="meta"><span>{m.role}</span><span>{m.status}</span></div></article>)}</div>
        </section>
      </div>

      <section className="exec-panel" style={{marginTop:20}}>
        <h3>Ecosystem integration architecture</h3>
        <div className="exec-grid" style={{marginBottom:0}}>
          <article className="exec-stat"><small>ACADEMY</small><strong style={{fontSize:18}}>Capability</strong><span>Learning recommendations from organizational gaps</span></article>
          <article className="exec-stat"><small>ANALYTICS LAB</small><strong style={{fontSize:18}}>Evidence</strong><span>Hand off analysis cases and return governed outputs</span></article>
          <article className="exec-stat"><small>COMMUNITY</small><strong style={{fontSize:18}}>Collaboration</strong><span>Controlled peer and facilitator workspaces</span></article>
          <article className="exec-stat"><small>CONSULTANCY</small><strong style={{fontSize:18}}>Escalation</strong><span>Expert support for high-stakes decisions</span></article>
        </div>
      </section>
    </section>
  </ExecutiveShell>
}

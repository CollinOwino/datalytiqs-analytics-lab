import ExecutiveShell from './_components/ExecutiveShell'
import { getExecutiveContext, withOrg } from '../../lib/executive/context'
import { provisionExecutivePilot } from './actions'

export default async function ExecutivePage({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  const q = await searchParams
  const ctx = await getExecutiveContext(q.org)

  if (!ctx.selected) {
    return <ExecutiveShell organizations={ctx.organizations} selectedId={null} role={null} currentPath="/executive">
      <section className="exec-page">
        <div className="exec-pilot">
          <span className="eyebrow">STAGE 02 PRODUCTION PILOT</span>
          <h2>Create the Executive Decision Workspace</h2>
          <p>Provision a secure pilot organisation with synthetic KPI data, validated insight, an approved executive decision, accountable actions and a draft executive brief.</p>
          <form action={provisionExecutivePilot}><button type="submit">Provision executive pilot</button></form>
        </div>
      </section>
    </ExecutiveShell>
  }

  const orgId = ctx.selected.id
  const [{ data: summary }, { data: kpis }, { data: decisions }, { data: actions }] = await Promise.all([
    ctx.supabase.rpc('executive_dashboard_summary', { p_organization_id: orgId }),
    ctx.supabase.from('executive_kpi_latest').select('*').eq('organization_id', orgId).order('code'),
    ctx.supabase.from('executive_decisions').select('id,title,status,priority,review_date,updated_at').eq('organization_id', orgId).order('updated_at', { ascending: false }).limit(5),
    ctx.supabase.from('executive_action_register').select('*').eq('organization_id', orgId).order('due_date', { ascending: true }).limit(6),
  ])

  const s = summary || {}
  return <ExecutiveShell organizations={ctx.organizations} selectedId={orgId} role={ctx.membership?.role} currentPath="/executive">
    <section className="exec-page">
      <section className="exec-hero">
        <div><span className="eyebrow gold">EXECUTIVE COCKPIT</span><h2>Evidence → insight → decision → accountable action.</h2><p>One governed view of organisational performance, emerging risks, management decisions and execution follow-through.</p></div>
        <div className="exec-cycle">ONBOARD → INGEST → MEASURE → ANALYSE → INTERPRET → DECIDE → ACT → REVIEW → LEARN</div>
      </section>

      <section className="exec-grid">
        <article className="exec-stat"><small>ACTIVE KPIs</small><strong>{s.active_kpis ?? 0}</strong><span>Current executive measures</span></article>
        <article className="exec-stat critical"><small>CRITICAL KPIs</small><strong>{s.critical_kpis ?? 0}</strong><span>Require executive attention</span></article>
        <article className="exec-stat watch"><small>DECISIONS PENDING</small><strong>{s.decisions_pending ?? 0}</strong><span>Awaiting governance action</span></article>
        <article className="exec-stat"><small>OPEN ACTIONS</small><strong>{s.open_actions ?? 0}</strong><span>{s.overdue_actions ?? 0} overdue</span></article>
      </section>

      <div className="exec-columns">
        <section className="exec-panel">
          <div className="exec-section-head"><div><h2>KPI health</h2><p>Latest governed observations</p></div><a href={withOrg('/executive/kpis',orgId)}>Open KPI Centre →</a></div>
          <div className="exec-table-wrap"><table className="exec-table"><thead><tr><th>KPI</th><th>VALUE</th><th>TARGET</th><th>STATUS</th></tr></thead><tbody>
            {(kpis || []).map((k:any)=><tr key={k.kpi_id}><td><strong>{k.name}</strong><br/><small>{k.code}</small></td><td>{k.value ?? '—'} {k.unit}</td><td>{k.effective_target ?? '—'}</td><td><span className={`exec-badge ${k.status || 'neutral'}`}>{k.status || 'neutral'}</span></td></tr>)}
          </tbody></table></div>
        </section>

        <section className="exec-panel">
          <div className="exec-section-head"><div><h2>Decision queue</h2><p>Recent executive decisions</p></div><a href={withOrg('/executive/decisions',orgId)}>Register →</a></div>
          <div className="exec-list">{(decisions || []).map((d:any)=><article key={d.id}><h4>{d.title}</h4><p>{d.priority} priority</p><div className="meta"><span className={`exec-badge ${d.status}`}>{d.status}</span>{d.review_date && <span>Review {d.review_date}</span>}</div></article>)}</div>
        </section>
      </div>

      <section className="exec-panel" style={{marginTop:20}}>
        <div className="exec-section-head"><div><h2>Action accountability</h2><p>Execution status against approved decisions</p></div><a href={withOrg('/executive/actions',orgId)}>Open action register →</a></div>
        <div className="exec-table-wrap"><table className="exec-table"><thead><tr><th>ACTION</th><th>DECISION</th><th>DUE</th><th>PROGRESS</th><th>STATUS</th></tr></thead><tbody>
          {(actions || []).map((a:any)=><tr key={a.id}><td>{a.title}</td><td>{a.decision_title}</td><td>{a.due_date || '—'}</td><td>{a.progress_percent}%</td><td><span className={`exec-badge ${a.status}`}>{a.status}</span>{a.overdue ? ' · overdue' : ''}</td></tr>)}
        </tbody></table></div>
      </section>
    </section>
  </ExecutiveShell>
}

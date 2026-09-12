import ExecutiveShell from '../_components/ExecutiveShell'
import { getExecutiveContext } from '../../../lib/executive/context'
import { createDecision } from '../actions'

export default async function DecisionsPage({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  const q = await searchParams
  const ctx = await getExecutiveContext(q.org)
  const orgId = ctx.selected?.id
  if (!orgId) return <ExecutiveShell organizations={ctx.organizations} selectedId={null} role={ctx.membership?.role} currentPath="/executive/decisions"><section className="exec-page"><div className="exec-empty"><h3>No organisation selected</h3></div></section></ExecutiveShell>

  const [{ data: decisions }, { data: workspaces }] = await Promise.all([
    ctx.supabase.from('executive_decisions').select('*').eq('organization_id',orgId).order('created_at',{ascending:false}),
    ctx.supabase.from('executive_workspaces').select('id,name').eq('organization_id',orgId).eq('status','active').order('name'),
  ])

  return <ExecutiveShell organizations={ctx.organizations} selectedId={orgId} role={ctx.membership?.role} currentPath="/executive/decisions">
    <section className="exec-page">
      <div className="exec-section-head"><div><span className="eyebrow">GOVERNANCE</span><h2>Decision Register</h2><p>Record the decision, evidence-based rationale, ownership and review horizon.</p></div></div>
      <div className="exec-columns">
        <section className="exec-list">
          {(decisions || []).map((d:any)=><article key={d.id}><h4>{d.title}</h4><p>{d.decision_statement}</p><div className="meta"><span className={`exec-badge ${d.status}`}>{d.status}</span><span>{d.priority} priority</span>{d.review_date&&<span>Review {d.review_date}</span>}</div></article>)}
          {!decisions?.length && <div className="exec-empty"><h3>No decisions recorded</h3><p>Create the first governed executive decision.</p></div>}
        </section>
        <section className="exec-form-card">
          <h3>Propose executive decision</h3>
          <form action={createDecision} className="exec-form">
            <input type="hidden" name="organization_id" value={orgId}/>
            <label>Workspace<select name="workspace_id"><option value="">Organisation-wide</option>{(workspaces||[]).map((w:any)=><option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
            <label>Decision title<input name="title" required/></label>
            <label>Decision statement<textarea name="decision_statement" required/></label>
            <label>Evidence-based rationale<textarea name="rationale" required/></label>
            <label>Priority<select name="priority"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
            <label>Review date<input name="review_date" type="date"/></label>
            <button className="exec-submit" type="submit">Record proposed decision</button>
          </form>
        </section>
      </div>
    </section>
  </ExecutiveShell>
}

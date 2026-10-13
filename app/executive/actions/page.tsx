import ExecutiveShell from '../_components/ExecutiveShell'
import { getExecutiveContext } from '../../../lib/executive/context'
import { createAction } from '../actions'

export default async function ActionsPage({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  const q = await searchParams
  const ctx = await getExecutiveContext(q.org)
  const orgId = ctx.selected?.id
  if (!orgId) return <ExecutiveShell organizations={ctx.organizations} selectedId={null} role={ctx.membership?.role} currentPath="/executive/actions"><section className="exec-page"><div className="exec-empty"><h3>No organisation selected</h3></div></section></ExecutiveShell>

  const [{ data: actions }, { data: decisions }] = await Promise.all([
    ctx.supabase.from('executive_action_register').select('*').eq('organization_id',orgId).order('due_date',{ascending:true}),
    ctx.supabase.from('executive_decisions').select('id,title,status').eq('organization_id',orgId).in('status',['approved','implemented','proposed']).order('created_at',{ascending:false}),
  ])

  return <ExecutiveShell organizations={ctx.organizations} selectedId={orgId} role={ctx.membership?.role} currentPath="/executive/actions">
    <section className="exec-page">
      <div className="exec-section-head"><div><span className="eyebrow">EXECUTION CONTROL</span><h2>Action Register</h2><p>Translate decisions into owned, time-bound implementation commitments.</p></div></div>
      <div className="exec-columns">
        <section className="exec-list">
          {(actions || []).map((a:any)=><article className={a.overdue?'exec-action-overdue':''} key={a.id}><h4>{a.title}</h4><p>{a.description || a.expected_result || 'No description supplied.'}</p><div className="meta"><span className={`exec-badge ${a.status}`}>{a.status}</span><span>{a.progress_percent}% complete</span>{a.due_date&&<span>Due {a.due_date}</span>}{a.overdue&&<span>OVERDUE</span>}</div></article>)}
          {!actions?.length && <div className="exec-empty"><h3>No actions recorded</h3></div>}
        </section>
        <section className="exec-form-card">
          <h3>Create accountable action</h3>
          <form action={createAction} className="exec-form">
            <input type="hidden" name="organization_id" value={orgId}/>
            <label>Decision<select name="decision_id" required>{(decisions||[]).map((d:any)=><option key={d.id} value={d.id}>{d.title}</option>)}</select></label>
            <label>Action title<input name="title" required/></label>
            <label>Description<textarea name="description"/></label>
            <label>Expected result<textarea name="expected_result"/></label>
            <label>Due date<input name="due_date" type="date"/></label>
            <button className="exec-submit" type="submit">Assign action to me</button>
          </form>
        </section>
      </div>
    </section>
  </ExecutiveShell>
}

import ExecutiveShell from '../_components/ExecutiveShell'
import { getExecutiveContext } from '../../../lib/executive/context'
import { createEvidence } from '../actions'

export default async function DataPage({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  const q = await searchParams
  const ctx = await getExecutiveContext(q.org)
  const orgId = ctx.selected?.id
  if (!orgId) return <ExecutiveShell organizations={ctx.organizations} selectedId={null} role={ctx.membership?.role} currentPath="/executive/data"><section className="exec-page"><div className="exec-empty"><h3>No organisation selected</h3></div></section></ExecutiveShell>

  const [{ data: sources }, { data: evidence }, { data: workspaces }] = await Promise.all([
    ctx.supabase.from('executive_data_sources').select('*').eq('organization_id',orgId).order('created_at',{ascending:false}),
    ctx.supabase.from('executive_evidence').select('*').eq('organization_id',orgId).order('created_at',{ascending:false}).limit(20),
    ctx.supabase.from('executive_workspaces').select('id,name').eq('organization_id',orgId).eq('status','active').order('name'),
  ])

  return <ExecutiveShell organizations={ctx.organizations} selectedId={orgId} role={ctx.membership?.role} currentPath="/executive/data">
    <section className="exec-page">
      <div className="exec-section-head"><div><span className="eyebrow">EVIDENCE GOVERNANCE</span><h2>Data & Evidence Hub</h2><p>Register the sources and evidence that support analytical findings and management decisions.</p></div></div>
      <section className="exec-panel">
        <h3>Registered data sources</h3>
        <div className="exec-table-wrap"><table className="exec-table"><thead><tr><th>SOURCE</th><th>TYPE</th><th>REFRESH</th><th>CLASSIFICATION</th></tr></thead><tbody>
          {(sources||[]).map((s:any)=><tr key={s.id}><td>{s.name}</td><td>{s.source_type}</td><td>{s.refresh_cadence}</td><td>{s.classification}</td></tr>)}
        </tbody></table></div>
      </section>
      <div className="exec-columns" style={{marginTop:20}}>
        <section className="exec-list">
          {(evidence||[]).map((e:any)=><article key={e.id}><h4>{e.title}</h4><p>{e.summary || 'No summary supplied.'}</p><div className="meta"><span>{e.evidence_type}</span><span>{e.classification}</span><span>{new Date(e.created_at).toLocaleDateString('en-KE')}</span></div></article>)}
          {!evidence?.length&&<div className="exec-empty"><h3>No evidence registered</h3></div>}
        </section>
        <section className="exec-form-card">
          <h3>Register evidence</h3>
          <form action={createEvidence} className="exec-form">
            <input type="hidden" name="organization_id" value={orgId}/>
            <label>Workspace<select name="workspace_id"><option value="">Organisation-wide</option>{(workspaces||[]).map((w:any)=><option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
            <label>Evidence type<select name="evidence_type"><option value="dataset">Dataset</option><option value="document">Document</option><option value="analysis">Analysis</option><option value="dashboard">Dashboard</option><option value="meeting_note">Meeting note</option><option value="field_report">Field report</option><option value="external_source">External source</option><option value="other">Other</option></select></label>
            <label>Title<input name="title" required/></label>
            <label>Summary<textarea name="summary" required/></label>
            <label>Classification<select name="classification"><option value="internal">Internal</option><option value="confidential">Confidential</option><option value="restricted">Restricted</option><option value="public">Public</option></select></label>
            <button className="exec-submit" type="submit">Register evidence</button>
          </form>
        </section>
      </div>
    </section>
  </ExecutiveShell>
}

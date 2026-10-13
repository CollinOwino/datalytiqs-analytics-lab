import ExecutiveShell from '../_components/ExecutiveShell'
import { getExecutiveContext } from '../../../lib/executive/context'
import { recordKpiObservation } from '../actions'

export default async function KpiPage({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  const q = await searchParams
  const ctx = await getExecutiveContext(q.org)
  const orgId = ctx.selected?.id
  if (!orgId) return <ExecutiveShell organizations={ctx.organizations} selectedId={null} role={ctx.membership?.role} currentPath="/executive/kpis"><section className="exec-page"><div className="exec-empty"><h3>No organisation selected</h3><p>Provision the executive pilot from the cockpit first.</p></div></section></ExecutiveShell>

  const { data: kpis } = await ctx.supabase.from('executive_kpi_latest').select('*').eq('organization_id', orgId).order('code')

  return <ExecutiveShell organizations={ctx.organizations} selectedId={orgId} role={ctx.membership?.role} currentPath="/executive/kpis">
    <section className="exec-page">
      <div className="exec-section-head"><div><span className="eyebrow">PERFORMANCE CONTROL</span><h2>KPI Centre</h2><p>Define, observe and govern the measures used in executive decisions.</p></div></div>
      <section className="exec-panel">
        <div className="exec-table-wrap"><table className="exec-table"><thead><tr><th>CODE</th><th>KPI</th><th>LATEST</th><th>TARGET</th><th>PERIOD</th><th>STATUS</th></tr></thead><tbody>
          {(kpis || []).map((k:any)=><tr key={k.kpi_id}><td>{k.code}</td><td><strong>{k.name}</strong><br/><small>{k.definition}</small></td><td>{k.value ?? '—'} {k.unit}</td><td>{k.effective_target ?? '—'}</td><td>{k.period_end || '—'}</td><td><span className={`exec-badge ${k.status || 'neutral'}`}>{k.status || 'neutral'}</span></td></tr>)}
        </tbody></table></div>
      </section>
      <section className="exec-form-card" style={{marginTop:20}}>
        <h3>Record KPI observation</h3>
        <form action={recordKpiObservation} className="exec-form cols">
          <input type="hidden" name="organization_id" value={orgId}/>
          <label>KPI<select name="kpi_id" required>{(kpis || []).map((k:any)=><option key={k.kpi_id} value={k.kpi_id}>{k.code} — {k.name}</option>)}</select></label>
          <label>Value<input name="value" type="number" step="any" required/></label>
          <label>Period start<input name="period_start" type="date" required/></label>
          <label>Period end<input name="period_end" type="date" required/></label>
          <label>Target value<input name="target_value" type="number" step="any"/></label>
          <label>Status<select name="status"><option value="good">Good</option><option value="watch">Watch</option><option value="critical">Critical</option><option value="neutral">Neutral</option></select></label>
          <div className="span-2"><button className="exec-submit" type="submit">Save observation</button></div>
        </form>
      </section>
    </section>
  </ExecutiveShell>
}

import type { CategorySummary, NumericSummary } from '../descriptive'

type Profile = {
  id: string; name: string; source_filename: string; row_count: number;
  sheet_name: string | null; uploaded_at: string;
  analysis?: { interpretation: string; findings: {
    quality?: { missing_cells: number; duplicate_rows: number; columns: number; source_sha256?: string };
    summaries?: NumericSummary[]; categories?: CategorySummary[]
  } } | null
}
const fmt = (value: number) => value.toLocaleString('en-KE', { maximumFractionDigits: 2 })

export default function DatasetProfile({ datasets }: { datasets: Profile[] }) {
  if (!datasets.length) return <div className="ceo-empty-state"><strong>No datasets analysed yet.</strong><p>Upload a CSV or Excel file to see its descriptive profile and graphs.</p></div>
  return <div className="ceo-record-list">
    {datasets.map(dataset => {
      const findings = dataset.analysis?.findings
      return <article className="ceo-record minutes-data-profile" key={dataset.id}>
        <div className="ceo-record-meta"><span className="ceo-status">DESCRIPTIVE PROFILE</span><time>{new Date(dataset.uploaded_at).toLocaleString('en-KE')}</time></div>
        <h3>{dataset.name}</h3>
        <p className="ceo-record-footnote">{dataset.source_filename} · {dataset.sheet_name || 'First worksheet'} · {fmt(dataset.row_count)} rows · {fmt(findings?.quality?.columns || 0)} columns · {fmt(findings?.quality?.missing_cells || 0)} missing cells · {fmt(findings?.quality?.duplicate_rows || 0)} duplicate rows</p>
        {findings?.quality?.source_sha256 && <p className="ceo-record-footnote">Source SHA-256: <code>{findings.quality.source_sha256}</code></p>}
        {dataset.analysis ? <>
          <p>{dataset.analysis.interpretation}</p>
          {!!findings?.summaries?.length && <div className="minutes-profile-grid">
            {findings.summaries.slice(0, 12).map(metric => {
              const position = metric.max === metric.min ? 50 : Math.max(0, Math.min(100, (metric.mean - metric.min) / (metric.max - metric.min) * 100))
              return <figure className="minutes-metric-chart" key={metric.column} aria-label={`${metric.column}: range ${fmt(metric.min)} to ${fmt(metric.max)}, mean ${fmt(metric.mean)}`}>
                <figcaption>{metric.column}</figcaption>
                <strong>Mean {fmt(metric.mean)}</strong><span>Median {fmt(metric.median)} · SD {fmt(metric.standard_deviation)}</span>
                <div className="minutes-range" aria-hidden="true"><i style={{ left: `${position}%` }} /></div>
                <div className="minutes-range-labels"><small>Min {fmt(metric.min)}</small><small>Max {fmt(metric.max)}</small></div>
                <small>{fmt(metric.count)} valid · {fmt(metric.missing)} missing · middle 50%: {fmt(metric.q1)}–{fmt(metric.q3)}</small>
              </figure>
            })}
          </div>}
          {!!findings?.categories?.length && <div className="minutes-profile-grid">
            {findings.categories.filter(c => c.counts.length > 0).slice(0, 4).map(category => <figure className="minutes-category-chart" key={category.column}>
              <figcaption>{category.column} · most frequent values</figcaption>
              {category.counts.map(entry => <div className="minutes-bar-row" key={entry.label}><span title={entry.label}>{entry.label}</span><div className="minutes-bar-track"><i style={{ width: `${entry.count / category.counts[0].count * 100}%` }} /></div><b>{fmt(entry.count)}</b></div>)}
              <small>{category.other ? `${fmt(category.other)} records in other categories · ` : ''}{fmt(category.missing)} missing</small>
            </figure>)}
          </div>}
          {(findings?.summaries?.length || 0) > 12 && <p className="ceo-record-footnote">Showing the first 12 numeric fields of {findings?.summaries?.length}. The complete profile is available in the command centre.</p>}
        </> : <p>Analysis is still being prepared. Refresh the page shortly.</p>}
      </article>
    })}
  </div>
}

'use client'

import { useState } from 'react'

// Entirely fictional counts; this exercise contains no learner records.
const rows = [
  { week: 'Week 1', fiction: 8, science: 3, history: 2 },
  { week: 'Week 2', fiction: 11, science: 5, history: 2 },
  { week: 'Week 3', fiction: 9, science: 4, history: 3 },
  { week: 'Week 4', fiction: 12, science: 6, history: 1 },
]
const genres = ['fiction', 'science', 'history'] as const
const totals = genres.map(g => rows.reduce((sum, row) => sum + row[g], 0))

export default function LibraryChallenge() {
  const [fiction, setFiction] = useState('')
  const [median, setMedian] = useState('')
  const [genre, setGenre] = useState('')
  const [reason, setReason] = useState('')
  const [checked, setChecked] = useState(false)
  const results = [
    { ok: fiction.trim() !== '' && Number(fiction) === totals[0], hint: 'Add 8, 11, 9 and 12 for the fiction total.', success: 'Fiction total: correct.' },
    { ok: median.trim() !== '' && Number(median) === 10, hint: 'Order 8, 9, 11, 12 and average the middle two.', success: 'Median: correct.' },
    { ok: genre === 'fiction', hint: 'Compare all three genre totals.', success: 'Highest genre: correct.' },
    { ok: reason.trim().length >= 35, hint: 'Add an explanation with a count and a limitation.', success: 'Reflection is long enough for instructor discussion. Check its evidence and limitation.' },
  ]
  return <div className="school-challenge">
    <div className="school-challenge-hero"><p className="school-eyebrow">SYNTHETIC DATA · 25 MINUTES</p><h1>Which books should the library consider buying?</h1><p>Our fictional library recorded books borrowed in four weeks. Check the data, calculate a typical week, and make a careful recommendation.</p><p><strong>Privacy rule:</strong> Never upload real borrowing records or identify a classmate here.</p></div>
    <section aria-labelledby="library-data"><h2 id="library-data">1. Inspect the evidence</h2><p>Each cell counts books borrowed in that genre during one week.</p><div className="school-table-wrap"><table><caption>Fictional school library borrowing counts</caption><thead><tr><th scope="col">Week</th><th scope="col">Fiction</th><th scope="col">Science</th><th scope="col">History</th></tr></thead><tbody>{rows.map(row => <tr key={row.week}><th scope="row">{row.week}</th><td>{row.fiction}</td><td>{row.science}</td><td>{row.history}</td></tr>)}</tbody></table></div><details><summary>How do I find a median?</summary><p>Order the four weekly fiction counts. The median is the average of the middle two values.</p></details></section>
    <section aria-labelledby="library-questions"><h2 id="library-questions">2. Calculate and explain</h2><div className="school-inputs"><label>Total fiction borrowing across four weeks<input inputMode="numeric" type="number" min="0" value={fiction} onChange={e => { setFiction(e.target.value); setChecked(false) }} /></label><label>Median weekly fiction count<input inputMode="decimal" type="number" min="0" step="any" value={median} onChange={e => { setMedian(e.target.value); setChecked(false) }} /></label><label>Genre with the most borrowing<select value={genre} onChange={e => { setGenre(e.target.value); setChecked(false) }}><option value="">Choose a genre</option>{genres.map(g => <option key={g} value={g}>{g[0].toUpperCase() + g.slice(1)}</option>)}</select></label><label className="school-wide">Recommend a next step. Cite at least one count and a limitation of four weeks of data.<textarea rows={4} maxLength={800} value={reason} onChange={e => { setReason(e.target.value); setChecked(false) }} placeholder="Compare borrowing with available stock before purchasing..." /></label></div><button className="school-primary school-check" type="button" onClick={() => setChecked(true)}>Check my work</button>{checked && <div className="school-feedback" role="status"><h3>{results.filter(r => r.ok).length} of 4 checks ready</h3><ul>{results.map((r, i) => <li key={i}>{r.ok ? `✓ ${r.success}` : r.hint}</li>)}</ul><p>This practice check stays in this browser session; it is not an instructor grade or a saved submission.</p></div>}</section>
    <section aria-labelledby="library-chart"><h2 id="library-chart">3. Compare the chart</h2><p>Totals across four weeks: {totals.reduce((a, b) => a + b, 0)} books. Every bar starts at zero.</p><div className="school-chart" role="img" aria-label={`Fiction ${totals[0]}, science ${totals[1]}, history ${totals[2]} books borrowed.`}>{genres.map((g, i) => <div key={g}><span>{g}</span><div className="school-bar-track"><i style={{ width: `${totals[i] / totals[0] * 100}%` }} /></div><strong>{totals[i]}</strong></div>)}</div><details><summary>What might the chart leave out?</summary><p>The library may own different numbers of books in each genre. Four weeks cannot prove long-term demand. Ask for stock and a longer observation period before purchasing.</p></details></section>
  </div>
}

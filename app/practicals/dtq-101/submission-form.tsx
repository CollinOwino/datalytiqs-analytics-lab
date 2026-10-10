'use client'
import { useRef, useState } from 'react'

type Initial = {
  status: string; summary: string; score: number | null; reviewer_feedback: string | null;
  questionnaire_path: string | null; codebook_path: string | null; pilot_note_path: string | null;
  rubric_scores?: Record<string, number> | null;
}
export function DTQSubmissionForm({ initial }: { initial: Initial | null }) {
  const form = useRef<HTMLFormElement>(null)
  const [state, setState] = useState(initial?.status || 'new')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const locked = state === 'submitted' || state === 'graded'
  const items = [
    ['questionnaire', 'Questionnaire (PDF, DOCX or TXT)', initial?.questionnaire_path],
    ['codebook', 'Codebook (PDF, DOCX, XLSX, CSV or TXT)', initial?.codebook_path],
    ['pilot_note', 'Pilot-revision note (PDF, DOCX or TXT)', initial?.pilot_note_path],
  ] as const
  async function send(intent: 'draft' | 'submit') {
    if (!form.current || saving || locked) return
    const data = new FormData(form.current)
    data.append('intent', intent)
    setSaving(true); setMessage('')
    try {
      const response = await fetch('/api/practicals/dtq-101/submissions', { method: 'POST', body: data })
      const result = await response.json()
      setMessage(result.message || 'Unexpected server response.')
      if (response.ok) {
        setState(result.status)
        // Refresh server-rendered evidence links and verified submission status.
        window.location.reload()
      }
    } catch { setMessage('Network error. Your submission has not been confirmed.') }
    finally { setSaving(false) }
  }
  return <section id="dtq-submission" style={{ marginTop: 32, background: 'white', color: '#0b2c4d', border: '1px solid #dbe4ec', borderRadius: 8, padding: 24 }}>
    <h2>Submit your DTQ-101 practical</h2>
    <p aria-live="polite">Status: <strong>{state.replace('_', ' ')}</strong></p>
    {initial?.reviewer_feedback && <aside style={{ padding: 12, borderLeft: '4px solid #1565c0' }}>
      <h3>Instructor feedback</h3><p>{initial.reviewer_feedback}</p>
      {initial.score !== null && <p>Grade: {initial.score}/100</p>}
      {initial.rubric_scores && <ul>{Object.entries(initial.rubric_scores).map(([key, score]) =>
        <li key={key}>{key.replace('_', ' ')}: {score}</li>)}</ul>}
    </aside>}
    {state === 'submitted' && <p role="status">Your evidence is awaiting instructor assessment.</p>}
    {state === 'graded' && <p role="status">Assessment completed. Your evidence remains available below.</p>}
    <form ref={form} onSubmit={e => { e.preventDefault(); void send('submit') }} style={{ display: 'grid', gap: 14 }}>
      <label>Decision problem and summary of your pilot (80–3,000 characters for final submission)
        <textarea name="summary" defaultValue={initial?.summary || ''} maxLength={3000}
          disabled={locked} style={{ display: 'block', width: '100%', minHeight: 120 }} />
      </label>
      {items.map(([kind, label, existing]) => <label key={kind}>
        {label} {existing && <a style={{ marginLeft: 8 }} href={`/api/practicals/dtq-101/evidence?kind=${kind}`}>View existing evidence ↗</a>}
        <input name={kind} type="file" accept=".pdf,.docx,.xlsx,.csv,.txt" disabled={locked}
          style={{ display: 'block', marginTop: 6 }} />
      </label>)}
      <p>Each file: maximum 1 MB. Files are held in private storage; previously uploaded files remain unless replaced.</p>
      {!locked && <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" disabled={saving} onClick={() => void send('draft')}>Save draft</button>
        <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Submit final evidence'}</button>
      </div>}
      {message && <p role="status">{message}</p>}
    </form>
  </section>
}

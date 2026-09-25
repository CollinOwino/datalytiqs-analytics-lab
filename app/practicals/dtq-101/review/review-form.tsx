'use client'
import { FormEvent, useState } from 'react'

export function ReviewForm({ id, code }: { id: string; code: string }) {
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const limits = [
    ['questionnaire', 'Questionnaire design', 40],
    ['codebook', 'Codebook completeness', 25],
    ['pilot', 'Pilot and revisions', 20],
    ['interpretation', 'Methodological justification', 15],
  ] as const
  async function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true); setMessage('')
    const data = new FormData(event.currentTarget)
    const rubric = Object.fromEntries(limits.map(([key]) => [key, Number(data.get(key))]))
    try {
      const response = await fetch('/api/practicals/dtq-101/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, rubric, feedback: data.get('feedback'), determination: data.get('determination') }),
      })
      const result = await response.json()
      setMessage(result.message || (response.ok ? 'Saved.' : 'Review failed.'))
      if (response.ok) window.location.reload()
    } catch { setMessage('Network error. Review has not been confirmed.') }
    finally { setSaving(false) }
  }
  return <form onSubmit={review} style={{ display: 'grid', gap: 12 }}>
    <p>Review evidence for {code}; score each criterion and record substantive feedback.</p>
    {limits.map(([key, label, max]) => <label key={key}>{label} (0–{max})
      <input style={{ display: 'block', width: 110 }} type="number" name={key} min="0" max={max} step="1" required />
    </label>)}
    <label>Feedback (30–3,000 characters)
      <textarea style={{ display: 'block', width: '100%', minHeight: 100 }} name="feedback"
        minLength={30} maxLength={3000} required />
    </label>
    <label>Determination <select name="determination" defaultValue="graded">
      <option value="graded">Publish grade</option>
      <option value="revision_requested">Request revision</option>
    </select></label>
    <button disabled={saving} type="submit">{saving ? 'Saving…' : 'Save instructor review'}</button>
    {message && <p role="status">{message}</p>}
  </form>
}

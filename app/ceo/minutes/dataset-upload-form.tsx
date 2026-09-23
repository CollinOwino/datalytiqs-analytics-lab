'use client'

import { useActionState, useRef } from 'react'
import { analyseDatasetForMinutes } from '../actions'

export default function DatasetUploadForm() {
  const [state, action, pending] = useActionState(analyseDatasetForMinutes, { ok: false, message: '' })
  const fileRef = useRef<HTMLInputElement>(null)
  return <form action={action} className="minutes-dataset-form" aria-busy={pending}>
    <label>Dataset name <input name="name" maxLength={180} placeholder="Monthly service delivery" disabled={pending} /></label>
    <label>Excel or CSV file <input ref={fileRef} name="file" type="file" accept=".xlsx,.xls,.csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required disabled={pending} /></label>
    <p>First worksheet · up to 5 MB, 5,000 rows and 100 columns. Only authorized organizational data should be uploaded.</p>
    {state.message && <div role="status" aria-live="polite" className={`minutes-feedback minutes-feedback-${state.ok ? 'success' : 'error'}`}>{state.message}{!state.ok && ' Re-select the file before retrying.'}</div>}
    <button disabled={pending} type="submit">{pending ? 'Analysing dataset…' : 'Upload and analyse dataset'}</button>
  </form>
}

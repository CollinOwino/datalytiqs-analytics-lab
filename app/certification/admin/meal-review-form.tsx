'use client'

import { useActionState } from 'react'
import { reviewMealLevel2Request, type MealLevel2ReviewResult } from '../actions'

const initialState: MealLevel2ReviewResult = { ok: false, message: '' }
const dimensions = [
  ['results_logic','Results logic'],
  ['measurement','Measurement'],
  ['integrity','Integrity / protection · CRITICAL'],
  ['accountability','Accountability · CRITICAL'],
  ['analysis','Analysis'],
  ['learning','Learning'],
  ['adaptation','Adaptation'],
  ['communication','Communication'],
]

export default function MealReviewForm({requestId}:{requestId:string}) {
  const [state, action, pending] = useActionState(reviewMealLevel2Request, initialState)
  return <form action={action}>
    <input type="hidden" name="request_id" value={requestId}/>
    <div className="cert-admin-grid">
      {dimensions.map(([key,label])=><label key={key}>{label}<select name={key} required defaultValue=""><option value="" disabled>Score 0–3</option><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></label>)}
    </div>
    <label>Reviewer notes<textarea name="review_notes" rows={3} placeholder="Required for return/rejection; recommended for approval"/></label>
    {state.message&&<p role="alert" aria-live="assertive" className={state.ok?'cert-success':'cert-error'}>{state.message}</p>}
    <div className="cert-actions">
      <button disabled={pending} type="submit" name="decision" value="approved">Approve professional review</button>
      <button disabled={pending} type="submit" name="decision" value="changes_requested">Return for revision</button>
      <button disabled={pending} type="submit" name="decision" value="rejected">Reject review</button>
    </div>
  </form>
}

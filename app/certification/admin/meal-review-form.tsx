'use client'

import { useActionState, useState } from 'react'
import { reviewMealLevel2Request, type MealLevel2ReviewResult } from '../actions'

const initialState: MealLevel2ReviewResult = { ok: false, message: '' }
const dimensions = [
  ['results_logic','Results logic'],
  ['measurement','Measurement'],
  ['integrity','Integrity / protection',true],
  ['accountability','Accountability',true],
  ['analysis','Analysis'],
  ['learning','Learning'],
  ['adaptation','Adaptation'],
  ['communication','Communication'],
] as const

export default function MealReviewForm({requestId}:{requestId:string}) {
  const [state, action, pending] = useActionState(reviewMealLevel2Request, initialState)
  const [scores,setScores] = useState<Record<string,string>>({})
  const [notes,setNotes] = useState('')
  const [decision,setDecision] = useState('')
  const values = dimensions.map(([key])=>scores[key])
  const complete = values.every(v=>v!==undefined && /^[0-3]$/.test(v))
  const total = values.reduce((sum,v)=>sum+(v===undefined?0:Number(v)),0)
  const criticalPassed = scores.integrity!==undefined && Number(scores.integrity)>0 && scores.accountability!==undefined && Number(scores.accountability)>0
  const eligible = complete && total>=16 && criticalPassed
  const notesRequired = decision==='changes_requested'||decision==='rejected'
  return <form action={action} className="cert-rubric-form">
    <input type="hidden" name="request_id" value={requestId}/>
    <fieldset className="cert-rubric-fieldset">
      <legend>Professional competency rubric</legend>
      <p>Score each dimension from 0 (not demonstrated) to 3 (strong evidence). Critical dimensions cannot score zero for approval.</p>
      <div className="cert-rubric-grid">
        {dimensions.map(([key,label,critical])=><label className="cert-rubric-dimension" key={key}>
          <span>{label}{critical&&<strong className="cert-critical"> · CRITICAL</strong>}</span>
          <select name={key} value={scores[key]??''} onChange={e=>setScores(prev=>({...prev,[key]:e.target.value}))} required aria-label={label+' score'}>
            <option value="" disabled>Select score</option>
            {[0,1,2,3].map(n=><option key={n} value={n}>{n} / 3</option>)}
          </select>
        </label>)}
      </div>
    </fieldset>
    <div className="cert-rubric-summary" aria-live="polite">
      <strong>{complete?total+' / 24':'Incomplete · '+values.filter(v=>v!==undefined).length+' / 8 scored'}</strong>
      <span>{!complete?'Complete all eight dimensions before submitting.':eligible?'Approval threshold met; verify evidence before approving.':'Approval not eligible: requires 16/24 and non-zero scores in both critical dimensions.'}</span>
    </div>
    <label className="cert-review-notes">Reviewer notes
      <textarea name="review_notes" rows={4} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Document evidence, authenticity checks, feedback and any required corrections" required={notesRequired}/>
    </label>
    {state.message&&<p role="alert" aria-live="assertive" className={state.ok?'cert-success':'cert-error'}>{state.message}</p>}
    <div className="cert-actions cert-review-actions">
      <button disabled={pending||!eligible} type="submit" name="decision" value="approved" onClick={()=>setDecision('approved')}>Approve professional review</button>
      <button disabled={pending||!complete} type="submit" name="decision" value="changes_requested" onClick={()=>setDecision('changes_requested')}>Return for revision</button>
      <button disabled={pending||!complete} type="submit" name="decision" value="rejected" onClick={()=>setDecision('rejected')}>Reject review</button>
    </div>
    <small>All decisions are checked again by the server. Reviewers cannot assess their own portfolios; acceptance-test learners cannot receive genuine credentials.</small>
  </form>
}

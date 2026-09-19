'use client'
import {useState} from 'react'
import {requestMealLevel2Review} from '../../../certification/actions'

type Review={status:string;rubric_total:number|null;reviewer_notes:string|null;requested_at:string}|null

export default function PortfolioControls({learnerName,review}:{learnerName:string;review:Review}){
 const[declared,setDeclared]=useState(false)
 const pending=review?.status==='pending', approved=review?.status==='approved'
 return <section className="controls" aria-labelledby="declaration-heading">
  <h2 id="declaration-heading">Integrity declaration and professional review</h2>
  {review&&<div className="review-state" role="status"><b>Review status: {review.status.replace('_',' ').toUpperCase()}</b>{review.rubric_total!=null&&<> · Rubric {review.rubric_total}/24</>}{review.reviewer_notes&&<p>Reviewer notes: {review.reviewer_notes}</p>}</div>}
  {approved?<p><b>Human review approved.</b> Credential eligibility remains separately governed. Synthetic and acceptance-test learners cannot receive credentials.</p>:
  pending?<p>Your portfolio is in the human-review queue. It cannot be resubmitted while review is pending.</p>:
  <form action={requestMealLevel2Review}>
   <label><input name="declaration" type="checkbox" checked={declared} onChange={event=>setDeclared(event.target.checked)}/><span>I confirm that the submitted work is my own, contains no unauthorised personal or confidential data, and accurately represents the competency I can demonstrate.</span></label>
   <label className="name">Learner name<input name="learner_name" defaultValue={learnerName} required minLength={3}/></label>
   <button type="submit" disabled={!declared}>Request professional human review</button>
   <p role="status" aria-live="polite">{declared?'Integrity declaration confirmed for submission.':'Confirm the integrity declaration before requesting review.'}</p>
  </form>}
  <button className="print" type="button" onClick={()=>window.print()}>Print or save portfolio review</button>
  <style jsx>{`
   .controls{padding:22px;border:2px solid #f4a261;border-radius:12px;margin-top:26px}.controls label{display:flex;gap:12px;line-height:1.55}.controls input[type=checkbox]{width:20px;height:20px;flex:none}.controls .name{display:grid;gap:6px;margin-top:18px;font-weight:700}.controls .name input{min-height:44px;padding:8px;border:1px solid #aab6c4;border-radius:6px}.controls button{min-height:44px;margin-top:18px;padding:9px 14px;border:0;border-radius:6px;background:#175d43;color:white;font-weight:800}.controls button:disabled{opacity:.5}.controls .print{margin-left:10px;background:#0b2c4d}.review-state{padding:12px;background:#eef8f1;border-radius:8px;margin-bottom:16px}.controls input:focus-visible,.controls button:focus-visible{outline:3px solid #1565c0;outline-offset:3px}@media(max-width:600px){.controls button,.controls .print{width:100%;margin-left:0}}@media print{.controls{display:none}}
  `}</style>
 </section>
}

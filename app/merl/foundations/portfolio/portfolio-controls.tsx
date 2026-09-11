'use client'

import {useState} from 'react'

export default function PortfolioControls({ready}:{ready:boolean}){
 const[declared,setDeclared]=useState(false)
 return <section className="review-controls" aria-labelledby="integrity-heading">
  <h2 id="integrity-heading">Evidence integrity check</h2>
  <label className="declaration"><input type="checkbox" checked={declared} onChange={event=>setDeclared(event.target.checked)}/><span>I confirm that the submitted evidence is my professional work, contains no unauthorised personal or confidential data, and accurately represents what I can demonstrate.</span></label>
  <p className="review-guidance">This confirmation prepares the portfolio for review; it does not issue a credential automatically. A reviewer must still assess the quality and authenticity of the submitted work.</p>
  <button type="button" disabled={!ready||!declared} onClick={()=>window.print()}>{ready?'Print or save review copy':'Complete all competency gates first'}</button>
  <p className="control-status" role="status" aria-live="polite">{!ready?'Portfolio review is locked until all five modules are competent.':declared?'Review copy is ready to print or save as PDF.':'Confirm the integrity statement to prepare the review copy.'}</p>
 </section>
}

'use client'
import {useState} from 'react'
export default function PortfolioControls(){
 const[declared,setDeclared]=useState(false)
 return <section className="controls" aria-labelledby="declaration-heading"><h2 id="declaration-heading">Integrity declaration</h2><label><input type="checkbox" checked={declared} onChange={event=>setDeclared(event.target.checked)}/><span>I confirm that the submitted work is my own, contains no unauthorised personal or confidential data, and accurately represents the competency I can demonstrate.</span></label><button disabled={!declared} onClick={()=>window.print()}>Print or save portfolio review</button><p role="status" aria-live="polite">{declared?'Declaration recorded for this review session.':'Confirm the declaration before printing the portfolio.'}</p><style jsx>{`
  .controls{padding:22px;border:2px solid #f4a261;border-radius:12px;margin-top:26px}.controls label{display:flex;gap:12px;line-height:1.55}.controls input{width:20px;height:20px;flex:none}.controls button{min-height:44px;margin-top:18px;padding:9px 14px;border:0;border-radius:6px;background:#175d43;color:white;font-weight:800}.controls button:disabled{opacity:.5}.controls input:focus-visible,.controls button:focus-visible{outline:3px solid #1565c0;outline-offset:3px}@media print{.controls{display:none}}
 `}</style></section>
}

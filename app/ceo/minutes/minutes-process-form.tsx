'use client'
import {useActionState} from 'react'
import {processMinutes} from '../minutes-actions'

type Props={expanded?:boolean}
const initial={ok:false,message:''}
export default function MinutesProcessForm({expanded=false}:Props){
 const[state,action,pending]=useActionState(processMinutes,initial)
 return <form action={action}>
  {expanded?<label>Meeting / minutes title<input name="title" required placeholder="Management Committee Meeting — 18 September 2026"/></label>:<label>Ask DatalytIQs or drop a file here…<input name="file" type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"/></label>}
  {expanded&&<label>Minutes file<input name="file" type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"/></label>}
  {!expanded&&<input name="title" required placeholder="Meeting or document title"/>}
  <label>{expanded?'Minutes text':'Or paste minutes / executive instructions here…'}<textarea name="minutes_text" rows={expanded?8:3} placeholder={expanded?'Or paste the approved or draft minutes here…':'Paste text here when no file is selected.'}/></label>
  {state.message&&<p role="status" aria-live="polite" style={{padding:'10px 12px',border:'1px solid currentColor',borderRadius:8}}>{state.message}</p>}
  <button type="submit" disabled={pending}>{pending?'Processing…':expanded?'Process Minutes':'Process'}</button>
  <small>Private organizational storage · PDF, DOCX or TXT · maximum 10 MB · extracted records require human confirmation.</small>
 </form>
}

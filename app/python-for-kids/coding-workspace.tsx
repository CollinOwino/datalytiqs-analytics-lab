'use client'

import { useState } from 'react'
import type { KidLesson } from './content'
import { savePythonKidsAttempt } from './actions'

export default function CodingWorkspace({lesson,enrolled}:{lesson:KidLesson;enrolled:boolean}) {
  const [code,setCode]=useState(lesson.starter); const [result,setResult]=useState<{ok:boolean;output:string;feedback:string;errorCategory?:string}|null>(null)
  const [hint,setHint]=useState(0); const [busy,setBusy]=useState(false); const [saved,setSaved]=useState(false); const [saveError,setSaveError]=useState('')
  async function run(){if(busy)return;setBusy(true);setSaved(false);setSaveError('');try{const response=await fetch('/api/python-kids/run',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lessonCode:lesson.code,code})});const data=await response.json();if(!response.ok)throw new Error(data.error||'The runner is unavailable. Try again.');setResult(data);if(enrolled){const persisted=await savePythonKidsAttempt({lessonCode:lesson.code,code});setSaved(persisted.saved);if(!persisted.saved)setSaveError(persisted.reason||'Your result ran but could not be saved. Try again.')}}catch(error){setResult({ok:false,output:'',feedback:error instanceof Error?error.message:'The runner is unavailable. Try again.'})}finally{setBusy(false)}}
  return <section className="kids-code" aria-labelledby="code-title">
    <div className="kids-code-head"><div><span className="kids-kicker">SAFE PYTHON RUNNER</span><h2 id="code-title">Try the challenge</h2></div><span className="kids-safe">No files · no network · safe lesson commands only</span></div>
    <p>{lesson.challenge}</p>
    {lesson.exactOutput&&<div className="kids-goal"><strong>Target output</strong><pre>{lesson.exactOutput.join('\n')}</pre><small>Match the lines and order. Your code must use the lesson concept.</small></div>}
    <label htmlFor="python-code">Python code</label><textarea id="python-code" value={code} onChange={(event)=>{setCode(event.target.value);setResult(null);setSaved(false);setSaveError('')}} spellCheck={false} aria-describedby="runner-help" />
    <div className="kids-code-actions"><button onClick={run} disabled={busy}>{busy?'Running…':'Run code'}</button><button className="kids-outline" disabled={busy} onClick={()=>{setCode(lesson.starter);setResult(null);setSaved(false);setSaveError('');setHint(0)}}>Reset</button><button className="kids-outline" disabled={busy||hint>=lesson.hints.length} onClick={()=>setHint(Math.min(hint+1,lesson.hints.length))}>Hint {hint?`${hint}/${lesson.hints.length}`:''}</button></div>
    <p id="runner-help" className="kids-muted">The runner supports this pathway’s controlled Python concepts while blocking packages, files, networks and system commands.</p>
    {hint>0&&<aside className="kids-hint"><strong>Hint:</strong> {lesson.hints[hint-1]}</aside>}
    <div className="kids-output" role="status" aria-live="polite"><strong>Output</strong><pre>{result?result.output||'(No output)':'Your output will appear here.'}</pre>{result&&<p className={result.ok?'success':'try-again'}>{result.feedback}</p>}{saved&&<p className="saved">Progress saved to your learner record.</p>}{saveError&&<p className="try-again">{saveError}</p>}{!enrolled&&result?.ok&&<p className="saved">Sign in and start the free pathway to keep this evidence.</p>}</div>
  </section>
}

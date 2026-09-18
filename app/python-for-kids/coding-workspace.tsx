'use client'

import { useState } from 'react'
import type { KidLesson } from './content'
import { savePythonKidsAttempt } from './actions'

export default function CodingWorkspace({lesson,enrolled}:{lesson:KidLesson;enrolled:boolean}) {
  const [code,setCode]=useState(lesson.starter); const [result,setResult]=useState<{ok:boolean;output:string;feedback:string;errorCategory?:string}|null>(null)
  const [hint,setHint]=useState(0); const [busy,setBusy]=useState(false); const [saved,setSaved]=useState(false)
  async function run(){setBusy(true);setSaved(false);try{const response=await fetch('/api/python-kids/run',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lessonCode:lesson.code,code})});const data=await response.json();setResult(data);if(enrolled){const persisted=await savePythonKidsAttempt({lessonCode:lesson.code,challengeCode:`lesson-${lesson.code}`,code,passed:Boolean(data.ok),feedback:String(data.feedback),errorCategory:data.errorCategory});setSaved(persisted.saved)}}finally{setBusy(false)}}
  return <section className="kids-code" aria-labelledby="code-title">
    <div className="kids-code-head"><div><span className="kids-kicker">FOUNDATIONS RUNNER</span><h2 id="code-title">Try the challenge</h2></div><span className="kids-safe">No files · no network · safe lesson commands only</span></div>
    <p>{lesson.challenge}</p>
    <label htmlFor="python-code">Python code</label><textarea id="python-code" value={code} onChange={(event)=>setCode(event.target.value)} spellCheck={false} aria-describedby="runner-help" />
    <div className="kids-code-actions"><button onClick={run} disabled={busy}>{busy?'Running…':'Run code'}</button><button className="kids-outline" onClick={()=>{setCode(lesson.starter);setResult(null);setSaved(false)}}>Reset</button><button className="kids-outline" onClick={()=>setHint(Math.min(hint+1,lesson.hints.length))}>Hint {hint?`${hint}/${lesson.hints.length}`:''}</button></div>
    <p id="runner-help" className="kids-muted">The runner supports the Python needed in Modules 1–3: print, variables, input and arithmetic.</p>
    {hint>0&&<aside className="kids-hint"><strong>Hint:</strong> {lesson.hints[hint-1]}</aside>}
    <div className="kids-output" aria-live="polite"><strong>Output</strong><pre>{result?.output||'Your output will appear here.'}</pre>{result&&<p className={result.ok?'success':'try-again'}>{result.feedback}</p>}{saved&&<p className="saved">Progress saved to your learner record.</p>}{!enrolled&&result?.ok&&<p className="saved">Sign in and start the free pathway to keep this evidence.</p>}</div>
  </section>
}

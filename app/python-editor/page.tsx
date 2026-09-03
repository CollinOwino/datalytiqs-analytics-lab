'use client'
import {useEffect,useState} from 'react'
import {createClient} from '../../lib/supabase/client'
import {completeStage03,saveStage03} from './actions'

type OutputTab='console'|'table'|'chart'
const starter=`# DatalytIQs Analytics Lab — Case Study 001
# Stage 03: Conduct Descriptive Analysis
# Your dataset will ultimately be available as: df

import pandas as pd
import matplotlib.pyplot as plt

# Descriptive statistics
summary = df.describe(include='all')
print(summary)

# Compare relevant groups here
# Example: df.groupby('Gender')['Mathematics'].mean()

# Add a chart relevant to the management questions
# df['Mathematics'].hist(bins=12)
# plt.show()
`
const demoRows=[['Mathematics','120','57.8','9.4'],['English','120','64.1','11.2'],['Kiswahili','120','62.7','10.8'],['Attendance_Rate','120','82.6','9.1']]

export default function PythonEditor(){
 const params=typeof window!=='undefined'?new URLSearchParams(window.location.search):new URLSearchParams();const project=params.get('project')??'';const saved=params.get('saved');const pageError=params.get('error')
 const[code,setCode]=useState(starter);const[evidence,setEvidence]=useState('');const[interpretation,setInterpretation]=useState('');const[tab,setTab]=useState<OutputTab>('console');const[running,setRunning]=useState(false);const[ran,setRan]=useState(false);const[restoreError,setRestoreError]=useState('')
 useEffect(()=>{if(!project)return;let active=true;(async()=>{try{const supabase=createClient();const{data,error}=await supabase.from('stage_responses').select('response_key,response_value').eq('project_id',project).eq('stage_number',3).in('response_key',['analysis_code','descriptive_evidence','interpretation']);if(error)throw error;if(!active)return;for(const r of data??[]){const v=typeof r.response_value==='string'?r.response_value:r.response_value?.value;if(typeof v!=='string')continue;if(r.response_key==='analysis_code')setCode(v);if(r.response_key==='descriptive_evidence')setEvidence(v);if(r.response_key==='interpretation')setInterpretation(v)}}catch(e){if(active)setRestoreError(e instanceof Error?e.message:'Unable to restore Stage 03.')}})();return()=>{active=false}},[project])
 const run=()=>{setRunning(true);setRan(false);setTimeout(()=>{setRunning(false);setRan(true);setTab('console')},650)}
 const ready=Boolean(project&&code.trim()&&evidence.trim()&&interpretation.trim())
 return <main className="py-shell"><header className="py-top"><div><a href="/cases/001">← Case Study 001</a><span className="eyebrow">DATALYTIQS ANALYTICS LAB</span><h1>Python Analytics Workspace</h1></div><div className="kernel"><span/><div><small>EXECUTION ENGINE</small><b>MVP interface</b></div></div></header>
 <section className="py-context"><div><span className="eyebrow gold">STAGE 03 · CONDUCT DESCRIPTIVE ANALYSIS</span><h2>Describe the evidence before explaining it.</h2><p>Summarise the major performance patterns, compare relevant groups and record what the statistics mean for the management problem. Real sandbox execution remains a later infrastructure milestone.</p></div><a href={project?`/data-explorer?project=${encodeURIComponent(project)}`:'/data-explorer'}>Open Data Explorer →</a></section>
 {!project&&<div className="data-error">Open Stage 03 from your active Case Study 001 project so your analysis can be saved.</div>}{restoreError&&<div className="data-error">{restoreError}</div>}
 <section className="ide"><aside className="ide-files"><div className="ide-label">CASE FILES</div><button className="file-active"><span>▦</span><div><b>Case_001_Dataset.xlsx</b><small>Dataset</small></div></button><button><span>Py</span><div><b>analysis.py</b><small>Working script</small></div></button><div className="ide-label gap">STAGE 03 OBJECTIVE</div><div className="engine-note"><b>Descriptive evidence</b><p>Calculate and document appropriate summaries, group comparisons and visual patterns before moving to driver analysis.</p></div></aside>
 <section className="editor-area"><div className="editor-toolbar"><div><b>analysis.py</b><span>Python 3</span></div><div><button onClick={()=>setCode(starter)}>Reset</button><button className="run" onClick={run} disabled={running}>{running?'Running…':'▶ Run Analysis'}</button></div></div><div className="code-wrap"><div className="line-nos">{Array.from({length:Math.max(24,code.split('\n').length)},(_,i)=><span key={i}>{i+1}</span>)}</div><textarea spellCheck={false} value={code} onChange={e=>setCode(e.target.value)} aria-label="Python code editor"/></div></section>
 <section className="output-area"><div className="output-tabs">{(['console','table','chart'] as OutputTab[]).map(t=><button className={tab===t?'active':''} onClick={()=>setTab(t)} key={t}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div>{tab==='console'&&<div className="console"><div className="console-head"><span>OUTPUT</span></div>{running?<pre>Starting analytical preview…</pre>:ran?<pre>{`Stage 03 analytical preview\n────────────────────────\nThe editor is persisting your code, evidence summary and interpretation.\n\nReal Python execution is not yet connected. Use the Data Explorer descriptive statistics for the current MVP evidence record.\n\nProcess state: STAGE03_READY`}</pre>:<div className="output-empty"><b>Ready for descriptive analysis</b><p>Draft your code and use the Data Explorer outputs to record defensible descriptive evidence.</p></div>}</div>}{tab==='table'&&<div className="result-table"><div className="result-note">Illustrative descriptive-output surface. Replace these examples with evidence from the Data Explorer until sandbox execution is connected.</div><table><thead><tr><th>Variable</th><th>N</th><th>Mean</th><th>Std. Dev.</th></tr></thead><tbody>{demoRows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></div>}{tab==='chart'&&<div className="chart-output"><div className="chart-placeholder"><b>Chart evidence</b><p>Stage 03 will later render figures returned by the sandbox execution service.</p></div></div>}
 <div className="interpret"><span>DESCRIPTIVE EVIDENCE</span><textarea value={evidence} onChange={e=>setEvidence(e.target.value)} placeholder="Record the strongest descriptive statistics, group comparisons and visual patterns. Include concrete values where available."/></div><div className="interpret"><span>MANAGEMENT INTERPRETATION</span><textarea value={interpretation} onChange={e=>setInterpretation(e.target.value)} placeholder="Explain what the descriptive evidence means for the school leadership problem. Separate evidence from interpretation."/></div></section></section>
 {project&&<section style={{maxWidth:1100,margin:'24px auto',padding:'0 24px'}}><form action={saveStage03} style={{display:'grid',gap:12}}><input type="hidden" name="project_id" value={project}/><input type="hidden" name="analysis_code" value={code}/><input type="hidden" name="descriptive_evidence" value={evidence}/><input type="hidden" name="interpretation" value={interpretation}/>{saved==='1'&&<p role="status"><b>Stage 03 draft saved.</b> Code, descriptive evidence and interpretation have been persisted.</p>}<button type="submit">Save Stage 03 Draft</button></form>{pageError==='incomplete'&&<p role="alert"><b>Stage 03 is incomplete.</b> Save code, descriptive evidence and management interpretation before completing the stage.</p>}{ready&&saved!=='completed'&&<form action={completeStage03} style={{marginTop:12}}><input type="hidden" name="project_id" value={project}/><button type="submit">Complete Stage 03 →</button></form>}{saved==='completed'&&<div role="status" style={{marginTop:12}}><p><b>Stage 03 completed.</b> Stage 04 is now unlocked and project progress is 50%.</p><a href={`/cases/001?project=${encodeURIComponent(project)}#stage-04`}>Continue to Stage 04 →</a></div>}</section>}
 <footer className="py-footer"><div><b>Stage 03 deliverable</b><span>Code draft + descriptive evidence + interpretation</span></div><div><span>Case 001</span></div></footer></main>}

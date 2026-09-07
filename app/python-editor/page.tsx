'use client'

import {useEffect,useMemo,useState} from 'react'
import {createClient} from '../../lib/supabase/client'
import {completeStage03,saveStage03} from './actions'

type OutputTab='console'|'table'|'chart'
type TablePayload={columns:string[];rows:(string|number|boolean|null)[][];rowCount?:number;truncated?:boolean}
type ChartPayload={format:string;data?:string;url?:string;title?:string}
type ExecutionOutput={id:string;kind:string;sequence:number;text?:string;table?:TablePayload;chart?:ChartPayload;mimeType?:string}
type ExecutionResult={executionId:string;status:string;outputs?:ExecutionOutput[];error?:{message?:string}}

const starter=`# DatalytIQs Analytics Lab — Case Study 001
# Stage 03: Conduct Descriptive Analysis
# Case_001_Dataset.xlsx is loaded automatically as: df

import pandas as pd
import matplotlib.pyplot as plt

# 1. Confirm the active dataset
print("Dataset shape:", df.shape)

# 2. Produce descriptive statistics
summary = df.describe(include='all')
print("Descriptive analysis complete.")

# 3. Compare relevant learner groups
# Example:
# gender_summary = df.groupby('Gender')['Mathematics'].agg(['count','mean','median','std']).round(2)
# print(gender_summary)

# 4. Produce a visual relevant to the management questions
plt.figure()
df['Mathematics'].hist(bins=12)
plt.title('Distribution of Mathematics Scores')
plt.xlabel('Mathematics score')
plt.ylabel('Frequency')
plt.show()

# Keep the analytical table as the final expression so the Lab can render it
# in the Table tab while print(...) remains in Console.
summary
`

function chartSource(chart?:ChartPayload){
 if(!chart)return ''
 if(chart.url)return chart.url
 if(chart.data){
  if(chart.data.startsWith('data:'))return chart.data
  const mime=chart.format==='svg'?'image/svg+xml':'image/png'
  return `data:${mime};base64,${chart.data}`
 }
 return ''
}

export default function PythonEditor(){
 const params=typeof window!=='undefined'?new URLSearchParams(window.location.search):new URLSearchParams();const project=params.get('project')??'';const saved=params.get('saved');const pageError=params.get('error')
 const[code,setCode]=useState(starter);const[evidence,setEvidence]=useState('');const[interpretation,setInterpretation]=useState('');const[tab,setTab]=useState<OutputTab>('console');const[running,setRunning]=useState(false);const[restoreError,setRestoreError]=useState('');const[outputs,setOutputs]=useState<ExecutionOutput[]>([]);const[executionStatus,setExecutionStatus]=useState('Not run');const[executionError,setExecutionError]=useState('')
 useEffect(()=>{if(!project)return;let active=true;(async()=>{try{const supabase=createClient();const{data,error}=await supabase.from('stage_responses').select('response_key,response_value').eq('project_id',project).eq('stage_number',3).in('response_key',['analysis_code','descriptive_evidence','interpretation']);if(error)throw error;if(!active)return;for(const r of data??[]){const v=typeof r.response_value==='string'?r.response_value:r.response_value?.value;if(typeof v!=='string')continue;if(r.response_key==='analysis_code')setCode(v);if(r.response_key==='descriptive_evidence')setEvidence(v);if(r.response_key==='interpretation')setInterpretation(v)}}catch(e){if(active)setRestoreError(e instanceof Error?e.message:'Unable to restore Stage 03.')}})();return()=>{active=false}},[project])
 async function run(){setRunning(true);setExecutionError('');setOutputs([]);setExecutionStatus('Submitting');setTab('console');try{const submit=await fetch('/api/executions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requestId:crypto.randomUUID(),caseId:'001',language:'python',code,metadata:{projectId:project,stage:'03'},limits:{timeoutMs:30000,memoryMb:512,cpuSeconds:20,maxOutputBytes:2000000,network:'disabled'}})});const accepted=await submit.json();if(!submit.ok)throw new Error(accepted?.error?.message||'Unable to submit execution.');const executionId=accepted.executionId as string;setExecutionStatus(accepted.status||'queued');for(let i=0;i<20;i++){await new Promise(r=>setTimeout(r,500));const res=await fetch(`/api/executions/${encodeURIComponent(executionId)}`,{cache:'no-store'});const result=await res.json() as ExecutionResult;if(!res.ok)throw new Error(result?.error?.message||'Unable to read execution result.');setExecutionStatus(result.status);if(result.outputs)setOutputs([...result.outputs].sort((a,b)=>a.sequence-b.sequence));if(['succeeded','failed','timed_out','cancelled'].includes(result.status)){if(result.status!=='succeeded')setExecutionError(result.error?.message||`Execution ${result.status}.`);return}}throw new Error('Execution did not finish within the polling window.')}catch(e){setExecutionStatus('failed');setExecutionError(e instanceof Error?e.message:'Execution failed.')}finally{setRunning(false)}}
 const stdout=useMemo(()=>outputs.filter(o=>o.kind==='stdout'||o.kind==='stderr'||o.kind==='error').map(o=>o.text||'').filter(Boolean).join('\n'),[outputs]);const tableOutputs=useMemo(()=>outputs.filter(o=>o.kind==='table'&&o.table),[outputs]);const chartOutputs=useMemo(()=>outputs.filter(o=>o.kind==='chart'&&o.chart),[outputs]);const tableOutput=tableOutputs[0]?.table;const chartOutput=chartOutputs[0]?.chart;const chartSrc=chartSource(chartOutput);const ready=Boolean(project&&code.trim()&&evidence.trim()&&interpretation.trim())
 const counts={console:outputs.filter(o=>o.kind==='stdout'||o.kind==='stderr'||o.kind==='error').length,table:tableOutputs.length,chart:chartOutputs.length}
 return <main className="py-shell"><header className="py-top"><div><a href="/cases/001">← Case Study 001</a><span className="eyebrow">DATALYTIQS ANALYTICS LAB</span><h1>Python Analytics Workspace</h1></div><div className="kernel"><span/><div><small>EXECUTION ENGINE</small><b>{executionStatus}</b></div></div></header>
 <section className="py-context"><div><span className="eyebrow gold">STAGE 03 · CONDUCT DESCRIPTIVE ANALYSIS</span><h2>Describe the evidence before explaining it.</h2><p>Run Python against the canonical Case 001 dataset in the isolated Analytics Lab sandbox. Console messages, structured tables and charts are routed to separate result tabs so evidence remains readable and decision-focused.</p></div><a href={project?`/data-explorer?project=${encodeURIComponent(project)}`:'/data-explorer'}>Open Data Explorer →</a></section>
 {!project&&<div className="data-error">Open Stage 03 from your active Case Study 001 project so your analysis can be executed and saved.</div>}{restoreError&&<div className="data-error">{restoreError}</div>}
 <section className="ide"><aside className="ide-files"><div className="ide-label">CASE FILES</div><button className="file-active"><span>▦</span><div><b>Case_001_Dataset.xlsx</b><small>Canonical dataset · loaded as df</small></div></button><button><span>Py</span><div><b>analysis.py</b><small>Working script</small></div></button><div className="ide-label gap">STAGE 03 OBJECTIVE</div><div className="engine-note"><b>Execution contract</b><p>Run Analysis sends your code through /api/executions to the isolated remote provider. print(...) stays in Console, the final DataFrame/Series can populate Table, and Matplotlib figures populate Chart.</p></div></aside>
 <section className="editor-area"><div className="editor-toolbar"><div><b>analysis.py</b><span>Python 3</span></div><div><button onClick={()=>setCode(starter)} disabled={running}>Reset</button><button className="run" onClick={run} disabled={running||!project}>{running?'Running…':'▶ Run Analysis'}</button></div></div><div className="code-wrap"><div className="line-nos">{Array.from({length:Math.max(24,code.split('\n').length)},(_,i)=><span key={i}>{i+1}</span>)}</div><textarea spellCheck={false} value={code} onChange={e=>setCode(e.target.value)} aria-label="Python code editor"/></div></section>
 <section className="output-area"><div className="output-tabs">{(['console','table','chart'] as OutputTab[]).map(t=><button className={tab===t?'active':''} onClick={()=>setTab(t)} key={t}>{t[0].toUpperCase()+t.slice(1)}{counts[t]>0?` · ${counts[t]}`:''}</button>)}</div>{tab==='console'&&<div className="console"><div className="console-head"><span>OUTPUT · {executionStatus}</span></div>{running?<pre>Submitting code to the execution API…</pre>:executionError?<pre>{executionError}</pre>:stdout?<pre>{stdout}</pre>:<div className="output-empty"><b>Ready for descriptive analysis</b><p>Run your Python code. Messages from print(...) and execution diagnostics will appear here.</p></div>}</div>}{tab==='table'&&<div className="result-table">{tableOutput?<><div className="table-meta">Structured result · {tableOutput.rowCount??tableOutput.rows.length} row{(tableOutput.rowCount??tableOutput.rows.length)===1?'':'s'} · {tableOutput.columns.length} column{tableOutput.columns.length===1?'':'s'}{tableOutput.truncated?' · preview truncated':''}</div><div className="table-wrap"><table><thead><tr>{tableOutput.columns.map((c,i)=><th key={`${c}-${i}`}>{c}</th>)}</tr></thead><tbody>{tableOutput.rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{String(v??'')}</td>)}</tr>)}</tbody></table></div></>:<div className="result-note"><b>No structured table yet.</b><p>Leave a DataFrame or Series as the final expression in your script—for example <code>summary</code>—then run the analysis again.</p></div>}</div>}{tab==='chart'&&<div className="chart-output">{chartOutput?<div className="chart-placeholder"><b>{chartOutput.title||'Chart output'}</b>{chartSrc?<img src={chartSrc} alt={chartOutput.title||'Analytics chart output'} style={{display:'block',maxWidth:'100%',height:'auto',margin:'16px auto 0'}}/>:<p>The provider returned chart metadata but no renderable image payload.</p>}</div>:<div className="chart-placeholder"><b>No chart output</b><p>Create a Matplotlib figure and call <code>plt.show()</code>. The rendered figure will appear here.</p></div>}</div>}<div className="interpret"><span>DESCRIPTIVE EVIDENCE</span><textarea value={evidence} onChange={e=>setEvidence(e.target.value)} placeholder="Record the strongest descriptive statistics, group comparisons and visual patterns. Include concrete values where available."/></div><div className="interpret"><span>MANAGEMENT INTERPRETATION</span><textarea value={interpretation} onChange={e=>setInterpretation(e.target.value)} placeholder="Explain what the descriptive evidence means for the school leadership problem. Separate evidence from interpretation."/></div></section></section>
 {project&&<section style={{maxWidth:1100,margin:'24px auto',padding:'0 24px'}}><form action={saveStage03} style={{display:'grid',gap:12}}><input type="hidden" name="project_id" value={project}/><input type="hidden" name="analysis_code" value={code}/><input type="hidden" name="descriptive_evidence" value={evidence}/><input type="hidden" name="interpretation" value={interpretation}/>{saved==='1'&&<p role="status"><b>Stage 03 draft saved.</b> Code, descriptive evidence and interpretation have been persisted.</p>}<button type="submit">Save Stage 03 Draft</button></form>{pageError==='incomplete'&&<p role="alert"><b>Stage 03 is incomplete.</b> Save code, descriptive evidence and management interpretation before completing the stage.</p>}{ready&&saved!=='completed'&&<form action={completeStage03} style={{marginTop:12}}><input type="hidden" name="project_id" value={project}/><button type="submit">Complete Stage 03 →</button></form>}{saved==='completed'&&<div role="status" style={{marginTop:12}}><p><b>Stage 03 completed.</b> Stage 04 is now unlocked and project progress is 50%.</p><a href={`/cases/001?project=${encodeURIComponent(project)}#stage-04`}>Continue to Stage 04 →</a></div>}</section>}
 <footer className="py-footer"><div><b>Stage 03 deliverable</b><span>Code draft + descriptive evidence + management interpretation</span></div><div><span>Case 001</span></div></footer></main>}

'use client'

import {useEffect,useMemo,useState} from 'react'
import './evidence-lab.css'

type Tab='brief'|'learn'|'tasks'|'hints'|'evidence'
type OutputTab='console'|'table'|'chart'
type TablePayload={columns:string[];rows:(string|number|boolean|null)[][];rowCount?:number;truncated?:boolean}
type ChartPayload={format:string;data?:string;url?:string;title?:string}
type ExecutionOutput={id:string;kind:string;sequence:number;text?:string;table?:TablePayload;chart?:ChartPayload}
type ExecutionResult={executionId:string;status:string;outputs?:ExecutionOutput[];error?:{message?:string}}

const activities=[
 ['Inspect the dataset','Confirm its shape, columns and first five records.'],
 ['Audit variable types','Identify numeric, categorical and identifier fields.'],
 ['Measure missingness','Calculate missing values by column and explain the risk.'],
 ['Check duplicate records','Count exact duplicates and propose a treatment.'],
 ['Validate score ranges','Flag subject scores outside plausible limits.'],
 ['Create an analysis copy','Preserve raw data and document each transformation.'],
 ['Summarise performance','Calculate count, mean, median and standard deviation.'],
 ['Compare learner groups','Use a justified grouping variable and interpret differences.'],
 ['Examine distributions','Produce and label a suitable score distribution chart.'],
 ['Identify possible outliers','Apply a transparent rule and inspect flagged cases.'],
 ['Analyse relationships','Measure and visualise an appropriate association.'],
 ['Build an indicator table','Create decision-ready metrics with clear denominators.'],
 ['Test robustness','Check whether the main result changes under a reasonable alternative.'],
 ['Write an evidence statement','Report concrete values without causal overclaiming.'],
 ['Translate evidence into action','Recommend a proportionate management response.'],
 ['Submit the evidence pack','Save code, outputs, interpretation and limitations.'],
] as const

const starter=`# DatalytIQs Evidence Lab — School Performance Explorer
# The canonical Case_001_Dataset.xlsx is loaded automatically as: df

import pandas as pd
import matplotlib.pyplot as plt

# Activity 1 — inspect the dataset
print("Dataset shape:", df.shape)
print("Columns:", list(df.columns))
print(df.head())

# Leave a DataFrame or Series as the final expression
# to render it in the Table tab.
df.head()
`

const snippets:Record<number,string>={
 1:starter,
 2:`# Activity 2 — audit variable types\nprofile = pd.DataFrame({\n    "dtype": df.dtypes.astype(str),\n    "non_null": df.notna().sum(),\n    "unique": df.nunique(dropna=True)\n})\nprofile`,
 3:`# Activity 3 — measure missingness\nmissing = pd.DataFrame({\n    "missing_n": df.isna().sum(),\n    "missing_pct": (df.isna().mean() * 100).round(1)\n}).sort_values("missing_pct", ascending=False)\nmissing`,
 4:`# Activity 4 — check exact duplicates\nduplicate_n = int(df.duplicated().sum())\nprint("Exact duplicate rows:", duplicate_n)\ndf[df.duplicated(keep=False)].head(20)`,
 5:`# Activity 5 — validate numeric ranges\nnumeric = df.select_dtypes(include="number")\nrange_audit = pd.DataFrame({"minimum": numeric.min(), "maximum": numeric.max()})\nrange_audit`,
 6:`# Activity 6 — create an analysis copy\nanalysis = df.copy(deep=True)\nprint("Raw shape:", df.shape, "| Analysis shape:", analysis.shape)\nanalysis.head()`,
 7:`# Activity 7 — summarise performance\nnumeric = df.select_dtypes(include="number")\nsummary = numeric.agg(["count", "mean", "median", "std", "min", "max"]).T.round(2)\nsummary`,
 9:`# Activity 9 — examine a distribution\nscore = df.select_dtypes(include="number").columns[0]\nplt.figure(figsize=(8, 4.5))\ndf[score].dropna().hist(bins=12, color="#1565C0", edgecolor="white")\nplt.title(f"Distribution of {score}")\nplt.xlabel(score)\nplt.ylabel("Number of learners")\nplt.tight_layout()\nplt.show()`,
 10:`# Activity 10 — flag possible outliers with the IQR rule\nscore = df.select_dtypes(include="number").columns[0]\nq1, q3 = df[score].quantile([.25, .75])\niqr = q3 - q1\nlow, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr\noutliers = df[(df[score] < low) | (df[score] > high)]\nprint("IQR limits:", round(low,2), "to", round(high,2))\noutliers`,
 11:`# Activity 11 — analyse numeric relationships\nnumeric = df.select_dtypes(include="number")\ncorrelations = numeric.corr().round(2)\ncorrelations`,
}

function chartSource(chart?:ChartPayload){
 if(!chart)return''
 if(chart.url)return chart.url
 if(chart.data)return chart.data.startsWith('data:')?chart.data:`data:${chart.format==='svg'?'image/svg+xml':'image/png'};base64,${chart.data}`
 return''
}

export default function EvidenceLab(){
 const[tab,setTab]=useState<Tab>('brief');const[current,setCurrent]=useState(1);const[done,setDone]=useState<number[]>([]);const[code,setCode]=useState(starter);const[notes,setNotes]=useState('');const[limitations,setLimitations]=useState('');const[running,setRunning]=useState(false);const[status,setStatus]=useState('Ready');const[outputs,setOutputs]=useState<ExecutionOutput[]>([]);const[error,setError]=useState('');const[outputTab,setOutputTab]=useState<OutputTab>('console');const[saved,setSaved]=useState(false)
 useEffect(()=>{try{const raw=localStorage.getItem('datalytiqs-evidence-lab-v1');if(!raw)return;const state=JSON.parse(raw);if(Array.isArray(state.done))setDone(state.done);if(typeof state.code==='string')setCode(state.code);if(typeof state.notes==='string')setNotes(state.notes);if(typeof state.limitations==='string')setLimitations(state.limitations);if(Number.isInteger(state.current))setCurrent(state.current)}catch{}},[])
 function save(){localStorage.setItem('datalytiqs-evidence-lab-v1',JSON.stringify({done,code,notes,limitations,current,updatedAt:new Date().toISOString()}));setSaved(true);setTimeout(()=>setSaved(false),2200)}
 function choose(n:number){setCurrent(n);setTab('tasks');if(snippets[n])setCode(snippets[n])}
 function markDone(){setDone(x=>x.includes(current)?x.filter(n=>n!==current):[...x,current].sort((a,b)=>a-b))}
 async function run(){setRunning(true);setError('');setOutputs([]);setStatus('Submitting');setOutputTab('console');try{const submit=await fetch('/api/executions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requestId:crypto.randomUUID(),caseId:'001',language:'python',code,metadata:{stage:'evidence-lab',activity:String(current)},limits:{timeoutMs:30000,memoryMb:512,cpuSeconds:20,maxOutputBytes:2000000,network:'disabled'}})});const accepted=await submit.json();if(submit.status===401)throw new Error('Sign in to the Analytics Lab before running Python.');if(!submit.ok)throw new Error(accepted?.error?.message||'Unable to submit execution.');const id=accepted.executionId as string;setStatus(accepted.status||'Queued');for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,500));const response=await fetch(`/api/executions/${encodeURIComponent(id)}`,{cache:'no-store'});const result=await response.json() as ExecutionResult;if(!response.ok)throw new Error(result?.error?.message||'Unable to read execution result.');setStatus(result.status);if(result.outputs)setOutputs([...result.outputs].sort((a,b)=>a.sequence-b.sequence));if(['succeeded','failed','timed_out','cancelled'].includes(result.status)){if(result.status!=='succeeded')setError(result.error?.message||`Execution ${result.status}.`);return}}throw new Error('Execution did not finish within the polling window.')}catch(e){setStatus('Failed');setError(e instanceof Error?e.message:'Execution failed.')}finally{setRunning(false)}}
 const progress=Math.round(done.length/activities.length*100);const stdout=useMemo(()=>outputs.filter(o=>['stdout','stderr','error'].includes(o.kind)).map(o=>o.text||'').filter(Boolean).join('\n'),[outputs]);const table=outputs.find(o=>o.kind==='table')?.table;const chart=outputs.find(o=>o.kind==='chart')?.chart;const chartSrc=chartSource(chart)
 return <main className="ev-shell"><a className="ev-skip" href="#workspace">Skip to workspace</a><header className="ev-top"><div><a href="/">DatalytIQs Analytics Lab</a><span>/</span><strong>Evidence Lab</strong><span className="ev-status"><i/>{status}</span></div><div><span>{done.length} of 16 activities</span><b>{progress}%</b><button onClick={save}>{saved?'Saved ✓':'Save progress'}</button></div></header>
 <section className="ev-title"><div><span className="ev-kicker">GUIDED PYTHON PROJECT · CASE 001</span><h1>School Performance<br/>Evidence Explorer</h1><p>Investigate a real management question through reproducible Python analysis. Every activity moves from data inspection to a defensible decision brief.</p></div><div className="ev-meta"><small>PROJECT OUTCOME</small><strong>Evidence pack</strong><p>Code · tables · charts · interpretation · limitations</p><div><span>Python 3</span><span>pandas</span><span>Matplotlib</span></div></div></section>
 <section className="ev-progress" aria-label="Project progress"><div><span style={{width:`${progress}%`}}/></div><p>{progress}% complete</p></section>
 <section className="ev-workspace" id="workspace"><aside className="ev-guide"><nav aria-label="Project guide">{(['brief','learn','tasks','hints','evidence'] as Tab[]).map(x=><button className={tab===x?'active':''} onClick={()=>setTab(x)} key={x}>{x}</button>)}</nav><div className="ev-guide-body">
 {tab==='brief'&&<><span className="ev-step">PROJECT BRIEF</span><h2>From school records to responsible action</h2><p>A school leadership team needs a concise, transparent assessment of learner performance. Your task is to profile the dataset, identify reliable patterns and state what the evidence can—and cannot—support.</p><h3>Management questions</h3><ul><li>What does overall performance look like?</li><li>Which differences merit further investigation?</li><li>What data-quality limitations affect confidence?</li><li>Which action is proportionate to the evidence?</li></ul><div className="ev-rule"><b>Evidence rule</b><p>Describe association, not causation. Protect learner privacy and report denominators.</p></div></>}
 {tab==='learn'&&<><span className="ev-step">CONCEPT GUIDE</span><h2>Reproducible analysis</h2><p>A defensible workflow preserves the source data, records transformations, produces labelled outputs and separates statistical evidence from professional judgement.</p><h3>The DatalytIQs method</h3><ol><li><b>Understand</b> the decision and data-generating process.</li><li><b>Analyse</b> with transparent, repeatable code.</li><li><b>Verify</b> ranges, missingness and robustness.</li><li><b>Interpret</b> magnitude, uncertainty and limitations.</li><li><b>Submit evidence</b> another analyst can review.</li></ol></>}
 {tab==='tasks'&&<><span className="ev-step">ACTIVITY {String(current).padStart(2,'0')} OF 16</span><h2>{activities[current-1][0]}</h2><p>{activities[current-1][1]}</p><div className="ev-criteria"><b>Completion evidence</b><p>Run relevant code, inspect the returned output, then record the analytical meaning in Evidence.</p></div><button className={`ev-complete ${done.includes(current)?'done':''}`} onClick={markDone}>{done.includes(current)?'Completed ✓':'Mark activity complete'}</button><div className="ev-task-nav"><button disabled={current===1} onClick={()=>choose(current-1)}>← Previous</button><button disabled={current===16} onClick={()=>choose(current+1)}>Next →</button></div></>}
 {tab==='hints'&&<><span className="ev-step">SCAFFOLDED SUPPORT</span><h2>Hints, not shortcuts</h2><p>Read the error from the bottom upward. Confirm variable names exactly as they appear in <code>df.columns</code>. Test one transformation at a time.</p><h3>For this activity</h3><p>{snippets[current]?'A guided starter is loaded in the notebook. Adapt it and explain why the method fits the question.':'Start from the output of the earlier activities. Choose variables deliberately; do not rely on column position without checking it.'}</p><div className="ev-rule"><b>Stuck?</b><p>Return to Activity 1 and inspect shape, columns, types and sample records.</p></div></>}
 {tab==='evidence'&&<><span className="ev-step">EVIDENCE LOG</span><h2>What does the output mean?</h2><label>Evidence statement<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="State the result, include concrete values, explain its relevance and avoid causal overclaiming."/></label><label>Limitations and next check<textarea value={limitations} onChange={e=>setLimitations(e.target.value)} placeholder="Record missingness, measurement limits, uncertainty, fairness concerns and the next validation step."/></label><button className="ev-save" onClick={save}>Save evidence locally</button></>}
 </div><div className="ev-activity-list"><div><b>ACTIVITIES</b><span>{done.length}/16</span></div>{activities.map((a,i)=><button className={current===i+1?'current':''} onClick={()=>choose(i+1)} key={a[0]}><span>{done.includes(i+1)?'✓':String(i+1).padStart(2,'0')}</span><em>{a[0]}</em></button>)}</div></aside>
 <section className="ev-notebook" aria-label="Jupyter-style Python workspace"><div className="ev-notebook-bar"><div><span className="ev-jupyter">◉</span><b>analysis.ipynb</b><small>Python 3 (isolated)</small></div><div><button onClick={()=>setCode(snippets[current]||starter)} disabled={running}>Reset cell</button><button className="ev-run" onClick={run} disabled={running}>{running?'Running…':'▶ Run cell'}</button></div></div><div className="ev-cell"><div className="ev-prompt">In&nbsp;[ ]:</div><textarea value={code} onChange={e=>setCode(e.target.value)} spellCheck={false} aria-label="Python code cell"/></div><section className="ev-output"><nav>{(['console','table','chart'] as OutputTab[]).map(x=><button className={outputTab===x?'active':''} onClick={()=>setOutputTab(x)} key={x}>{x}</button>)}</nav><div className="ev-output-body">{running&&<p className="ev-empty">Executing in the isolated Python environment…</p>}{!running&&error&&<pre className="ev-error">{error}</pre>}{!running&&!error&&outputTab==='console'&&(stdout?<pre>{stdout}</pre>:<p className="ev-empty">Run the cell to display console output.</p>)}{!running&&!error&&outputTab==='table'&&(table?<div className="ev-table"><table><thead><tr>{table.columns.map((c,i)=><th key={i}>{c}</th>)}</tr></thead><tbody>{table.rows.slice(0,30).map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{String(v??'')}</td>)}</tr>)}</tbody></table></div>:<p className="ev-empty">Leave a DataFrame or Series as the final expression to render a table.</p>)}{!running&&!error&&outputTab==='chart'&&(chartSrc?<img src={chartSrc} alt={chart?.title||'Python chart output'}/>:<p className="ev-empty">Create a Matplotlib figure and call <code>plt.show()</code>.</p>)}</div></section><footer className="ev-notebook-foot"><span>Dataset attached server-side</span><span>Network disabled</span><span>30 s limit</span><span>Private learner execution</span></footer></section></section>
 <footer className="ev-footer"><div><b>DatalytIQs Evidence Lab</b><span>Understand → Analyse → Verify → Interpret → Submit Evidence</span></div><a href="https://datalytiqsacademy.com/dashboard/">Return to Academy dashboard ↗</a></footer></main>
}

'use client'
import {useState} from 'react'

type OutputTab='console'|'table'|'chart'
const starter=`# DatalytIQs Analytics Lab — Case Study 001
# Your dataset will be available as: df

import pandas as pd
import matplotlib.pyplot as plt

# Inspect the dataset
print(df.head())
print(df.info())

# Descriptive statistics
summary = df.describe(include='all')
print(summary)

# Example chart — replace with a relevant variable
# df['Final_Score'].hist(bins=12)
# plt.title('Distribution of Final Score')
# plt.xlabel('Final Score')
# plt.ylabel('Students')
# plt.show()
`
const demoRows=[['STU-001','Female','82.0','94'],['STU-002','Male','74.5','88'],['STU-003','Female','68.0','81'],['STU-004','Male','79.0','91'],['STU-005','Female','86.5','96']]
export default function PythonEditor(){const[code,setCode]=useState(starter);const[tab,setTab]=useState<OutputTab>('console');const[running,setRunning]=useState(false);const[ran,setRan]=useState(false);const run=()=>{setRunning(true);setRan(false);setTimeout(()=>{setRunning(false);setRan(true);setTab('console')},650)}
return <main className="py-shell"><header className="py-top"><div><a href="/cases/001">← Case Study 001</a><span className="eyebrow">DATALYTIQS ANALYTICS LAB</span><h1>Python Analytics Workspace</h1></div><div className="kernel"><span/><div><small>EXECUTION ENGINE</small><b>MVP interface</b></div></div></header><section className="py-context"><div><span className="eyebrow gold">CASE 001 · ANALYTICAL WORKSPACE</span><h2>Write. Run. Inspect. Interpret.</h2><p>Use Python to turn the case dataset into reproducible statistical evidence. Code, outputs and interpretation will ultimately form part of the learner's analytical record.</p></div><a href="/data-explorer">Open Data Explorer →</a></section><section className="ide"><aside className="ide-files"><div className="ide-label">CASE FILES</div><button className="file-active"><span>▦</span><div><b>Case_001_Dataset.xlsx</b><small>Dataset</small></div></button><button><span>Py</span><div><b>analysis.py</b><small>Working script</small></div></button><div className="ide-label gap">VARIABLES</div><div className="env"><p><b>df</b><span>DataFrame</span></p><p><b>pd</b><span>module</span></p><p><b>plt</b><span>module</span></p></div><div className="engine-note"><b>Sandbox pending</b><p>The editor UI is ready. Real Python execution will be connected to the separate sandboxed computation service.</p></div></aside><section className="editor-area"><div className="editor-toolbar"><div><b>analysis.py</b><span>Python 3</span></div><div><button onClick={()=>setCode(starter)}>Reset</button><button className="run" onClick={run} disabled={running}>{running?'Running…':'▶ Run Analysis'}</button></div></div><div className="code-wrap"><div className="line-nos">{Array.from({length:Math.max(24,code.split('\n').length)},(_,i)=><span key={i}>{i+1}</span>)}</div><textarea spellCheck={false} value={code} onChange={e=>setCode(e.target.value)} aria-label="Python code editor"/></div></section><section className="output-area"><div className="output-tabs">{(['console','table','chart'] as OutputTab[]).map(t=><button className={tab===t?'active':''} onClick={()=>setTab(t)} key={t}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div>{tab==='console'&&<div className="console"><div className="console-head"><span>OUTPUT</span><button>Clear</button></div>{running?<pre>Starting isolated Python session…</pre>:ran?<pre>{`Python execution preview\n────────────────────────\nDataset: Case_001_Dataset.xlsx\nScript received successfully.\n\n[Execution service not yet connected]\nThe next infrastructure milestone will execute this code in a resource-limited sandbox and stream stdout/stderr here.\n\nProcess state: UI_READY`}</pre>:<div className="output-empty"><b>Ready for analysis</b><p>Run your Python code to view standard output, warnings and errors here.</p></div>}</div>}{tab==='table'&&<div className="result-table"><div className="result-note">Illustrative output surface — real rows will come from the execution engine.</div><table><thead><tr><th>Student_ID</th><th>Gender</th><th>Final_Score</th><th>Attendance</th></tr></thead><tbody>{demoRows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></div>}{tab==='chart'&&<div className="chart-output"><div className="chart-placeholder"><div className="chart-bars">{[48,72,55,88,63,78,92,68,82,58,74,86].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div><b>Chart output</b><p>Matplotlib/Seaborn figures returned by the sandbox will render in this panel.</p></div></div>}<div className="interpret"><span>ANALYTICAL NOTE</span><textarea placeholder="Record what the output means for the management problem. Separate statistical evidence from interpretation."/></div></section></section><footer className="py-footer"><div><b>Reproducible analysis</b><span>Code + output + interpretation</span></div><div><span>Case 001</span><a href="/cases/001#stage-03">Return to analytical workflow →</a></div></footer></main>}

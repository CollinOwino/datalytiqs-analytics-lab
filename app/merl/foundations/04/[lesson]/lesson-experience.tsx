'use client'

import {useMemo,useState} from 'react'

type LessonId='1'|'2'|'3'
type Check={prompt:string;options:string[];answer:number;feedback:string}
type Column='Result'|'Indicator'|'Verification'|'Assumption'
type Scenario={statement:string;answer:Column;reason:string}

const checks:Record<'1'|'2',Check[]>={
 '1':[
  {prompt:'Where should “Percentage of graduates employed within six months” appear in a logframe?',options:['Result statement','Indicator','Means of verification','Assumption'],answer:1,feedback:'An indicator translates a result into a specific signal that can be measured.'},
  {prompt:'What is the primary purpose of the means-of-verification column?',options:['List every available dataset','Specify where and how indicator data will be obtained','Repeat the result statement','Record the budget'],answer:1,feedback:'Means of verification identify the source, collection method, frequency and responsibility needed to produce credible indicator data.'}
 ],
 '2':[
  {prompt:'Vertical logic is strongest when:',options:['Every row has the same wording','Activities plausibly produce outputs and outputs plausibly contribute to outcomes','All indicators are percentages','Assumptions are omitted'],answer:1,feedback:'Vertical logic tests the causal sequence and the conditions required to move between result levels.'},
  {prompt:'Horizontal logic asks whether:',options:['The budget equals expenditure','Indicators and sources can credibly demonstrate each result','The diagram fits one page','Every activity has one employee'],answer:1,feedback:'Horizontal logic tests whether indicators, data sources and assumptions make each result measurable and defensible.'}
 ]}

const scenarios:Scenario[]=[
 {statement:'Graduates obtain and retain decent employment',answer:'Result',reason:'It describes the change the programme seeks to influence.'},
 {statement:'Percentage of graduates in decent work six months after completion',answer:'Indicator',reason:'It defines the measurable signal for the employment outcome.'},
 {statement:'Tracer survey matched to verified employer records, collected semi-annually',answer:'Verification',reason:'It specifies the source and collection approach for indicator data.'},
 {statement:'Targeted sectors continue recruiting entry-level workers',answer:'Assumption',reason:'It is an external condition needed for the causal link to hold.'},
 {statement:'900 participants complete accredited market-relevant training',answer:'Result',reason:'It is a direct output stated as a completed deliverable.'},
 {statement:'Training provider completion register independently spot-checked quarterly',answer:'Verification',reason:'It identifies the record and quality-control process used to substantiate the output.'}
]

const content={
 '1':{kicker:'LESSON 04.1',title:'Logical Framework Anatomy',duration:'30–40 minutes',objectives:['Explain the purpose and structure of a logical framework.','Distinguish results, indicators, verification sources and assumptions.','Connect the logframe to programme management rather than treating it as a donor form.']},
 '2':{kicker:'LESSON 04.2',title:'Vertical and Horizontal Logic',duration:'35–45 minutes',objectives:['Test the causal sequence from activities to impact.','Test whether each result can be credibly measured and verified.','Identify weak assumptions, indicators and evidence sources.']},
 '3':{kicker:'LESSON 04.3',title:'Construct a Professional Logframe',duration:'45–60 minutes',objectives:['Classify and position essential logframe components.','Apply quality tests to results, indicators, sources and assumptions.','Produce a concise, management-ready logical framework.']}
} as const

export default function LessonExperience({lesson}:{lesson:LessonId}){
 const info=content[lesson]
 const[selected,setSelected]=useState<Record<number,number>>({})
 const[classified,setClassified]=useState<Record<number,string>>({})
 const checksHere=lesson==='3'?[]:checks[lesson]
 const score=useMemo(()=>lesson==='3'?scenarios.filter((item,i)=>classified[i]===item.answer).length:checksHere.filter((q,i)=>selected[i]===q.answer).length,[lesson,classified,selected,checksHere])

 return <main className="lesson-shell">
  <nav aria-label="Breadcrumb"><a href="/merl/foundations">MERL Level 1</a><span aria-hidden="true"> / </span><span>Module 04</span><span aria-hidden="true"> / </span><span>Lesson 04.{lesson}</span></nav>
  <header className="lesson-hero"><div><p className="lesson-kicker">{info.kicker} · {info.duration}</p><h1>{info.title}</h1><p>County Youth Employment Programme case study · turning programme logic into a compact management and accountability framework.</p></div><aside aria-label="Lesson position"><b>MODULE 04</b><span>Lesson {lesson} of 3</span></aside></header>

  <div className="lesson-layout"><article>
   <section className="lesson-card"><h2>Learning outcomes</h2><ul>{info.objectives.map(x=><li key={x}>{x}</li>)}</ul></section>

   {lesson==='1'&&<><section><h2>Four connected columns</h2><div className="concept-grid">
    <div><h3>Results</h3><p>The output, outcome and impact statements that describe the intended sequence of change.</p></div>
    <div><h3>Indicators and verification</h3><p>The measures, sources, methods, frequencies and responsibilities used to judge progress credibly.</p></div>
    <div><h3>Assumptions</h3><p>The important external conditions required for one result level to contribute to the next.</p></div>
   </div></section><section className="example"><h2>Worked example</h2><p>For the outcome “graduates obtain and retain decent employment,” the programme may track the percentage employed within six months through tracer surveys and employer verification. The causal claim depends partly on employers having suitable vacancies and recognising the certification.</p><p className="takeaway"><b>A logframe should compress clear thinking; it cannot manufacture logic that the programme never developed.</b></p></section></>}

   {lesson==='2'&&<><section><h2>Two directions of quality assurance</h2><div className="table-wrap"><table><thead><tr><th>Test</th><th>Core question</th><th>Common failure</th><th>Repair</th></tr></thead><tbody>
    <tr><th>Vertical logic</th><td>If activities are completed and assumptions hold, will outputs occur—and will those outputs plausibly contribute to outcomes?</td><td>A leap from training delivered directly to poverty reduced</td><td>Add necessary intermediate changes and expose assumptions</td></tr>
    <tr><th>Horizontal logic</th><td>Can indicators and sources credibly demonstrate each result?</td><td>An outcome measured only with activity attendance</td><td>Select a measure at the same result level and specify a viable source</td></tr>
    <tr><th>Coherence</th><td>Does the logframe remain consistent with the Theory of Change, work plan and budget?</td><td>Activities funded but absent from the results logic</td><td>Reconcile all management instruments before approval</td></tr>
   </tbody></table></div><div className="callout"><b>Read the matrix in both directions.</b><p>Down the first column, test causal logic. Across every row, test measurement and assumptions. A neat table can still contain a very untidy argument.</p></div></section></>}

   {lesson!=='3'&&<section className="practice"><h2>Guided knowledge check</h2><p>Select an answer. Feedback explains the professional principle and supports revision.</p>{checksHere.map((q,i)=><fieldset key={q.prompt}><legend>{i+1}. {q.prompt}</legend>{q.options.map((o,j)=><label key={o}><input type="radio" name={`q-${i}`} checked={selected[i]===j} onChange={()=>setSelected(v=>({...v,[i]:j}))}/><span>{o}</span></label>)}{selected[i]!==undefined&&<p role="status" aria-live="polite" className={selected[i]===q.answer?'correct':'incorrect'}>{selected[i]===q.answer?'Correct. ':'Review this. '}{q.feedback}</p>}</fieldset>)}<p><b>Current score: {score}/{checksHere.length}</b></p></section>}

   {lesson==='3'&&<section><h2>Logframe classification exercise</h2><p>Place each statement in its <b>primary logframe column</b>. The feedback explains why the placement matters.</p><div className="scenario-list">{scenarios.map((item,i)=><fieldset key={item.statement}><legend>{i+1}. {item.statement}</legend><label htmlFor={`logframe-column-${i}`}>Logframe column</label><select id={`logframe-column-${i}`} value={classified[i]||''} onChange={e=>setClassified(v=>({...v,[i]:e.target.value}))}><option value="">Select one</option>{['Result','Indicator','Verification','Assumption'].map(x=><option key={x}>{x}</option>)}</select>{classified[i]&&<p role="status" aria-live="polite" className={classified[i]===item.answer?'correct':'incorrect'}>{classified[i]===item.answer?`Correct — ${item.reason}`:`Reconsider the column. ${item.reason}`}</p>}</fieldset>)}</div><p><b>Classification score: {score}/{scenarios.length}</b></p>
    <div className="callout"><h3>Professional quality checklist</h3><ol><li>Use one clear change per result statement.</li><li>Match each indicator to the same result level.</li><li>Specify baseline, target, disaggregation and timeframe.</li><li>Name a feasible source, collection method and frequency.</li><li>Expose material assumptions and assign review responsibility.</li><li>Reconcile the matrix with the Theory of Change, budget and work plan.</li></ol></div>
    <div className="callout"><h3>Professional submission standard</h3><p>Download the template and complete a logical framework for a real or supplied programme. Include at least one result at output, outcome and impact level, with indicators, baselines, targets, sources, frequency, responsibility and assumptions. Remove confidential or personal data before submission.</p><a className="primary-link" href="/api/merl/level1/logframe-template" download>Download professional logframe template (.csv)</a></div>
   </section>}

   <section className="reflection"><h2>Reflection for practice</h2><p>{lesson==='1'?'Which column in your current logframe receives the least scrutiny, and what decision risk follows from that weakness?':lesson==='2'?'Choose one row from an existing logframe. Test it vertically and horizontally, then identify the first defect that should be corrected.':'Identify the weakest row in your completed matrix. Rewrite its result or indicator and explain why the revision is more defensible.'}</p></section>
   <footer className="lesson-footer"><a href={lesson==='1'?'/merl/foundations':`/merl/foundations/04/${Number(lesson)-1}`}>← {lesson==='1'?'Module overview':'Previous lesson'}</a><a className="primary-link" href={lesson==='3'?'/merl/foundations':`/merl/foundations/04/${Number(lesson)+1}`}>{lesson==='3'?'Return to Module 04 and record evidence':'Continue to next lesson'} →</a></footer>
  </article><aside className="lesson-rail"><b>Progression standard</b><ol><li>Read the concepts and example.</li><li>Complete the guided check.</li><li>Apply the quality tests.</li><li>Return to Module 04 and record the lesson gate.</li></ol><p>Formative feedback supports revision. Persistent competence requires all lesson gates, a submitted professional logframe and a passing server-graded quiz.</p></aside></div>
  <style jsx global>{`
   .lesson-shell{max-width:1180px;margin:auto;padding:32px 24px;color:#0b2c4d;font-family:system-ui;background:#fff;min-height:100vh}
   .lesson-shell a{color:#1565c0}.lesson-shell a:focus-visible,.lesson-shell input:focus-visible,.lesson-shell select:focus-visible{outline:3px solid #f4a261;outline-offset:3px}
   .lesson-hero{margin:24px 0 30px;padding:36px;background:#0b2c4d;color:white;display:grid;grid-template-columns:1fr auto;gap:32px;border-radius:14px}
   .lesson-hero h1{font-family:Georgia,serif;font-size:42px;line-height:1.08;margin:10px 0}.lesson-hero p{color:#c7d4df;line-height:1.6}.lesson-kicker{color:#f4a261!important;font-weight:800;letter-spacing:1.4px;font-size:12px}
   .lesson-hero aside{border-left:1px solid #ffffff35;padding-left:24px;display:flex;flex-direction:column;justify-content:center}.lesson-hero aside span{margin-top:8px;color:#c7d4df}
   .lesson-layout{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:30px}.lesson-layout article>section{margin-bottom:24px}.lesson-card,.example,.practice,.reflection,.callout{padding:22px;border:1px solid #d7dee7;border-radius:12px}.lesson-card,.reflection{background:#f6f8fb}
   .lesson-shell h2{font-family:Georgia,serif;font-size:27px}.lesson-shell h3{margin-top:0}.lesson-shell p,.lesson-shell li,.lesson-shell td{line-height:1.65}
   .concept-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.concept-grid>div{padding:20px;border-top:4px solid #f4a261;background:#f6f8fb}.takeaway{font-size:18px}
   .table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse}th,td{padding:12px;border:1px solid #d7dee7;text-align:left;vertical-align:top}thead th{background:#0b2c4d;color:white}
   .callout{margin-top:18px;border-left:5px solid #f4a261}.practice fieldset,.scenario-list fieldset{margin:16px 0;padding:16px;border:1px solid #d7dee7;border-radius:10px}.practice legend,.scenario-list legend{font-weight:700;padding:0 6px}.practice label{display:flex;gap:9px;padding:7px}.scenario-list select{display:block;width:100%;max-width:360px;margin-top:8px;padding:11px;font:inherit}
   .correct,.incorrect{padding:12px;border-radius:8px}.correct{background:#e8f5ee;color:#175d43}.incorrect{background:#fff4e8;color:#7a430d}.primary-link{display:inline-flex;align-items:center;min-height:44px;background:#f4a261!important;color:#081f33!important;padding:10px 15px;border-radius:6px;text-decoration:none;font-weight:800}
   .lesson-rail{height:max-content;position:sticky;top:24px;background:#0b2c4d;color:white;padding:22px;border-radius:12px}.lesson-rail li,.lesson-rail p{color:#d7e0e8}.lesson-footer{display:flex;justify-content:space-between;align-items:center;gap:16px;padding-top:20px;border-top:1px solid #d7dee7}.lesson-footer a{min-height:44px;display:flex;align-items:center}
   @media(max-width:800px){.lesson-layout{grid-template-columns:1fr}.lesson-rail{position:static}.concept-grid{grid-template-columns:1fr}.lesson-hero{grid-template-columns:1fr}.lesson-hero aside{border-left:0;border-top:1px solid #ffffff35;padding:18px 0 0}.lesson-hero h1{font-size:34px}}
   @media(max-width:520px){.lesson-shell{padding:20px 14px}.lesson-hero{padding:24px 18px}.lesson-hero h1{font-size:30px}.lesson-card,.example,.practice,.reflection,.callout{padding:16px}.lesson-footer{align-items:stretch;flex-direction:column}.lesson-footer a{justify-content:center;text-align:center}.practice label{min-height:44px}}
  `}</style>
 </main>
}

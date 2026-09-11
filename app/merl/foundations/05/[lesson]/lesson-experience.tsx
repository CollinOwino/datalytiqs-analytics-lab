'use client'

import {useMemo,useState} from 'react'

type LessonId='1'|'2'|'3'
type Check={prompt:string;options:string[];answer:number;feedback:string}
type Quality='Valid'|'Reliable'|'Specific'|'Feasible'|'Problematic'
type Scenario={statement:string;answer:Quality;reason:string}

const checks:Record<'1'|'2',Check[]>={
 '1':[
  {prompt:'What is an indicator?',options:['The result itself','A measurable variable that signals progress or change','Any number in a report','A data-collection tool'],answer:1,feedback:'An indicator is a quantitative or qualitative variable used to measure achievement, change or performance; it is not the result itself.'},
  {prompt:'Which indicator best matches the outcome “graduates obtain decent employment”?',options:['Number of training sessions delivered','Percentage of graduates in decent work six months after completion','Training budget spent','Number of trainers contracted'],answer:1,feedback:'The selected measure observes the employment outcome at the correct result level and specifies a population and timeframe.'}
 ],
 '2':[
  {prompt:'An indicator produces the same result when repeated under the same conditions. Which quality is demonstrated?',options:['Validity','Reliability','Relevance','Economy'],answer:1,feedback:'Reliability concerns consistency of measurement across observers, tools or repeated applications.'},
  {prompt:'Why is “number of youth empowered” a weak indicator?',options:['It is qualitative','Empowered is undefined and the measure lacks a population, method and timeframe','It uses a count','It cannot be reported monthly'],answer:1,feedback:'The construct is ambiguous and the indicator lacks operational definitions needed for consistent measurement.'}
 ]}

const scenarios:Scenario[]=[
 {statement:'Percentage of enrolled participants who complete accredited training, by sex, disability and county',answer:'Specific',reason:'It defines the population, achievement and required disaggregation.'},
 {statement:'Number of young people empowered',answer:'Problematic',reason:'“Empowered” is undefined, so different data collectors could count different conditions.'},
 {statement:'Employment status verified from tracer interviews and employer confirmation using a standard protocol',answer:'Reliable',reason:'A documented, repeatable verification protocol supports consistent measurement.'},
 {statement:'Average monthly earnings used as the sole measure of decent work',answer:'Problematic',reason:'Earnings alone do not capture stability, safety, rights or other dimensions of decent work.'},
 {statement:'Percentage of graduates in employment that meets the programme’s documented decent-work criteria',answer:'Valid',reason:'It directly represents the defined outcome rather than a convenient activity proxy.'},
 {statement:'Daily national household survey for a small county pilot',answer:'Problematic',reason:'The proposed frequency and scale are disproportionate to the decision need and resources.'}
]

const content={
 '1':{kicker:'LESSON 05.1',title:'What Makes an Indicator Useful',duration:'30–40 minutes',objectives:['Define an indicator and distinguish it from a result, target and data source.','Match indicators to the correct result level and decision.','Specify units, populations, direction and timeframe clearly.']},
 '2':{kicker:'LESSON 05.2',title:'Indicator Types and SMART/CREAM Tests',duration:'35–45 minutes',objectives:['Distinguish input, process, output, outcome and impact indicators.','Apply SMART and CREAM as structured quality prompts.','Assess validity, reliability, feasibility and ethical risk.']},
 '3':{kicker:'LESSON 05.3',title:'Design Indicators from a Results Framework',duration:'45–60 minutes',objectives:['Diagnose common indicator defects.','Write a complete indicator reference definition.','Produce a quality-assured indicator set ready for competency submission.']}
} as const

export default function LessonExperience({lesson}:{lesson:LessonId}){
 const info=content[lesson]
 const[selected,setSelected]=useState<Record<number,number>>({})
 const[classified,setClassified]=useState<Record<number,string>>({})
 const checksHere=lesson==='3'?[]:checks[lesson]
 const score=useMemo(()=>lesson==='3'?scenarios.filter((item,i)=>classified[i]===item.answer).length:checksHere.filter((q,i)=>selected[i]===q.answer).length,[lesson,classified,selected,checksHere])

 return <main className="lesson-shell">
  <nav aria-label="Breadcrumb"><a href="/merl/foundations">MERL Level 1</a><span aria-hidden="true"> / </span><span>Module 05</span><span aria-hidden="true"> / </span><span>Lesson 05.{lesson}</span></nav>
  <header className="lesson-hero"><div><p className="lesson-kicker">{info.kicker} · {info.duration}</p><h1>{info.title}</h1><p>County Youth Employment Programme case study · designing measures that support decisions without overstating what the data prove.</p></div><aside aria-label="Lesson position"><b>MODULE 05</b><span>Lesson {lesson} of 3</span></aside></header>

  <div className="lesson-layout"><article>
   <section className="lesson-card"><h2>Learning outcomes</h2><ul>{info.objectives.map(x=><li key={x}>{x}</li>)}</ul></section>

   {lesson==='1'&&<><section><h2>Four elements that are often confused</h2><div className="concept-grid">
    <div><h3>Result</h3><p>The change or deliverable the programme seeks, such as graduates obtaining decent employment.</p></div>
    <div><h3>Indicator</h3><p>The variable used to measure the result, such as the percentage of graduates in decent employment after six months.</p></div>
    <div><h3>Baseline and target</h3><p>The starting value and intended value by a defined date. They provide comparison, not proof of causation.</p></div>
   </div></section><section className="example"><h2>Worked example</h2><p>“Percentage of programme graduates in decent employment six months after completion, disaggregated by sex, disability and county” identifies the population, condition, timeframe and equity dimensions. A tracer survey and employer verification may supply the data; neither is part of the indicator wording itself.</p><p className="takeaway"><b>An indicator is a signal, not the entire story—and certainly not evidence of attribution by itself.</b></p></section></>}

   {lesson==='2'&&<><section><h2>Quality tests and their limits</h2><div className="table-wrap"><table><thead><tr><th>Test</th><th>Questions</th><th>Important caution</th></tr></thead><tbody>
    <tr><th>SMART</th><td>Is it specific, measurable, achievable, relevant and time-bound?</td><td>“Achievable” may describe a target more naturally than the indicator definition.</td></tr>
    <tr><th>CREAM</th><td>Is it clear, relevant, economic, adequate and monitorable?</td><td>A cheap indicator can still be invalid or ethically harmful.</td></tr>
    <tr><th>Validity</th><td>Does it represent the intended result?</td><td>Attendance is not a valid substitute for employment.</td></tr>
    <tr><th>Reliability</th><td>Would repeated measurement produce consistent findings?</td><td>Undefined terms and changing tools weaken comparability.</td></tr>
    <tr><th>Feasibility and ethics</th><td>Can the data be collected safely, affordably and in time for decisions?</td><td>Do not collect sensitive data merely because a dashboard has an empty column.</td></tr>
   </tbody></table></div><div className="callout"><b>Frameworks are prompts, not magic stamps.</b><p>An indicator can look SMART and still measure the wrong construct. Validity, reliability, disaggregation, feasibility and potential harm require explicit judgement.</p></div></section></>}

   {lesson!=='3'&&<section className="practice"><h2>Guided knowledge check</h2><p>Select an answer. Feedback explains the principle and supports revision.</p>{checksHere.map((q,i)=><fieldset key={q.prompt}><legend>{i+1}. {q.prompt}</legend>{q.options.map((o,j)=><label key={o}><input type="radio" name={`q-${i}`} checked={selected[i]===j} onChange={()=>setSelected(v=>({...v,[i]:j}))}/><span>{o}</span></label>)}{selected[i]!==undefined&&<p role="status" aria-live="polite" className={selected[i]===q.answer?'correct':'incorrect'}>{selected[i]===q.answer?'Correct. ':'Review this. '}{q.feedback}</p>}</fieldset>)}<p><b>Current score: {score}/{checksHere.length}</b></p></section>}

   {lesson==='3'&&<section><h2>Indicator quality-diagnosis exercise</h2><p>Classify the <b>dominant quality or defect</b> in each statement. Real indicator review may identify more than one issue; choose the most consequential.</p><div className="scenario-list">{scenarios.map((item,i)=><fieldset key={item.statement}><legend>{i+1}. {item.statement}</legend><label htmlFor={`indicator-quality-${i}`}>Dominant assessment</label><select id={`indicator-quality-${i}`} value={classified[i]||''} onChange={e=>setClassified(v=>({...v,[i]:e.target.value}))}><option value="">Select one</option>{['Valid','Reliable','Specific','Feasible','Problematic'].map(x=><option key={x}>{x}</option>)}</select>{classified[i]&&<p role="status" aria-live="polite" className={classified[i]===item.answer?'correct':'incorrect'}>{classified[i]===item.answer?`Correct — ${item.reason}`:`Reconsider the dominant assessment. ${item.reason}`}</p>}</fieldset>)}</div><p><b>Classification score: {score}/{scenarios.length}</b></p>
    <div className="callout"><h3>Indicator reference standard</h3><ol><li>Indicator name and linked result.</li><li>Precise operational definition, numerator and denominator where applicable.</li><li>Unit, direction, baseline, target and timeframe.</li><li>Disaggregation and inclusion requirements.</li><li>Source, method, frequency and responsible role.</li><li>Data-quality checks, limitations and ethical safeguards.</li></ol></div>
    <div className="callout"><h3>Professional submission standard</h3><p>Download the template and develop at least five indicators spanning output and outcome levels. Include full definitions, formulas, baselines, targets, disaggregation, sources, collection schedules, responsibilities, limitations and quality controls. Remove confidential or personal data before submission.</p><a className="primary-link" href="/api/merl/level1/indicator-template" download>Download indicator reference template (.csv)</a></div>
   </section>}

   <section className="reflection"><h2>Reflection for practice</h2><p>{lesson==='1'?'Choose one indicator from a current report. What result should it measure, and does its wording actually observe that result?':lesson==='2'?'Which quality test would your organisation most often fail: validity, reliability, feasibility or ethics? Name the practical consequence.':'Select your weakest proposed indicator. Rewrite its definition and explain what the revised measure can—and cannot—support.'}</p></section>
   <footer className="lesson-footer"><a href={lesson==='1'?'/merl/foundations':`/merl/foundations/05/${Number(lesson)-1}`}>← {lesson==='1'?'Module overview':'Previous lesson'}</a><a className="primary-link" href={lesson==='3'?'/merl/foundations':`/merl/foundations/05/${Number(lesson)+1}`}>{lesson==='3'?'Return to Module 05 and record evidence':'Continue to next lesson'} →</a></footer>
  </article><aside className="lesson-rail"><b>Progression standard</b><ol><li>Read the concepts and example.</li><li>Complete the guided check.</li><li>Diagnose indicator quality.</li><li>Return to Module 05 and record the lesson gate.</li></ol><p>Formative feedback supports revision. Persistent competence requires all lesson gates, a submitted indicator set and a passing server-graded quiz.</p></aside></div>
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

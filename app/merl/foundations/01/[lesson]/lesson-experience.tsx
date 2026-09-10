'use client'

import {useMemo,useState} from 'react'

type LessonId='1'|'2'|'3'
type Check={prompt:string;options:string[];answer:number;feedback:string}
type Scenario={item:string;answer:'Monitoring'|'Evaluation'|'Research'|'Audit';reason:string}

const checks:Record<'1'|'2',Check[]>={
 '1':[
  {prompt:'A programme officer reviews monthly attendance against the target. Which function is this?',options:['Monitoring','Evaluation','Research','Audit'],answer:0,feedback:'Monitoring routinely tracks implementation and performance against an agreed plan.'},
  {prompt:'A team pauses after a quarterly review to adapt outreach for underserved wards. What makes this learning?',options:['It produces more data','Evidence is used to change action','It happens every quarter','It uses a dashboard'],answer:1,feedback:'Learning is demonstrated when evidence changes understanding, decisions or practice.'}
 ],
 '2':[
  {prompt:'Which function asks whether a programme caused meaningful change and why?',options:['Monitoring','Evaluation','Financial audit','Basic research'],answer:1,feedback:'Evaluation makes a systematic judgement about merit, worth, effectiveness or significance.'},
  {prompt:'Which function primarily tests compliance, controls and the reliability of records?',options:['Monitoring','Evaluation','Research','Audit'],answer:3,feedback:'Audit examines compliance, controls and whether records fairly represent what occurred.'}
 ]}

const scenarios:Scenario[]=[
 {item:'Monthly dashboard showing trainees enrolled by county and sex',answer:'Monitoring',reason:'It routinely tracks delivery and reach against operational indicators.'},
 {item:'Independent assessment of whether training improved employment after six months',answer:'Evaluation',reason:'It judges effectiveness and investigates contribution to outcomes.'},
 {item:'Study exploring how informal networks shape young people’s job searches',answer:'Research',reason:'It generates broader knowledge through a defined research question.'},
 {item:'Review of procurement files, approvals and payment controls',answer:'Audit',reason:'It tests compliance, control design and documentary reliability.'},
 {item:'Quarterly verification of whether contracted training sessions occurred',answer:'Monitoring',reason:'It verifies implementation status as part of routine oversight.'},
 {item:'Value-for-money assessment comparing costs, outputs and outcomes',answer:'Evaluation',reason:'It judges economy, efficiency and effectiveness to support a programme decision.'}
]

const content={
 '1':{kicker:'LESSON 01.1',title:'What M&E and Learning Are',duration:'25–35 minutes',objectives:['Distinguish monitoring, evaluation and learning as connected but different functions.','Explain how each function strengthens accountable programme management.','Identify the decision that a piece of evidence is intended to support.']},
 '2':{kicker:'LESSON 01.2',title:'Monitoring vs Evaluation vs Research vs Audit',duration:'30–40 minutes',objectives:['Compare four evidence functions by purpose, timing, methods and users.','Classify a management question before selecting a method.','Recognise overlap without collapsing distinct professional standards.']},
 '3':{kicker:'LESSON 01.3',title:'Evidence-Function Classification Exercise',duration:'35–50 minutes',objectives:['Classify real programme evidence by its primary function.','Write a defensible rationale linked to purpose and use.','Produce a professional matrix ready for submission as competency evidence.']}
} as const

export default function LessonExperience({lesson}:{lesson:LessonId}){
 const info=content[lesson]
 const[selected,setSelected]=useState<Record<number,number>>({})
 const[classified,setClassified]=useState<Record<number,string>>({})
 const checksHere=lesson==='3'?[]:checks[lesson]
 const score=useMemo(()=>lesson==='3'?scenarios.filter((s,i)=>classified[i]===s.answer).length:checksHere.filter((q,i)=>selected[i]===q.answer).length,[lesson,classified,selected,checksHere])

 return <main className="lesson-shell">
  <nav aria-label="Breadcrumb"><a href="/merl/foundations">MERL Level 1</a><span aria-hidden="true"> / </span><span>Module 01</span><span aria-hidden="true"> / </span><span>Lesson 01.{lesson}</span></nav>
  <header className="lesson-hero"><div><p className="lesson-kicker">{info.kicker} · {info.duration}</p><h1>{info.title}</h1><p>County Youth Employment Programme case study · applied foundations for defensible evidence and decisions.</p></div><aside aria-label="Lesson position"><b>MODULE 01</b><span>Lesson {lesson} of 3</span></aside></header>

  <div className="lesson-layout"><article>
   <section className="lesson-card"><h2>Learning outcomes</h2><ul>{info.objectives.map(x=><li key={x}>{x}</li>)}</ul></section>
   {lesson==='1'&&<><section><h2>Three connected disciplines</h2><div className="concept-grid">
    <div><h3>Monitoring</h3><p>Continuous, systematic collection and review of information about implementation, reach, expenditure and results. It asks: <b>Are we doing what we planned, at the expected pace and quality?</b></p></div>
    <div><h3>Evaluation</h3><p>A systematic assessment of a completed or ongoing intervention’s design, implementation or results. It asks: <b>Is the intervention relevant, effective, efficient, coherent, impactful and sustainable—and why?</b></p></div>
    <div><h3>Learning</h3><p>The deliberate process of interpreting evidence, reflecting with stakeholders and adapting decisions or practice. It asks: <b>What should we retain, change, stop or investigate next?</b></p></div>
   </div></section><section className="example"><h2>Worked example</h2><p>A county reports that 1,200 young people enrolled, 930 completed training and 410 found employment within six months. Monitoring establishes the counts and trends. Evaluation tests whether the intervention contributed to employment and for whom. Learning uses those findings to redesign recruitment, course mix or employer partnerships.</p><p className="takeaway"><b>Data become evidence when connected to a question; evidence becomes learning when it changes a decision.</b></p></section></>}
   {lesson==='2'&&<><section><h2>Choose the function before the method</h2><div className="table-wrap"><table><thead><tr><th>Function</th><th>Primary purpose</th><th>Typical timing</th><th>Illustrative question</th></tr></thead><tbody>
    <tr><th>Monitoring</th><td>Track implementation and performance</td><td>Continuous or routine</td><td>How many trainees completed this month?</td></tr>
    <tr><th>Evaluation</th><td>Judge merit, worth or significance</td><td>At decision points or periodically</td><td>Did training improve employment, for whom and why?</td></tr>
    <tr><th>Research</th><td>Generate or test generalisable knowledge</td><td>Defined by the research design</td><td>How do social networks influence job search behaviour?</td></tr>
    <tr><th>Audit</th><td>Test compliance, controls and record reliability</td><td>Scheduled or risk-triggered</td><td>Were procurement and payments properly authorised?</td></tr>
   </tbody></table></div><div className="callout"><b>Overlap is normal; purpose is decisive.</b><p>An evaluation may use routine monitoring data, research methods and audited financial records. That does not make the four functions interchangeable.</p></div></section></>}
   {lesson!=='3'&&<section className="practice"><h2>Guided knowledge check</h2><p>Select an answer. Feedback explains the governing principle, not merely whether you were right.</p>{checksHere.map((q,i)=><fieldset key={q.prompt}><legend>{i+1}. {q.prompt}</legend>{q.options.map((o,j)=><label key={o}><input type="radio" name={`q-${i}`} checked={selected[i]===j} onChange={()=>setSelected(v=>({...v,[i]:j}))}/><span>{o}</span></label>)}{selected[i]!==undefined&&<p role="status" className={selected[i]===q.answer?'correct':'incorrect'}>{selected[i]===q.answer?'Correct. ':'Review this. '}{q.feedback}</p>}</fieldset>)}<p><b>Current score: {score}/{checksHere.length}</b></p></section>}
   {lesson==='3'&&<section><h2>Evidence-function classification matrix</h2><p>Classify each item by its <b>primary purpose</b>. Some methods overlap; your rationale should explain the decision the evidence is designed to support.</p><div className="scenario-list">{scenarios.map((s,i)=><fieldset key={s.item}><legend>{i+1}. {s.item}</legend><label htmlFor={`classification-${i}`}>Primary function</label><select id={`classification-${i}`} value={classified[i]||''} onChange={e=>setClassified(v=>({...v,[i]:e.target.value}))}><option value="">Select one</option>{['Monitoring','Evaluation','Research','Audit'].map(x=><option key={x}>{x}</option>)}</select>{classified[i]&&<p role="status" className={classified[i]===s.answer?'correct':'incorrect'}>{classified[i]===s.answer?`Correct — ${s.reason}`:`Reconsider the primary purpose. ${s.reason}`}</p>}</fieldset>)}</div><p><b>Classification score: {score}/{scenarios.length}</b></p><div className="callout"><h3>Professional submission standard</h3><p>Download the blank matrix, classify at least six items from a real or supplied programme, and add a concise rationale, intended decision and limitation for each item. Remove personal or confidential information before submission.</p><a className="primary-link" href="/api/merl/level1/classification-template" download>Download classification matrix (.csv)</a></div></section>}
   <section className="reflection"><h2>Reflection for practice</h2><p>{lesson==='1'?'Name one report your organisation produces routinely. What decision should it change, and what happens if nobody acts on it?':lesson==='2'?'Take one current management question and rewrite it four ways: as a monitoring, evaluation, research and audit question.':'Which classifications were difficult? Record the competing purposes and justify the primary function you selected.'}</p></section>
   <footer className="lesson-footer"><a href={lesson==='1'?'/merl/foundations':`/merl/foundations/01/${Number(lesson)-1}`}>← {lesson==='1'?'Module overview':'Previous lesson'}</a><a className="primary-link" href={lesson==='3'?'/merl/foundations':`/merl/foundations/01/${Number(lesson)+1}`}>{lesson==='3'?'Return to Module 01 and record evidence':'Continue to next lesson'} →</a></footer>
  </article><aside className="lesson-rail"><b>Progression standard</b><ol><li>Read the concepts and example.</li><li>Complete the guided check.</li><li>Apply the idea to the case.</li><li>Return to Module 01 and record the lesson gate.</li></ol><p>Your recorded gate confirms completion; the guided feedback remains formative.</p></aside></div>
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

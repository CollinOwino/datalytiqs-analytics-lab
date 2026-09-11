'use client'

import {useMemo,useState} from 'react'

type LessonId='1'|'2'|'3'
type Check={prompt:string;options:string[];answer:number;feedback:string}
type ElementType='Problem'|'Pathway'|'Assumption'|'Risk'|'Indicator'
type Scenario={statement:string;answer:ElementType;reason:string}

const checks:Record<'1'|'2',Check[]>={
 '1':[
  {prompt:'What makes a Theory of Change more than a results-chain diagram?',options:['It contains more boxes','It explains why and under what conditions change is expected','It always includes financial data','It removes uncertainty'],answer:1,feedback:'A Theory of Change makes causal reasoning explicit, including the mechanisms, assumptions and context required for change.'},
  {prompt:'Which statement is the strongest long-term change?',options:['Train 900 young people','Create a mentoring manual','Young people sustain decent livelihoods','Procure training equipment'],answer:2,feedback:'A long-term change describes an improved condition for people, institutions or systems—not an activity or deliverable.'}
 ],
 '2':[
  {prompt:'“Local employers have vacancies that match the skills taught” is primarily what?',options:['An output','An assumption','An activity','An impact indicator'],answer:1,feedback:'This is an assumption: a condition believed necessary for the causal pathway to work, but not controlled by the programme.'},
  {prompt:'Which response best manages a material assumption?',options:['Delete it from the diagram','Treat it as proven','Define evidence, ownership and a review trigger','Convert it into an activity'],answer:2,feedback:'Material assumptions should be monitored with evidence, an owner and a trigger for adaptation.'}
 ]}

const scenarios:Scenario[]=[
 {statement:'Young people lack market-relevant skills, job information and employer connections',answer:'Problem',reason:'It states the condition the intervention seeks to change.'},
 {statement:'Employer-designed training leads to stronger occupational competence',answer:'Pathway',reason:'It expresses a proposed causal connection between intervention and change.'},
 {statement:'Employers continue to offer entry-level vacancies in the targeted sectors',answer:'Assumption',reason:'It is a necessary external condition that the programme does not control.'},
 {statement:'Economic contraction sharply reduces labour demand',answer:'Risk',reason:'It is an uncertain event that could weaken or reverse expected results.'},
 {statement:'Percentage of graduates in decent work twelve months after completion',answer:'Indicator',reason:'It specifies a measurable signal of whether an expected outcome occurred.'},
 {statement:'Mentoring and verified vacancy information increase successful job matching',answer:'Pathway',reason:'It explains how connected services are expected to influence employment.'}
]

const content={
 '1':{kicker:'LESSON 03.1',title:'Theory of Change Fundamentals',duration:'30–40 minutes',objectives:['Explain the purpose and core elements of a Theory of Change.','Distinguish causal explanation from a sequence of activities.','Frame a clear problem and an actor-centred long-term change.']},
 '2':{kicker:'LESSON 03.2',title:'Assumptions, Risks and Causal Pathways',duration:'35–45 minutes',objectives:['Identify assumptions embedded in a causal pathway.','Distinguish an assumption from a risk and a programme-controlled action.','Specify evidence and review triggers for material assumptions.']},
 '3':{kicker:'LESSON 03.3',title:'Build and Critique a Theory of Change',duration:'45–60 minutes',objectives:['Classify the essential components of a Theory of Change.','Test causal links for plausibility, evidence and contextual fit.','Produce a professional Theory of Change with a concise narrative.']}
} as const

export default function LessonExperience({lesson}:{lesson:LessonId}){
 const info=content[lesson]
 const[selected,setSelected]=useState<Record<number,number>>({})
 const[classified,setClassified]=useState<Record<number,string>>({})
 const checksHere=lesson==='3'?[]:checks[lesson]
 const score=useMemo(()=>lesson==='3'?scenarios.filter((item,i)=>classified[i]===item.answer).length:checksHere.filter((q,i)=>selected[i]===q.answer).length,[lesson,classified,selected,checksHere])

 return <main className="lesson-shell">
  <nav aria-label="Breadcrumb"><a href="/merl/foundations">MERL Level 1</a><span aria-hidden="true"> / </span><span>Module 03</span><span aria-hidden="true"> / </span><span>Lesson 03.{lesson}</span></nav>
  <header className="lesson-hero"><div><p className="lesson-kicker">{info.kicker} · {info.duration}</p><h1>{info.title}</h1><p>County Youth Employment Programme case study · making causal claims, assumptions and evidence requirements explicit.</p></div><aside aria-label="Lesson position"><b>MODULE 03</b><span>Lesson {lesson} of 3</span></aside></header>

  <div className="lesson-layout"><article>
   <section className="lesson-card"><h2>Learning outcomes</h2><ul>{info.objectives.map(x=><li key={x}>{x}</li>)}</ul></section>

   {lesson==='1'&&<><section><h2>A testable explanation of change</h2><div className="concept-grid">
    <div><h3>Situation</h3><p>Who experiences the problem, what drives it, how severe it is and which contextual conditions sustain it.</p></div>
    <div><h3>Causal pathways</h3><p>The linked changes expected to connect programme actions to outcomes and longer-term change.</p></div>
    <div><h3>Assumptions and evidence</h3><p>The conditions that must hold, the evidence supporting each link and the indicators used to test progress.</p></div>
   </div></section><section className="example"><h2>Worked example</h2><p>The county expects employer-designed training, career coaching and verified vacancy information to improve skills and job matching, leading to sustained decent employment. That claim depends on employers offering suitable vacancies, training quality remaining high and graduates being able to reach workplaces safely and affordably.</p><p className="takeaway"><b>A Theory of Change is an argument to be tested, not a decorative diagram to be admired.</b></p></section>
   <section className="callout"><h3>Minimum architecture</h3><ol><li>Define the problem and affected groups.</li><li>State the long-term change in actor-centred language.</li><li>Map backward through necessary intermediate changes.</li><li>Identify interventions, assumptions and contextual risks.</li><li>Attach evidence and indicators to the most important links.</li></ol></section></>}

   {lesson==='2'&&<><section><h2>Assumptions and risks</h2><div className="table-wrap"><table><thead><tr><th>Element</th><th>Meaning</th><th>Example</th><th>Management response</th></tr></thead><tbody>
    <tr><th>Assumption</th><td>A condition believed necessary for a causal link to hold</td><td>Employers value the certification offered</td><td>Gather evidence, assign ownership and define a review trigger</td></tr>
    <tr><th>Risk</th><td>An uncertain event that could weaken results or cause harm</td><td>Economic contraction reduces vacancies</td><td>Assess likelihood and consequence; mitigate and monitor</td></tr>
    <tr><th>Precondition</th><td>A condition that must exist before an intervention or result is possible</td><td>Participants can safely reach training centres</td><td>Verify before launch or redesign delivery</td></tr>
    <tr><th>External factor</th><td>A contextual influence outside programme control</td><td>National labour and tax policy</td><td>Track trends and adapt the pathway when material</td></tr>
   </tbody></table></div><div className="callout"><b>Hidden assumptions are unmanaged risks.</b><p>If a causal link matters, write down what must be true, what evidence supports it and what decision follows if it fails.</p></div></section></>}

   {lesson!=='3'&&<section className="practice"><h2>Guided knowledge check</h2><p>Select an answer. Feedback explains the principle so that you can revise the underlying reasoning.</p>{checksHere.map((q,i)=><fieldset key={q.prompt}><legend>{i+1}. {q.prompt}</legend>{q.options.map((o,j)=><label key={o}><input type="radio" name={`q-${i}`} checked={selected[i]===j} onChange={()=>setSelected(v=>({...v,[i]:j}))}/><span>{o}</span></label>)}{selected[i]!==undefined&&<p role="status" aria-live="polite" className={selected[i]===q.answer?'correct':'incorrect'}>{selected[i]===q.answer?'Correct. ':'Review this. '}{q.feedback}</p>}</fieldset>)}<p><b>Current score: {score}/{checksHere.length}</b></p></section>}

   {lesson==='3'&&<section><h2>Theory-of-Change classification exercise</h2><p>Classify each statement by its <b>primary role</b> in a Theory of Change. Use the feedback to refine the causal narrative.</p><div className="scenario-list">{scenarios.map((item,i)=><fieldset key={item.statement}><legend>{i+1}. {item.statement}</legend><label htmlFor={`toc-element-${i}`}>Theory-of-Change element</label><select id={`toc-element-${i}`} value={classified[i]||''} onChange={e=>setClassified(v=>({...v,[i]:e.target.value}))}><option value="">Select one</option>{['Problem','Pathway','Assumption','Risk','Indicator'].map(x=><option key={x}>{x}</option>)}</select>{classified[i]&&<p role="status" aria-live="polite" className={classified[i]===item.answer?'correct':'incorrect'}>{classified[i]===item.answer?`Correct — ${item.reason}`:`Reconsider the element. ${item.reason}`}</p>}</fieldset>)}</div><p><b>Classification score: {score}/{scenarios.length}</b></p>
    <div className="callout"><h3>Critique protocol</h3><ol><li>Is the problem supported by disaggregated evidence?</li><li>Does every pathway describe a change—not simply an activity?</li><li>Is each causal link plausible and evidence-informed?</li><li>Are material assumptions visible and monitorable?</li><li>Are unintended effects, power and exclusion considered?</li><li>Could indicators reveal whether the theory is failing early?</li></ol></div>
    <div className="callout"><h3>Professional submission standard</h3><p>Download the template and produce a Theory of Change for a real or supplied programme. Include the problem, actor-centred long-term change, causal pathways, interventions, assumptions, risks, indicators and a 200–300 word narrative. Remove confidential or personal data before submission.</p><a className="primary-link" href="/api/merl/level1/theory-of-change-template" download>Download Theory of Change template (.csv)</a></div>
   </section>}

   <section className="reflection"><h2>Reflection for practice</h2><p>{lesson==='1'?'Choose one outcome in an existing programme document. What must change immediately before it, and why should that change lead to the outcome?':lesson==='2'?'Name the assumption most likely to fail in your programme. What evidence would reveal failure early enough to adapt?':'Identify the least credible arrow in your Theory of Change. Rewrite its explanation and specify the evidence needed to defend it.'}</p></section>
   <footer className="lesson-footer"><a href={lesson==='1'?'/merl/foundations':`/merl/foundations/03/${Number(lesson)-1}`}>← {lesson==='1'?'Module overview':'Previous lesson'}</a><a className="primary-link" href={lesson==='3'?'/merl/foundations':`/merl/foundations/03/${Number(lesson)+1}`}>{lesson==='3'?'Return to Module 03 and record evidence':'Continue to next lesson'} →</a></footer>
  </article><aside className="lesson-rail"><b>Progression standard</b><ol><li>Read the concepts and example.</li><li>Complete the guided check.</li><li>Apply the idea to the case.</li><li>Return to Module 03 and record the lesson gate.</li></ol><p>Formative feedback supports revision. Persistent competence requires all lesson gates, a submitted Theory of Change and a passing server-graded quiz.</p></aside></div>
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

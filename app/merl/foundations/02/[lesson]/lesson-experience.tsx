'use client'

import {useMemo,useState} from 'react'

type LessonId='1'|'2'|'3'
type Check={prompt:string;options:string[];answer:number;feedback:string}
type ResultLevel='Input'|'Activity'|'Output'|'Outcome'|'Impact'
type ChainItem={statement:string;answer:ResultLevel;reason:string}

const checks:Record<'1'|'2',Check[]>={
 '1':[
  {prompt:'Which feature most clearly distinguishes a programme from a single project?',options:['It always has a larger budget','It coordinates related projects toward a broader strategic result','It lasts more than one year','It is managed by government'],answer:1,feedback:'A programme coordinates related interventions and management arrangements toward a broader strategic objective; size, duration and ownership alone do not define it.'},
  {prompt:'“More young people obtain decent work” is best described as what?',options:['An activity','A procurement item','A result','A risk register'],answer:2,feedback:'A result is a describable or measurable change arising from an intervention, whether intended or unintended.'}
 ],
 '2':[
  {prompt:'A completed package of employer-approved training materials is which results-chain level?',options:['Input','Activity','Output','Outcome'],answer:2,feedback:'An output is a direct product or service delivered by the intervention.'},
  {prompt:'Graduates applying improved job-search skills six months later is best classified as what?',options:['Activity','Output','Outcome','Input'],answer:2,feedback:'An outcome is a change in behaviour, practice, performance or condition that follows from use of outputs.'}
 ]}

const chain:ChainItem[]=[
 {statement:'KSh 24 million training budget approved and released',answer:'Input',reason:'Money is a resource made available for implementation.'},
 {statement:'Deliver competency-based training and employer mentoring',answer:'Activity',reason:'This is work performed using programme resources.'},
 {statement:'900 trainees complete certified courses',answer:'Output',reason:'This is a direct, countable service-delivery product.'},
 {statement:'Graduates demonstrate stronger job-search and technical skills',answer:'Outcome',reason:'This describes a change in capability resulting from use of outputs.'},
 {statement:'Graduate employment rate rises within twelve months',answer:'Outcome',reason:'Employment is a medium-term condition the programme seeks to influence.'},
 {statement:'Youth livelihoods and economic inclusion improve sustainably',answer:'Impact',reason:'This is the broader, longer-term change to which the intervention contributes.'}
]

const content={
 '1':{kicker:'LESSON 02.1',title:'Projects, Programmes and Results',duration:'25–35 minutes',objectives:['Distinguish a project from a programme using scope, coordination and strategic purpose.','Define a result as a change—not merely completed work.','Identify the management decision each result statement should support.']},
 '2':{kicker:'LESSON 02.2',title:'Inputs, Activities, Outputs, Outcomes and Impact',duration:'30–40 minutes',objectives:['Classify each level of a results chain accurately.','Separate what an intervention delivers from the change that follows.','Recognise common attribution and wording errors.']},
 '3':{kicker:'LESSON 02.3',title:'Build and Test a Results Chain',duration:'40–55 minutes',objectives:['Arrange programme statements into a coherent causal sequence.','Explain the assumption connecting each adjacent level.','Produce a professional results chain ready for competency submission.']}
} as const

export default function LessonExperience({lesson}:{lesson:LessonId}){
 const info=content[lesson]
 const[selected,setSelected]=useState<Record<number,number>>({})
 const[classified,setClassified]=useState<Record<number,string>>({})
 const checksHere=lesson==='3'?[]:checks[lesson]
 const score=useMemo(()=>lesson==='3'?chain.filter((item,i)=>classified[i]===item.answer).length:checksHere.filter((q,i)=>selected[i]===q.answer).length,[lesson,classified,selected,checksHere])

 return <main className="lesson-shell">
  <nav aria-label="Breadcrumb"><a href="/merl/foundations">MERL Level 1</a><span aria-hidden="true"> / </span><span>Module 02</span><span aria-hidden="true"> / </span><span>Lesson 02.{lesson}</span></nav>
  <header className="lesson-hero"><div><p className="lesson-kicker">{info.kicker} · {info.duration}</p><h1>{info.title}</h1><p>County Youth Employment Programme case study · translating resources and delivery into defensible results.</p></div><aside aria-label="Lesson position"><b>MODULE 02</b><span>Lesson {lesson} of 3</span></aside></header>

  <div className="lesson-layout"><article>
   <section className="lesson-card"><h2>Learning outcomes</h2><ul>{info.objectives.map(x=><li key={x}>{x}</li>)}</ul></section>

   {lesson==='1'&&<><section><h2>Interventions and the changes they seek</h2><div className="concept-grid">
    <div><h3>Project</h3><p>A temporary, managed intervention with defined objectives, resources, activities, responsibilities and time boundaries. A project delivers specified outputs and seeks identifiable outcomes.</p></div>
    <div><h3>Programme</h3><p>A coordinated set of related projects and activities managed together to achieve broader strategic outcomes that would be harder to secure separately.</p></div>
    <div><h3>Result</h3><p>A describable or measurable change arising from an intervention. Results may be intended or unintended, positive or negative, and occur at output, outcome or impact level.</p></div>
   </div></section><section className="example"><h2>Worked example</h2><p>A county youth-employment programme may combine a training project, an employer-incentive project and a labour-market information project. Each has its own deliverables, but the programme coordinates them toward stronger employment and livelihoods.</p><p className="takeaway"><b>Completing an activity proves that work occurred; it does not prove that people’s circumstances changed.</b></p></section></>}

   {lesson==='2'&&<><section><h2>The five levels of a results chain</h2><div className="table-wrap"><table><thead><tr><th>Level</th><th>Meaning</th><th>County youth-employment example</th><th>Control question</th></tr></thead><tbody>
    <tr><th>Inputs</th><td>Financial, human, material and informational resources</td><td>Budget, trainers, venues and curriculum</td><td>What resources are available?</td></tr>
    <tr><th>Activities</th><td>Actions undertaken using inputs</td><td>Recruit, train and mentor participants</td><td>What will the programme do?</td></tr>
    <tr><th>Outputs</th><td>Direct products and services delivered</td><td>Participants completing certified training</td><td>What was delivered, to whom and at what quality?</td></tr>
    <tr><th>Outcomes</th><td>Changes in behaviour, practice, performance or condition</td><td>Improved skills, job search and employment</td><td>What changed after outputs were used?</td></tr>
    <tr><th>Impact</th><td>Broader, longer-term change to which the intervention contributes</td><td>Sustained livelihoods and economic inclusion</td><td>What durable societal change is supported?</td></tr>
   </tbody></table></div><div className="callout"><b>Grammar often exposes weak logic.</b><p>Activities usually begin with verbs; outputs are completed products or services; outcomes describe a change in people, organisations or systems. “Conduct training” is not an outcome wearing a smarter suit.</p></div></section></>}

   {lesson!=='3'&&<section className="practice"><h2>Guided knowledge check</h2><p>Select an answer. The feedback explains the governing principle and can be used to revise your reasoning.</p>{checksHere.map((q,i)=><fieldset key={q.prompt}><legend>{i+1}. {q.prompt}</legend>{q.options.map((o,j)=><label key={o}><input type="radio" name={`q-${i}`} checked={selected[i]===j} onChange={()=>setSelected(v=>({...v,[i]:j}))}/><span>{o}</span></label>)}{selected[i]!==undefined&&<p role="status" aria-live="polite" className={selected[i]===q.answer?'correct':'incorrect'}>{selected[i]===q.answer?'Correct. ':'Review this. '}{q.feedback}</p>}</fieldset>)}<p><b>Current score: {score}/{checksHere.length}</b></p></section>}

   {lesson==='3'&&<section><h2>Results-chain classification exercise</h2><p>Classify each statement by its <b>primary level</b>. Then use the feedback to test whether the causal sequence is plausible.</p><div className="scenario-list">{chain.map((item,i)=><fieldset key={item.statement}><legend>{i+1}. {item.statement}</legend><label htmlFor={`result-level-${i}`}>Results-chain level</label><select id={`result-level-${i}`} value={classified[i]||''} onChange={e=>setClassified(v=>({...v,[i]:e.target.value}))}><option value="">Select one</option>{['Input','Activity','Output','Outcome','Impact'].map(x=><option key={x}>{x}</option>)}</select>{classified[i]&&<p role="status" aria-live="polite" className={classified[i]===item.answer?'correct':'incorrect'}>{classified[i]===item.answer?`Correct — ${item.reason}`:`Reconsider the level. ${item.reason}`}</p>}</fieldset>)}</div><p><b>Classification score: {score}/{chain.length}</b></p>
    <div className="callout"><h3>Causal-quality test</h3><ol><li>Is every statement expressed at one clear level?</li><li>Does each output have an identifiable user?</li><li>Is the next change plausible if the previous result occurs?</li><li>What assumption connects the two levels?</li><li>Which external factor could break the sequence?</li></ol></div>
    <div className="callout"><h3>Professional submission standard</h3><p>Download the blank template and build a results chain for a real or supplied programme. Include at least one statement at every level, one indicator per result, and the assumptions connecting outputs to outcomes. Remove confidential or personal data before submission.</p><a className="primary-link" href="/api/merl/level1/results-chain-template" download>Download results-chain template (.csv)</a></div>
   </section>}

   <section className="reflection"><h2>Reflection for practice</h2><p>{lesson==='1'?'Choose one intervention you know. Is it genuinely a programme, a project, or an activity presented as a programme? Justify the classification.':lesson==='2'?'Find one existing result statement that merely repeats an activity. Rewrite it as a measurable change in a defined actor or system.':'Identify the weakest causal link in your chain. State the assumption and one practical way to monitor whether it holds.'}</p></section>
   <footer className="lesson-footer"><a href={lesson==='1'?'/merl/foundations':`/merl/foundations/02/${Number(lesson)-1}`}>← {lesson==='1'?'Module overview':'Previous lesson'}</a><a className="primary-link" href={lesson==='3'?'/merl/foundations':`/merl/foundations/02/${Number(lesson)+1}`}>{lesson==='3'?'Return to Module 02 and record evidence':'Continue to next lesson'} →</a></footer>
  </article><aside className="lesson-rail"><b>Progression standard</b><ol><li>Read the concepts and example.</li><li>Complete the guided check.</li><li>Apply the idea to the case.</li><li>Return to Module 02 and record the lesson gate.</li></ol><p>The lesson feedback is formative. Persistent competency requires all lesson gates, a submitted results chain and a passing server-graded quiz.</p></aside></div>
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

import {redirect} from 'next/navigation'
import {createClient} from '../../../lib/supabase/server'

const modules=[
 {id:'06',title:'Data Collection Planning',output:'Operational data-collection plan',lessons:['From Indicator to Data Requirement','Select Sources, Methods and Frequency','Build and Review a Data-Collection Plan']},
 {id:'07',title:'Tools, Protocols and Fieldwork',output:'Tested collection tool and field protocol',lessons:['Question and Tool Design','Field Protocols and Enumerator Preparation','Pilot, Revise and Release a Tool']},
 {id:'08',title:'Sampling for MERL Practice',output:'Defensible sampling plan',lessons:['Populations, Frames and Units','Probability and Purposive Strategies','Calculate, Document and Defend a Sample']},
 {id:'09',title:'Data Quality Assurance',output:'Data-quality assurance plan',lessons:['Quality Dimensions and Risk','Verification, Validation and Correction','Design a Data-Quality Review']},
 {id:'10',title:'Monitoring Systems and Dashboards',output:'Decision-oriented monitoring specification',lessons:['System Architecture and Data Flow','Reporting, Visualisation and Access','Specify a Useful Monitoring System']},
]

export default async function MerlApplied(){
 const supabase=await createClient()
 const {data:{user}}=await supabase.auth.getUser()
 if(!user) redirect('/login?next=%2Fmerl%2Fapplied')
 const {data,error}=await supabase.rpc('get_merl_level1_progress')
 const complete=!error&&modules.slice(0,5).every((_,index)=>Boolean(data?.find((row:{module_id:string;module_completed_at:string|null})=>row.module_id===String(index+1).padStart(2,'0'))?.module_completed_at))

 return <main className="applied-shell">
  <a className="skip-link" href="#level-two-modules">Skip to Level 2 modules</a>
  <nav aria-label="Breadcrumb"><a href="/merl/foundations">MERL Level 1</a><span aria-hidden="true"> / </span><span>Level 2</span></nav>
  <header><p>MERL PROFESSIONAL PATHWAY · LEVEL 2</p><h1>Applied Monitoring Systems</h1><span>Turn results frameworks into ethical, reliable and decision-ready data systems.</span></header>
  <section className={complete?'gate open':'gate'} aria-labelledby="entry-heading"><div><p>ENTRY GATE</p><h2 id="entry-heading">{complete?'FOUNDATIONS VERIFIED':'LEVEL 2 LOCKED'}</h2></div><p>{complete?'All five Level 1 modules are competent. Applied learning may begin.':'Complete all five Level 1 competency gates before beginning Applied Monitoring Systems.'}</p></section>
  <section className="level-outcomes" aria-labelledby="outcomes-heading"><h2 id="outcomes-heading">Level 2 professional outcomes</h2><ul><li>Translate indicators into operational data requirements and collection schedules.</li><li>Select defensible sources, methods and samples for specific decisions.</li><li>Design tools, protocols and quality controls that reduce avoidable error and harm.</li><li>Specify monitoring systems and dashboards whose outputs lead to action.</li></ul></section>
  <section id="level-two-modules" aria-labelledby="modules-heading"><h2 id="modules-heading">Learning sequence</h2><div className="module-grid">{modules.map((module,index)=><article key={module.id} aria-labelledby={`module-${module.id}`}><div><b>{module.id}</b><span>{index<4&&complete?'AVAILABLE':'PLANNED'}</span></div><h3 id={`module-${module.id}`}>{module.title}</h3><p>Professional output: <b>{module.output}</b></p><ol>{module.lessons.map((lesson,lessonIndex)=><li key={lesson}>{index<4&&complete?<a href={`/merl/applied/${module.id}/${lessonIndex+1}`}>{module.id}.{lessonIndex+1} {lesson}</a>:<span>{module.id}.{lessonIndex+1} {lesson}</span>}</li>)}</ol></article>)}</div></section>
  <aside className="build-note" role="note"><b>Progression notice:</b> Modules 06–09 now include all lessons and professional templates. Persistent Level 2 evidence and assessment gates will be enabled only after their database rules and acceptance tests are deployed.</aside>
  <footer><a href="/merl/foundations/portfolio">← Review Level 1 portfolio</a></footer>
  <style>{`
   .applied-shell{max-width:1120px;margin:auto;padding:36px 24px 64px;color:#0b2c4d;font-family:system-ui}.applied-shell a{color:#1565c0}.applied-shell a:focus-visible{outline:3px solid #f4a261;outline-offset:3px}.skip-link{position:absolute;left:-9999px}.skip-link:focus{left:12px;top:8px;background:white;padding:10px}.applied-shell>header{margin:24px 0;padding:38px;border-radius:14px;background:#0b2c4d;color:white}.applied-shell>header p{color:#f4a261;font-size:12px;font-weight:800;letter-spacing:1.5px}.applied-shell>header h1{font:700 44px/1.08 Georgia,serif;margin:10px 0}.applied-shell>header span{color:#d7e0e8;font-size:18px}.gate{display:grid;grid-template-columns:1fr 2fr;gap:24px;padding:22px;border:2px solid #a65300;border-radius:12px;background:#fff4e8}.gate.open{border-color:#2c7a5c;background:#eef8f1}.gate p{line-height:1.55}.gate div p{font-size:12px;letter-spacing:1px;margin:0}.gate h2{margin:5px 0;font-family:Georgia,serif}.applied-shell>section{margin-top:30px}.level-outcomes{padding:22px;border-left:5px solid #f4a261;background:#f6f8fb}.level-outcomes li{margin:9px 0;line-height:1.5}.module-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.module-grid article{padding:22px;border:1px solid #d7dee7;border-radius:12px}.module-grid article:first-child{grid-column:1/-1;border-top:5px solid #f4a261}.module-grid article>div{display:flex;justify-content:space-between}.module-grid article>div>b{font-size:25px}.module-grid article>div>span{font-size:12px;font-weight:800;color:#7a430d}.module-grid h3{font:700 24px Georgia,serif}.module-grid li{margin:10px 0;line-height:1.45}.module-grid a{font-weight:800}.build-note{margin-top:26px;padding:18px;border:1px solid #d7dee7;border-radius:10px}.applied-shell footer{margin-top:28px;padding-top:20px;border-top:1px solid #d7dee7}.applied-shell footer a{display:flex;align-items:center;min-height:44px}
   @media(max-width:700px){.applied-shell{padding:24px 14px}.applied-shell>header{padding:26px 18px}.applied-shell>header h1{font-size:34px}.gate,.module-grid{grid-template-columns:1fr}.module-grid article:first-child{grid-column:auto}}
  `}</style>
 </main>
}

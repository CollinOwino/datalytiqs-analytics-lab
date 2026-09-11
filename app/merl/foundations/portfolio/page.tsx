import {redirect} from 'next/navigation'
import {createClient} from '../../../../lib/supabase/server'
import PortfolioControls from './portfolio-controls'

type Progress={module_id:string;lesson_evidence:Record<string,boolean>|null;evidence_submission:unknown;quiz_score:number|null;quiz_passed:boolean;quiz_attempts:number;module_completed_at:string|null}

const modules=[
 {id:'01',title:'Introduction to Monitoring, Evaluation and Learning',output:'Evidence-function classification matrix'},
 {id:'02',title:'Project and Programme Logic',output:'Results chain'},
 {id:'03',title:'Theory of Change',output:'Theory of Change'},
 {id:'04',title:'Logical Frameworks',output:'Professional logframe'},
 {id:'05',title:'Introduction to Indicators',output:'Quality-assured indicator set'},
]

export default async function MerlPortfolioReview(){
 const supabase=await createClient()
 const {data:{user}}=await supabase.auth.getUser()
 if(!user) redirect('/login?next=%2Fmerl%2Ffoundations%2Fportfolio')
 const {data,error}=await supabase.rpc('get_merl_level1_progress')
 const rows=(data??[]) as Progress[]
 const progress=Object.fromEntries(rows.map(row=>[row.module_id,row])) as Record<string,Progress>
 const ready=modules.every(module=>Boolean(progress[module.id]?.module_completed_at))
 const isTestAccount=user.app_metadata?.test_account===true||user.app_metadata?.is_test_account===true||user.app_metadata?.data_classification==='acceptance_test'
 const completed=modules.filter(module=>progress[module.id]?.module_completed_at).length
 const gates=modules.reduce((total,module)=>{const row=progress[module.id];return total+[0,1,2].filter(index=>row?.lesson_evidence?.[`${module.id}-${index}`]).length+(row?.evidence_submission?1:0)+(row?.quiz_passed?1:0)},0)

 return <main className="portfolio-shell">
  <a className="skip-link" href="#portfolio-summary">Skip to portfolio summary</a>
  <nav aria-label="Breadcrumb"><a href="/merl/foundations">MERL Level 1</a><span aria-hidden="true"> / </span><span>Portfolio review</span></nav>
  <header className="portfolio-hero"><p>MERL PROFESSIONAL PATHWAY · LEVEL 1</p><h1>Competency portfolio review</h1><span>Review the evidence trail before requesting human assessment. Completion confirms that system gates passed; it does not replace professional judgement.</span></header>
  {isTestAccount&&<aside className="test-note" role="note" aria-label="Acceptance-test learner account"><b>ACCEPTANCE-TEST LEARNER</b><br/>This is synthetic test evidence. It must not be used for certification or included in real learner analytics.</aside>}
  {error&&<p className="error" role="alert">The portfolio could not be loaded: {error.message}</p>}
  <section id="portfolio-summary" className="summary" aria-labelledby="summary-heading"><div><p>Credential readiness</p><h2 id="summary-heading">{ready?'READY FOR HUMAN REVIEW':'IN PROGRESS'}</h2></div><dl><div><dt>Modules competent</dt><dd>{completed}/5</dd></div><div><dt>Evidence gates</dt><dd>{gates}/25</dd></div><div><dt>Assessment rule</dt><dd>70% quiz pass + evidence</dd></div></dl></section>
  <section aria-labelledby="inventory-heading"><h2 id="inventory-heading">Competency and evidence inventory</h2><div className="table-wrap"><table><thead><tr><th>Module</th><th>Professional output</th><th>Lesson gates</th><th>Quiz record</th><th>Status</th></tr></thead><tbody>{modules.map(module=>{const row=progress[module.id];const lessonCount=[0,1,2].filter(index=>row?.lesson_evidence?.[`${module.id}-${index}`]).length;return <tr key={module.id}><th scope="row"><span>{module.id}</span> {module.title}</th><td>{module.output}<br/><small>{row?.evidence_submission?'Submitted and stored':'Not submitted'}</small></td><td>{lessonCount}/3 recorded</td><td>{row?.quiz_score==null?'Not attempted':`${row.quiz_score}% · ${row.quiz_attempts}/2 attempt${row.quiz_attempts===1?'':'s'}`}</td><td><b className={row?.module_completed_at?'competent':'pending'}>{row?.module_completed_at?'COMPETENT':'PENDING'}</b></td></tr>})}</tbody></table></div></section>
  <section className="review-standard" aria-labelledby="review-heading"><h2 id="review-heading">Human review standard</h2><ol><li><b>Authenticity:</b> the evidence is attributable to the learner and appropriate for professional review.</li><li><b>Technical quality:</b> the result logic, indicators, assumptions and evidence functions are defensible.</li><li><b>Usefulness:</b> the work supports a specified management, accountability or learning decision.</li><li><b>Integrity:</b> limitations are disclosed and confidential or personal data are handled appropriately.</li></ol></section>
  <PortfolioControls ready={ready&&!error}/>
  <footer><a href="/merl/foundations">← Return to MERL Level 1</a>{ready&&<a className="next-level" href="/merl/applied">Continue to Level 2 →</a>}<p>Generated from the authenticated learner record. Quiz answers and the protected answer key are excluded.</p></footer>
  <style>{`
   :root{color-scheme:light}.portfolio-shell{max-width:1120px;margin:auto;padding:36px 24px 64px;color:#0b2c4d;font-family:system-ui;background:#fff;min-height:100vh}.portfolio-shell a{color:#1565c0}.portfolio-shell a:focus-visible,.portfolio-shell button:focus-visible,.portfolio-shell input:focus-visible{outline:3px solid #f4a261;outline-offset:3px}.skip-link{position:absolute;left:-9999px;top:8px;background:white;padding:10px;border:2px solid #0b2c4d}.skip-link:focus{left:12px}.portfolio-hero{margin:24px 0;padding:34px;border-radius:14px;background:#0b2c4d;color:white}.portfolio-hero p{color:#f4a261;font-size:12px;font-weight:800;letter-spacing:1.5px}.portfolio-hero h1{font:700 42px/1.1 Georgia,serif;margin:10px 0}.portfolio-hero span{display:block;max-width:780px;color:#d7e0e8;line-height:1.6}.test-note,.error{margin:18px 0;padding:15px;border:2px solid #a65300;border-radius:10px;background:#fff4e8;color:#613000}.summary{display:grid;grid-template-columns:1fr 2fr;gap:24px;align-items:center;padding:24px;border:1px solid #d7dee7;border-radius:12px;background:#f6f8fb}.summary p{margin:0;font-size:13px;text-transform:uppercase;letter-spacing:1px}.summary h2{margin:6px 0;color:#175d43}.summary dl{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:0}.summary dl div{padding-left:14px;border-left:3px solid #f4a261}.summary dt{font-size:13px}.summary dd{margin:4px 0 0;font-weight:800}.portfolio-shell>section{margin-top:28px}.portfolio-shell h2{font-family:Georgia,serif}.table-wrap{overflow-x:auto;border:1px solid #d7dee7;border-radius:12px}table{width:100%;border-collapse:collapse}th,td{padding:14px;border-bottom:1px solid #d7dee7;text-align:left;vertical-align:top}thead th{background:#0b2c4d;color:white}tbody tr:last-child th,tbody tr:last-child td{border-bottom:0}tbody th span{display:inline-block;margin-right:7px;color:#a65300}.competent{color:#175d43}.pending{color:#7a430d}.review-standard,.review-controls{padding:22px;border:1px solid #d7dee7;border-radius:12px}.review-standard{border-left:5px solid #f4a261}.review-standard li{margin:9px 0;line-height:1.55}.declaration{display:flex;gap:12px;align-items:flex-start;line-height:1.55}.declaration input{width:22px;height:22px;flex:0 0 auto}.review-guidance,.control-status{line-height:1.55}.review-controls button{min-height:46px;padding:10px 16px;border:0;border-radius:7px;background:#f4a261;color:#081f33;font:700 16px system-ui}.review-controls button:disabled{background:#d7dee7;color:#596775}.portfolio-shell footer{margin-top:30px;padding-top:20px;border-top:1px solid #d7dee7;display:flex;justify-content:space-between;gap:20px}.portfolio-shell footer p{margin:0;color:#596775;font-size:13px}.portfolio-shell footer a{min-height:44px;display:flex;align-items:center}
   .next-level{font-weight:800}.portfolio-shell footer p{max-width:360px}@media(max-width:720px){.portfolio-shell{padding:24px 14px}.portfolio-hero{padding:24px 18px}.portfolio-hero h1{font-size:32px}.summary{grid-template-columns:1fr}.summary dl{grid-template-columns:1fr}.portfolio-shell footer{flex-direction:column}}
   @media print{.skip-link,nav,.review-controls button,.control-status,.portfolio-shell footer a{display:none!important}.portfolio-shell{max-width:none;padding:0}.portfolio-hero{background:white;color:#0b2c4d;border:2px solid #0b2c4d}.portfolio-hero p,.portfolio-hero span{color:#0b2c4d}.test-note{border-color:#0b2c4d;background:white}.summary,.review-standard,.review-controls{break-inside:avoid}.table-wrap{overflow:visible}table{font-size:11px}}
  `}</style>
 </main>
}

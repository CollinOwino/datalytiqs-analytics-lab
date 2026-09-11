import {redirect} from 'next/navigation'
import {createClient} from '../../../../lib/supabase/server'
import PortfolioControls from './portfolio-controls'
const modules=[
 ['06','Data Collection Planning','Operational data-collection plan'],
 ['07','Tools, Protocols and Fieldwork','Tested collection tool and field protocol'],
 ['08','Sampling for MERL Practice','Defensible sampling plan'],
 ['09','Data Quality Assurance','Data-quality assurance plan'],
 ['10','Monitoring Systems and Dashboards','Decision-oriented monitoring specification'],
] as const
type Progress={module_id:string;lesson_evidence:Record<string,boolean>|null;evidence_submission:unknown;quiz_score:number|null;quiz_passed:boolean;quiz_attempts:number;module_completed_at:string|null}
export default async function Level2Portfolio(){
 const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login?next=%2Fmerl%2Fapplied%2Fportfolio')
 const{data,error}=await supabase.rpc('get_merl_level2_progress');if(error)throw new Error(error.message)
 const progress:Record<string,Progress>={};(data??[]).forEach((row:Progress)=>progress[row.module_id]=row)
 const completed=modules.filter(([id])=>progress[id]?.module_completed_at).length
 const gates=modules.reduce((n,[id])=>n+[0,1,2].filter(i=>progress[id]?.lesson_evidence?.[`${id}-${i}`]).length+(progress[id]?.evidence_submission?1:0)+(progress[id]?.quiz_passed?1:0),0)
 const ready=completed===5&&gates===25,isTest=user.app_metadata?.test_account===true||user.app_metadata?.is_test_account===true||user.app_metadata?.data_classification==='acceptance_test'
 return <main className="portfolio"><nav><a href="/merl/applied">← Level 2 modules</a></nav><header><p>MERL PROFESSIONAL PATHWAY · LEVEL 2</p><h1>Applied competency portfolio</h1><span>System completion verifies the evidence trail; professional certification still requires human judgement.</span></header>
  {isTest&&<aside className="test" role="note"><b>ACCEPTANCE-TEST LEARNER</b><br/>Synthetic evidence must not be used for certification or real learner reporting.</aside>}
  <section className={ready?'summary ready':'summary'}><div><p>Credential readiness</p><h2>{ready?'READY FOR HUMAN REVIEW':'IN PROGRESS'}</h2></div><dl><div><dt>Modules competent</dt><dd>{completed}/5</dd></div><div><dt>Evidence gates</dt><dd>{gates}/25</dd></div><div><dt>Assessment rule</dt><dd>70% + evidence</dd></div></dl></section>
  <section><h2>Evidence inventory</h2><div className="table-wrap"><table><thead><tr><th>Module</th><th>Professional output</th><th>Lesson gates</th><th>Quiz record</th><th>Status</th></tr></thead><tbody>{modules.map(([id,title,output])=>{const row=progress[id],lessons=[0,1,2].filter(i=>row?.lesson_evidence?.[`${id}-${i}`]).length;return <tr key={id}><th><span>{id}</span> {title}</th><td>{output}<br/><small>{row?.evidence_submission?'Submitted and stored':'Not submitted'}</small></td><td>{lessons}/3</td><td>{row?.quiz_score==null?'Not attempted':`${row.quiz_score}% · ${row.quiz_attempts}/2 attempt${row.quiz_attempts===1?'':'s'}`}</td><td><b className={row?.module_completed_at?'competent':'pending'}>{row?.module_completed_at?'COMPETENT':'PENDING'}</b></td></tr>})}</tbody></table></div></section>
  <section className="standard"><h2>Human review standard</h2><ol><li><b>Technical validity:</b> methods and specifications are defensible and internally consistent.</li><li><b>Operational usefulness:</b> outputs support named decisions, roles and deadlines.</li><li><b>Quality and ethics:</b> risks, limitations, access and protection controls are explicit.</li><li><b>Integration:</b> collection, sampling, assurance, reporting and learning form a coherent system.</li></ol></section>
  {ready?<PortfolioControls/>:<p className="notice"><b>Portfolio submission remains locked until all 25 competency gates pass.</b></p>}
  <style>{`
   .portfolio{max-width:1120px;margin:auto;padding:36px 24px 64px;color:#0b2c4d;font-family:system-ui}.portfolio a{color:#1565c0}.portfolio>header{margin:24px 0;padding:36px;background:#0b2c4d;color:white;border-radius:14px}.portfolio>header p{color:#f4a261;font-size:12px;font-weight:800;letter-spacing:1.4px}.portfolio h1{font:700 42px Georgia,serif;margin:8px 0}.portfolio>header span{color:#d7e0e8}.test,.summary,.standard,.notice{padding:20px;margin:22px 0;border:1px solid #d7dee7;border-radius:12px}.test{background:#fff4e8;border:2px solid #a65300}.summary{display:grid;grid-template-columns:1fr 2fr;gap:24px;background:#f6f8fb}.summary.ready{background:#eef8f1}.summary dl{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.summary dd{font-size:20px;font-weight:800;margin:7px 0}.table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse}th,td{padding:13px;border:1px solid #d7dee7;text-align:left;vertical-align:top}thead th{background:#0b2c4d;color:white}.competent{color:#175d43}.pending{color:#8a4600}.standard li{margin:10px 0;line-height:1.55}.portfolio a:focus-visible{outline:3px solid #f4a261;outline-offset:3px}
   @media(max-width:700px){.portfolio{padding:24px 14px}.portfolio>header{padding:25px 18px}.portfolio h1{font-size:32px}.summary{grid-template-columns:1fr}.summary dl{grid-template-columns:1fr 1fr}}@media print{.portfolio{max-width:none;padding:0}.portfolio nav,.test{display:none}.portfolio>header{background:white;color:#0b2c4d;padding:0}.portfolio>header span{color:#0b2c4d}table{font-size:11px}}
  `}</style>
 </main>
}

const stages = [
  {n:'01',title:'Understand the Management Problem',objective:'Frame the school leadership problem before touching the data.',tasks:['Read the student brief and management context','Identify the principal decision-makers and stakeholders','State the core management problem in your own words','Formulate 3–5 analytical questions the evidence should answer'],deliverable:'Problem statement + analytical questions'},
  {n:'02',title:'Inspect & Prepare the Dataset',objective:'Establish whether the supplied data are analytically ready and document any limitations.',tasks:['Open Case_001_Dataset.xlsx','Review rows, columns, variable names and data types','Check missing values, duplicates and implausible values','Create a short data-quality note before analysis'],deliverable:'Data-quality assessment'},
  {n:'03',title:'Conduct Descriptive Analysis',objective:'Establish the school’s major academic performance patterns.',tasks:['Calculate appropriate summary statistics','Compare performance across relevant learner groups','Examine attendance and other contextual variables','Produce clear tables and visualisations'],deliverable:'Descriptive evidence + charts'},
  {n:'04',title:'Investigate Performance Drivers',objective:'Examine factors associated with academic outcomes without overstating causality.',tasks:['Define outcome and explanatory variables','Explore correlations and group differences','Apply suitable inferential/modelling methods where justified','Document assumptions and statistical limitations'],deliverable:'Driver analysis + statistical evidence'},
  {n:'05',title:'Translate Findings into Management Insights',objective:'Convert statistical results into defensible management intelligence.',tasks:['Identify the most decision-relevant findings','Separate evidence from interpretation','Explain implications for school leadership','Prioritise feasible evidence-based interventions'],deliverable:'Insights + recommended actions'},
  {n:'06',title:'Prepare & Submit the Final Analytical Report',objective:'Produce a concise decision-oriented report that is technically defensible.',tasks:['State the problem, data and analytical methods','Present the strongest findings with tables/charts','Provide interpretation and recommendations','Declare limitations and submit for instructor review'],deliverable:'Final analytical report'}
]

export default function Case001(){
 return <main className="case-workspace">
  <aside className="case-rail">
   <a className="back" href="/">← Dashboard</a>
   <div className="rail-brand"><b>DatalytIQs</b><span>Analytics Lab</span></div>
   <div className="rail-case"><small>ACTIVE CASE</small><strong>001</strong><p>Secondary School Performance Analytics</p></div>
   <div className="rail-progress"><div><span>Progress</span><b>0%</b></div><div className="progress-track"><i/></div></div>
   <nav>{stages.map((s,i)=><a className={i===0?'current':''} href={`#stage-${s.n}`} key={s.n}><span>{s.n}</span><b>{s.title}</b></a>)}</nav>
  </aside>

  <section className="case-main">
   <header className="workspace-top"><div><span className="eyebrow">CASE STUDY 001 · FOUNDATION CASE</span><h1>Secondary School Performance Analytics</h1><p>Evidence-Based Academic Management</p></div><div className="workspace-actions"><button className="ghost">Student Brief</button><button className="dataset-button">Dataset · XLSX</button></div></header>

   <section className="case-intro">
    <div><span className="eyebrow gold">THE MANAGEMENT CONTEXT</span><h2>From school records to defensible academic decisions.</h2><p>A school leadership team requires a rigorous assessment of student performance and the factors associated with academic outcomes. Your role is to analyse the supplied dataset and translate the evidence into practical management recommendations.</p></div>
    <div className="mission-card"><small>YOUR MISSION</small><p>Produce an analytical report that answers management questions with appropriate statistical evidence—not intuition alone.</p><div><span>TOOL</span><b>Python</b></div><div><span>DATA</span><b>Excel / CSV</b></div><div><span>OUTPUT</span><b>Decision-oriented report</b></div></div>
   </section>

   <section className="resources"><article><span>01</span><div><small>RESOURCE</small><b>Student Brief</b><p>Problem context, learner instructions and expected outputs.</p></div><button>Open →</button></article><article><span>02</span><div><small>DATASET</small><b>Case_001_Dataset.xlsx</b><p>Primary dataset for the complete analytical workflow.</p></div><button>Load →</button></article><article><span>03</span><div><small>WORKSPACE</small><b>Python Analytics</b><p>Data exploration, code, statistical outputs and charts.</p></div><button>Launch →</button></article></section>

   <section className="workspace-path"><div className="workspace-heading"><div><span className="eyebrow">ANALYTICAL WORKFLOW</span><h2>Six stages. One evidence chain.</h2></div><p>Work sequentially. Each stage creates evidence or interpretation that feeds directly into your final submission.</p></div>
   {stages.map((s,i)=><article className={`stage-card ${i===0?'stage-open':''}`} id={`stage-${s.n}`} key={s.n}>
    <div className="stage-index"><span>STAGE</span><b>{s.n}</b></div>
    <div className="stage-body"><div className="stage-card-head"><div><h3>{s.title}</h3><p>{s.objective}</p></div><span className={i===0?'ready':'locked'}>{i===0?'READY':'LOCKED'}</span></div>
     <div className="stage-detail"><div><h4>Required work</h4><ol>{s.tasks.map(t=><li key={t}>{t}</li>)}</ol></div><div className="deliverable"><small>STAGE DELIVERABLE</small><b>{s.deliverable}</b><p>{i===0?'Complete the requirements and save your response to unlock the next stage.':'Complete the preceding stage to unlock this work.'}</p></div></div>
     <div className="stage-footer"><span>{i===0?'0 of 4 tasks completed':'Prerequisite not completed'}</span><button disabled={i!==0}>{i===0?'Begin Stage 01 →':'Locked'}</button></div>
    </div>
   </article>)}
   </section>
  </section>
 </main>
}

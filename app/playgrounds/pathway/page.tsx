'use client'

import {useEffect,useMemo,useState} from 'react'
import './pathway.css'

type QuizItem={q:string;options:string[];answer:number;explanation:string}
type Pathway={
 key:string;caseId:string;domain:string;title:string;file:string;level:string;duration:string;question:string;
 outcomes:string[];lesson:{title:string;concepts:{heading:string;body:string}[]};
 guided:{title:string;steps:{title:string;instruction:string;code:string}[]};
 lab:{brief:string;requirements:string[];evidence:string[]};
 quiz:QuizItem[];
 portfolio:{title:string;scenario:string;deliverables:string[];rubric:string[]}
}

const pathways:Record<string,Pathway>={
 case001:{
  key:'case001',caseId:'001',domain:'Education',title:'School Performance Analytics',file:'Case_001_Dataset.xlsx',level:'Foundation–intermediate',duration:'6–8 hours',question:'What patterns in the school-performance dataset deserve management attention?',
  outcomes:['Profile a school dataset and identify material quality defects','Summarise achievement and participation indicators responsibly','Compare groups without confusing association with causation','Build an accessible management chart','Write a qualified evidence-based recommendation'],
  lesson:{title:'From school records to defensible decisions',concepts:[
   {heading:'Measurement before comparison',body:'Confirm what each field represents, its unit, valid range and missing-value convention. A mean is not interpretable until the population, period and denominator are clear.'},
   {heading:'Distribution and variation',body:'Report centre together with spread. Median and interquartile range are often more robust than a mean when scores are skewed or contain extreme values.'},
   {heading:'Responsible group comparison',body:'A difference between groups is descriptive evidence, not proof of cause. Check group size, missingness, selection effects and plausible confounders before recommending action.'},
   {heading:'Decision communication',body:'A useful management finding states the result, quantifies its magnitude, explains uncertainty and links it to a proportionate follow-up action.'}
  ]},
  guided:{title:'Profile, compare and communicate',steps:[
   {title:'Inspect structure',instruction:'Establish dimensions, field types and missingness before calculating results.',code:'print(df.shape)\nprint(df.dtypes)\ndf.isna().sum().sort_values(ascending=False)'},
   {title:'Validate numerical fields',instruction:'Inspect ranges and improbable values; do not silently delete records.',code:'numeric=df.select_dtypes(include="number")\nnumeric.agg(["min","median","mean","max"]).T.round(2)'},
   {title:'Summarise variation',instruction:'Produce a transparent descriptive profile.',code:'numeric.describe().T.assign(iqr=lambda x:x["75%"]-x["25%"]).round(2)'},
   {title:'Compare one grouping',instruction:'Select a defensible categorical field and compare count, mean and median.',code:'group=df.select_dtypes(exclude="number").columns[0]\nscore=numeric.columns[0]\ndf.groupby(group)[score].agg(["count","mean","median","std"]).round(2)'},
   {title:'Visualise and interpret',instruction:'Create a labelled distribution; write two findings and one limitation.',code:'import matplotlib.pyplot as plt\ndf[score].dropna().plot.hist(bins=12,edgecolor="white",title=f"Distribution of {score}")\nplt.xlabel(score);plt.ylabel("Records");plt.tight_layout();plt.show()'}
  ]},
  lab:{brief:'Act as an education analyst preparing a quality-assured briefing for a school management team.',requirements:['Create a field-level quality table','Select and justify three decision indicators','Compare one meaningful subgroup with the overall population','Produce one distribution and one comparison chart','Write a 150-word interpretation with a limitation'],evidence:['Reproducible Python script or notebook','Quality table and two charts','Indicator definitions','Decision note with no causal overclaim']},
  quiz:[
   {q:'Why inspect missingness before calculating a school mean?',options:['It makes charts colourful','Missingness may bias the result','It guarantees causality','It removes the need for sample sizes'],answer:1,explanation:'If missing records differ systematically, the reported mean may not represent the intended population.'},
   {q:'Which pair best reports a skewed score distribution?',options:['Median and IQR','Maximum and colour','Mean only','Count and filename'],answer:0,explanation:'Median and IQR are resistant to extreme observations and describe centre and spread.'},
   {q:'A subgroup has a higher average score. What can be concluded?',options:['Membership caused the score','The difference is descriptive and needs investigation','The lower group failed','No sample sizes are needed'],answer:1,explanation:'An observed association does not establish a causal mechanism.'},
   {q:'What should a comparison table always include?',options:['Only percentages','Group sizes and defined measures','A prediction','Personal identifiers'],answer:1,explanation:'Counts reveal the evidence base behind each estimate and help prevent misleading comparisons.'},
   {q:'What is the strongest management statement?',options:['Scores are bad','The median fell 6 points; verify attendance and assessment consistency before intervention','Teachers caused the decline','The chart proves everything'],answer:1,explanation:'It quantifies the finding, qualifies it and proposes proportionate follow-up.'}
  ],
  portfolio:{title:'School Performance Evidence Brief',scenario:'Prepare a reproducible evidence brief for a board meeting without exposing learner-level identities.',deliverables:['Clean analytical notebook','Two publication-ready charts','One-page management brief','Data-quality appendix'],rubric:['Accuracy and reproducibility — 30%','Statistical reasoning — 25%','Visual communication — 20%','Decision relevance — 15%','Ethics and limitations — 10%']}
 },
 macro:{
  key:'macro',caseId:'pg-kenya-macro',domain:'Economics',title:'Kenya Macroeconomic Indicators',file:'kenya_macro_illustrative.csv',level:'Intermediate',duration:'7–9 hours',question:'How do growth, inflation, policy rates and public debt move across time?',
  outcomes:['Distinguish levels, rates and index values','Calculate annual changes and moving averages','Examine co-movement without claiming causation','Annotate turning points in time-series charts','Write a policy-aware economic interpretation'],
  lesson:{title:'Reading macroeconomic movement responsibly',concepts:[
   {heading:'Levels, rates and indices',body:'A level measures magnitude, a growth rate measures relative change and an index measures movement from a reference base. They cannot be compared as if they share one unit.'},
   {heading:'Nominal and real interpretation',body:'Nominal measures include price effects; real measures aim to isolate volume. Always identify which concept a field represents before interpreting growth.'},
   {heading:'Time ordering and policy lags',body:'Policy changes may affect prices and output after a delay. Same-year correlation is therefore an incomplete test of economic mechanism.'},
   {heading:'Correlation is not policy impact',body:'Co-movement can reflect common shocks, trends, reverse causality or omitted variables. Use it to frame questions, not to announce causal effects.'}
  ]},
  guided:{title:'Trend, transform and qualify',steps:[
   {title:'Parse and order time',instruction:'Validate the time key and ensure chronological order.',code:'print(df.dtypes)\ndf=df.sort_values("year")\nprint(df["year"].is_unique)\ndf.head()'},
   {title:'Create changes',instruction:'Calculate transparent year-to-year changes for selected rates.',code:'for c in ["inflation_pct","policy_rate_pct","public_debt_gdp_pct"]:\n    df[c+"_change"]=df[c].diff()\ndf.tail()'},
   {title:'Smooth a volatile series',instruction:'Use a three-period moving average and retain the original.',code:'df["inflation_ma3"]=df["inflation_pct"].rolling(3).mean()\ndf[["year","inflation_pct","inflation_ma3"]]'},
   {title:'Examine co-movement',instruction:'Calculate correlations as descriptive evidence only.',code:'cols=["real_gdp_growth_pct","inflation_pct","policy_rate_pct","public_debt_gdp_pct"]\ndf[cols].corr().round(2)'},
   {title:'Build a time-series figure',instruction:'Plot rates with units and a neutral title.',code:'import matplotlib.pyplot as plt\ndf.plot(x="year",y=["inflation_pct","policy_rate_pct"],marker="o",figsize=(9,5))\nplt.ylabel("Percent");plt.title("Illustrative inflation and policy-rate paths");plt.tight_layout();plt.show()'}
  ]},
  lab:{brief:'Prepare a macroeconomic monitoring note using the illustrative series, explicitly separating observation from explanation.',requirements:['Validate units and time coverage','Calculate at least two annual-change measures','Identify two turning points','Test one lagged descriptive relationship','Write a 200-word qualified policy interpretation'],evidence:['Reproducible notebook','Indicator dictionary','Two time-series charts','Policy note identifying illustrative status and limitations']},
  quiz:[
   {q:'What does an index value primarily show?',options:['Movement relative to a base','A currency amount','A causal effect','A sample size'],answer:0,explanation:'An index expresses relative position against a specified base period.'},
   {q:'Why might policy rates and inflation not move simultaneously?',options:['They are unrelated by definition','Transmission can occur with lags','Years have no order','Inflation is always constant'],answer:1,explanation:'Monetary-policy transmission and underlying shocks unfold over time.'},
   {q:'A strong correlation proves that rate increases reduced inflation.',options:['True','False'],answer:1,explanation:'Correlation alone cannot distinguish policy effects from trends, common shocks or reverse causality.'},
   {q:'Why retain the original series beside a moving average?',options:['To preserve actual variation and transparency','To double row count','To remove units','To guarantee forecasting accuracy'],answer:0,explanation:'Smoothing aids pattern recognition but can conceal turning points and extremes.'},
   {q:'Which statement is properly qualified?',options:['Debt caused slow growth','Growth and debt moved inversely in this illustrative period; causal assessment needs additional evidence','The chart predicts the next election','Policy has no lags'],answer:1,explanation:'It states the observed pattern and the evidential limitation.'}
  ],
  portfolio:{title:'Macroeconomic Monitoring Note',scenario:'Create an executive monitoring product for a policy and business audience using explicitly illustrative data.',deliverables:['Reproducible time-series notebook','Indicator metadata table','Two annotated charts','Two-page executive note'],rubric:['Transformation accuracy — 25%','Economic reasoning — 30%','Visual evidence — 20%','Policy qualification — 15%','Reproducibility — 10%']}
 },
 counties:{
  key:'counties',caseId:'pg-county-services',domain:'Governance',title:'County Service-Delivery Indicators',file:'county_services_illustrative.csv',level:'Intermediate',duration:'7–9 hours',question:'Which service-delivery gaps and peer differences merit management attention?',
  outcomes:['Define comparable county indicators and denominators','Benchmark without constructing arbitrary rankings','Identify outliers requiring verification','Separate fiscal inputs, outputs and citizen outcomes','Develop a proportionate service-improvement recommendation'],
  lesson:{title:'Benchmarking public services without misleading rankings',concepts:[
   {heading:'Comparability first',body:'County values are comparable only when definitions, periods, denominators and coverage are aligned. Raw totals often reflect population size rather than performance.'},
   {heading:'Inputs, outputs and outcomes',body:'Revenue and expenditure absorption are inputs or process measures; visits and registrations are outputs; access and satisfaction are closer to outcomes. Do not combine them without a defensible model.'},
   {heading:'Peer benchmarking',body:'Compare a county with a relevant peer distribution and show distance from the median. A league table without context can punish structurally different jurisdictions.'},
   {heading:'Outliers as questions',body:'An extreme value may represent exceptional performance, a data-quality problem or a different reporting scope. Verify before celebrating or sanctioning.'}
  ]},
  guided:{title:'Define, benchmark and investigate',steps:[
   {title:'Inspect county coverage',instruction:'Confirm unique county records and field completeness.',code:'print(df.shape)\nprint(df["county_name"].nunique())\ndf.isna().sum()'},
   {title:'Profile indicators',instruction:'Summarise ranges and medians with units retained.',code:'num=df.select_dtypes(include="number")\nnum.describe().T[["min","50%","mean","max"]].round(2)'},
   {title:'Create a transparent benchmark',instruction:'Calculate distance from the median for one indicator.',code:'indicator="water_access_pct"\nmedian=df[indicator].median()\ndf[["county_name",indicator]].assign(gap_from_median=lambda x:x[indicator]-median).sort_values(indicator)'},
   {title:'Check relationships',instruction:'Compare fiscal process and citizen outcome indicators cautiously.',code:'df[["development_budget_absorption_pct","citizen_satisfaction_pct","water_access_pct"]].corr().round(2)'},
   {title:'Show gaps',instruction:'Use a sorted horizontal chart with a neutral benchmark line.',code:'import matplotlib.pyplot as plt\nx=df.sort_values(indicator)\nax=x.plot.barh(x="county_name",y=indicator,legend=False,figsize=(8,6))\nax.axvline(median,color="red",linestyle="--",label="Median");ax.legend();plt.xlabel("Percent");plt.tight_layout();plt.show()'}
  ]},
  lab:{brief:'Produce a county peer-benchmarking brief that avoids a simplistic composite league table.',requirements:['Document denominators and measurement types','Select one access, one fiscal and one citizen indicator','Calculate median gaps and flag potential outliers','Create two accessible comparison charts','Recommend verification and improvement actions for one county'],evidence:['Reproducible notebook','Benchmark table','Two charts','One-page decision memo with comparability caveats']},
  quiz:[
   {q:'Why can raw facility visits mislead county comparisons?',options:['Visits have no value','Population and service coverage differ','Percentages are illegal','Counties have identical populations'],answer:1,explanation:'A larger population can generate more visits without indicating better service performance.'},
   {q:'Development-budget absorption is best classified as:',options:['A process measure','A health outcome','A causal effect','A demographic denominator'],answer:0,explanation:'Absorption describes implementation of allocated resources, not the resulting welfare outcome.'},
   {q:'What is the first response to an extreme county value?',options:['Publish a winner','Verify definition, scope and source','Delete it automatically','Assume fraud'],answer:1,explanation:'Outliers need validation before substantive interpretation.'},
   {q:'Why use a peer median?',options:['It is always a target','It supplies a transparent reference less sensitive to extremes','It proves causality','It removes contextual differences'],answer:1,explanation:'The median is a robust descriptive benchmark, though it is not automatically a policy target.'},
   {q:'Which recommendation is strongest?',options:['Rank and shame the bottom county','Verify the low access estimate, examine ward disparities and identify feasible service constraints','Merge every indicator','Ignore denominators'],answer:1,explanation:'It treats the indicator as a prompt for validation and targeted investigation.'}
  ],
  portfolio:{title:'County Service-Delivery Scorecard',scenario:'Prepare a transparent peer-comparison product for a county executive committee without creating an unjustified composite rank.',deliverables:['Indicator framework','Reproducible benchmark notebook','Accessible scorecard charts','Management action memo'],rubric:['Indicator validity — 25%','Benchmarking method — 25%','Public-sector interpretation — 25%','Communication — 15%','Limitations and ethics — 10%']}
 },
 health:{
  key:'health',caseId:'pg-community-health',domain:'Public health',title:'Community Health Service Indicators',file:'community_health_illustrative.csv',level:'Foundation–intermediate',duration:'6–8 hours',question:'What seasonal service and disease patterns require operational follow-up?',
  outcomes:['Distinguish service counts, coverage rates and positivity rates','Assess reporting completeness before trend interpretation','Calculate operational ratios with explicit denominators','Identify possible seasonal patterns without overclaiming','Prepare a privacy-conscious operational follow-up brief'],
  lesson:{title:'Interpreting routine community-health indicators',concepts:[
   {heading:'Counts, coverage and rates',body:'Counts measure activity volume; coverage requires an eligible-population denominator; positivity requires tested cases as its denominator. These answer different questions.'},
   {heading:'Reporting completeness',body:'A decline in reported activity may reflect fewer services or fewer reports. Interpret trends only after checking completeness and reporting scope.'},
   {heading:'Seasonality and small numbers',body:'Monthly fluctuation may be seasonal, random or operational. With few periods, describe the pattern and seek corroborating evidence rather than claiming a stable cycle.'},
   {heading:'Privacy and disclosure',body:'Use aggregated, non-identifiable records. Avoid publishing small-cell combinations that could expose individuals or facilities.'}
  ]},
  guided:{title:'Validate, calculate and monitor',steps:[
   {title:'Validate monthly order',instruction:'Parse the period and verify that no month is duplicated.',code:'import pandas as pd\ndf["month"]=pd.to_datetime(df["month"])\ndf=df.sort_values("month")\nprint(df["month"].is_unique)\ndf.head()'},
   {title:'Check reporting quality',instruction:'Inspect completeness before service trends.',code:'df[["month","reporting_completeness_pct","stockout_days"]].sort_values("reporting_completeness_pct")'},
   {title:'Calculate positivity',instruction:'Use the tested population as denominator and protect against zero.',code:'df["malaria_positivity_pct"]=100*df["malaria_positive"]/df["malaria_tests"].replace(0,float("nan"))\ndf[["month","malaria_tests","malaria_positive","malaria_positivity_pct"]].round(1)'},
   {title:'Compare service paths',instruction:'Standardise only for visual comparison and retain original units.',code:'cols=["facility_visits","children_immunised","anc_first_visit"]\nindexed=df[cols].div(df[cols].iloc[0]).mul(100)\nindexed.index=df["month"]\nindexed.round(1)'},
   {title:'Build an operational chart',instruction:'Plot positivity beside reporting completeness using labelled panels.',code:'import matplotlib.pyplot as plt\nfig,ax=plt.subplots(2,1,figsize=(9,7),sharex=True)\nax[0].plot(df["month"],df["malaria_positivity_pct"],marker="o");ax[0].set_ylabel("Positivity (%)")\nax[1].plot(df["month"],df["reporting_completeness_pct"],marker="o",color="green");ax[1].set_ylabel("Reporting (%)");plt.tight_layout();plt.show()'}
  ]},
  lab:{brief:'Prepare a monthly operational monitoring brief for a sub-county health-management discussion.',requirements:['Audit completeness and zero denominators','Calculate malaria positivity correctly','Compare three service-volume series','Flag months requiring verification','Write a 150-word operational interpretation with privacy safeguards'],evidence:['Reproducible notebook','Quality and indicator table','Two-panel monitoring chart','Follow-up memo distinguishing evidence from hypothesis']},
  quiz:[
   {q:'What is the denominator for malaria positivity?',options:['Total population','People tested for malaria','Facility visits','Reporting facilities'],answer:1,explanation:'Positivity is positive tests divided by all malaria tests performed.'},
   {q:'Why review reporting completeness before interpreting declining visits?',options:['To choose a colour','Fewer reports can mimic a service decline','Completeness proves causality','Visits never change'],answer:1,explanation:'Incomplete reporting can reduce observed counts even when actual activity is unchanged.'},
   {q:'A three-month rise proves a seasonal pattern.',options:['True','False'],answer:1,explanation:'A short run may reflect chance or operations; seasonality requires repeated temporal evidence.'},
   {q:'Which dataset is safest for a public dashboard?',options:['Named patient records','Aggregated non-identifiable indicators with disclosure review','Phone numbers','Unredacted facility registers'],answer:1,explanation:'Aggregation and disclosure review reduce re-identification risk.'},
   {q:'What should happen when the denominator is zero?',options:['Report zero percent automatically','Return missing/undefined and explain','Divide by one','Delete the month silently'],answer:1,explanation:'A rate is undefined when its denominator is zero; transparent missingness is preferable to fabrication.'}
  ],
  portfolio:{title:'Community Health Operations Dashboard',scenario:'Build a privacy-conscious monthly monitoring product that helps managers identify verification and service follow-up priorities.',deliverables:['Validated indicator notebook','Data-quality register','Operational dashboard','One-page action brief'],rubric:['Indicator calculation — 30%','Data-quality reasoning — 25%','Operational interpretation — 20%','Visual clarity — 15%','Privacy and qualification — 10%']}
 }
}

const stageLabels=['Lesson','Guided notebook','Independent lab','Mastery quiz','Portfolio project'] as const

export default function DatasetPathway(){
 const[key,setKey]=useState('case001');const[stage,setStage]=useState(0);const[answers,setAnswers]=useState<Record<number,number>>({});const[submitted,setSubmitted]=useState(false);const[done,setDone]=useState<number[]>([])
 useEffect(()=>{const q=new URLSearchParams(location.search).get('dataset');const selected=q&&pathways[q]?q:'case001';setKey(selected);try{const saved=JSON.parse(localStorage.getItem('dtq-pathway-'+selected)||'{}');setDone(saved.done||[]);setStage(saved.stage||0)}catch{}},[])
 const p=pathways[key]
 const score=useMemo(()=>p.quiz.reduce((n,q,i)=>n+(answers[i]===q.answer?1:0),0),[answers,p])
 const passed=score/p.quiz.length>=.8
 function markComplete(index=stage){const next=Array.from(new Set([...done,index])).sort();setDone(next);localStorage.setItem('dtq-pathway-'+key,JSON.stringify({done:next,stage:Math.min(4,index+1)}));if(index<4)setStage(index+1)}
 function chooseDataset(next:string){setKey(next);setStage(0);setAnswers({});setSubmitted(false);try{const saved=JSON.parse(localStorage.getItem('dtq-pathway-'+next)||'{}');setDone(saved.done||[]);setStage(saved.stage||0)}catch{setDone([])}history.replaceState(null,'',`/playgrounds/pathway?dataset=${next}`)}
 return <main className="pw-shell">
  <header className="pw-top"><a href="/">DatalytIQs Analytics Lab</a><nav><a href="/evidence-lab">Guided projects</a><a href="/playgrounds">Playgrounds</a><a href="/playgrounds?tab=datasets">Datasets</a></nav></header>
  <section className="pw-hero"><div><span>{p.domain.toUpperCase()} · STRUCTURED DATA PATHWAY</span><h1>{p.title}</h1><p>{p.question}</p><div><b>{p.level}</b><b>{p.duration}</b><b>{done.length}/5 stages complete</b></div></div><label>CHANGE DATASET<select value={key} onChange={e=>chooseDataset(e.target.value)}>{Object.values(pathways).map(x=><option value={x.key} key={x.key}>{x.title}</option>)}</select></label></section>
  <nav className="pw-stages" aria-label="Pathway stages">{stageLabels.map((label,i)=><button className={stage===i?'active':''} onClick={()=>setStage(i)} key={label}><span>{done.includes(i)?'✓':i+1}</span>{label}</button>)}</nav>
  <section className="pw-layout"><aside><small>LEARNING OUTCOMES</small><ul>{p.outcomes.map(x=><li key={x}>{x}</li>)}</ul><div className="pw-source"><b>ACTIVE DATASET</b><code>{p.file}</code><span>Attached as <code>df</code></span>{key!=='case001'&&<em>Illustrative teaching values — not official statistics.</em>}</div></aside>
  <article className="pw-content">
   {stage===0&&<><span className="eyebrow">STAGE 1 · CONCEPT LESSON</span><h2>{p.lesson.title}</h2><p className="lead">Complete this lesson before opening the analytical notebook.</p><div className="pw-concepts">{p.lesson.concepts.map(c=><section key={c.heading}><h3>{c.heading}</h3><p>{c.body}</p></section>)}</div><div className="pw-action"><button onClick={()=>markComplete()}>Complete lesson and continue</button></div></>}
   {stage===1&&<><span className="eyebrow">STAGE 2 · GUIDED NOTEBOOK</span><h2>{p.guided.title}</h2><p className="lead">Run each step in order, inspect the output and record what the evidence permits you to conclude.</p><ol className="pw-steps">{p.guided.steps.map((s,i)=><li key={s.title}><div><b>{i+1}</b></div><section><h3>{s.title}</h3><p>{s.instruction}</p><pre><code>{s.code}</code></pre></section></li>)}</ol><div className="pw-action split"><a href={`/playgrounds?dataset=${key}`}>Open dataset in Python Playground →</a><button onClick={()=>markComplete()}>Mark guided notebook complete</button></div></>}
   {stage===2&&<><span className="eyebrow">STAGE 3 · INDEPENDENT LAB</span><h2>Independent analytical brief</h2><p className="lead">{p.lab.brief}</p><div className="pw-columns"><section><h3>Requirements</h3><ol>{p.lab.requirements.map(x=><li key={x}>{x}</li>)}</ol></section><section><h3>Required evidence</h3><ul>{p.lab.evidence.map(x=><li key={x}>{x}</li>)}</ul></section></div><div className="pw-callout"><b>Independence rule</b><p>Start from a blank cell after loading <code>df</code>. You may consult the lesson, but your variable choices, checks, charts and interpretation must be your own.</p></div><div className="pw-action split"><a href={`/playgrounds?dataset=${key}`}>Begin independent lab →</a><button onClick={()=>markComplete()}>Mark evidence prepared</button></div></>}
   {stage===3&&<><span className="eyebrow">STAGE 4 · MASTERY QUIZ</span><h2>Demonstrate conceptual mastery</h2><p className="lead">Pass mark: 80%. Explanations appear after submission.</p><div className="pw-quiz">{p.quiz.map((q,i)=><fieldset key={q.q}><legend>{i+1}. {q.q}</legend>{q.options.map((o,j)=><label className={submitted?(j===q.answer?'correct':answers[i]===j?'wrong':''):''} key={o}><input type="radio" name={`q-${i}`} checked={answers[i]===j} onChange={()=>setAnswers({...answers,[i]:j})}/>{o}</label>)}{submitted&&<p><b>{answers[i]===q.answer?'Correct.':'Review:'}</b> {q.explanation}</p>}</fieldset>)}</div>{submitted&&<div className={passed?'pw-score pass':'pw-score'}><strong>{score}/{p.quiz.length} · {Math.round(score/p.quiz.length*100)}%</strong><span>{passed?'Mastery achieved. Continue to the portfolio project.':'Review the lesson and reattempt. You need at least 80%.'}</span></div>}<div className="pw-action split"><button onClick={()=>{setSubmitted(true);if(score/p.quiz.length>=.8)markComplete(3)}} disabled={Object.keys(answers).length<p.quiz.length}>Submit quiz</button>{submitted&&!passed&&<button onClick={()=>{setAnswers({});setSubmitted(false)}}>Reattempt</button>}</div></>}
   {stage===4&&<><span className="eyebrow">STAGE 5 · PORTFOLIO PROJECT</span><h2>{p.portfolio.title}</h2><p className="lead">{p.portfolio.scenario}</p><div className="pw-columns"><section><h3>Portfolio deliverables</h3><ol>{p.portfolio.deliverables.map(x=><li key={x}>{x}</li>)}</ol></section><section><h3>Assessment rubric</h3><ul>{p.portfolio.rubric.map(x=><li key={x}>{x}</li>)}</ul></section></div><div className="pw-callout"><b>Completion standard</b><p>Your submission must run from beginning to end, identify the dataset status and limitations, and separate observed evidence from interpretation or recommendation.</p></div><div className="pw-action split"><a href={`/playgrounds?dataset=${key}`}>Build portfolio analysis →</a><button onClick={()=>markComplete(4)}>Record pathway completion</button></div></>}
  </article></section>
  <footer><span>DatalytIQs structured pathways · evidence before conclusions</span><a href="/playgrounds?tab=datasets">Browse all datasets</a></footer>
 </main>
}

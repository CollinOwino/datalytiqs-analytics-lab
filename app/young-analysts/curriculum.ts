export type YoungTrack={
 slug:string; title:string; audience:string; purpose:string;
 modules:{code:string;title:string;outcome:string;project:string}[]
}
export const youngAnalystTracks:YoungTrack[]=[
 {slug:'excel-data-literacy',title:'Excel & Data Literacy',audience:'Builder → Analyst',purpose:'Turn messy everyday data into trustworthy tables, calculations, charts and explanations.',modules:[
  {code:'EDL-01',title:'Data, Rows and Variables',outcome:'Distinguish observations, variables, labels and values.',project:'Build a tidy school-club activity table.'},
  {code:'EDL-02',title:'Clean Data in Excel',outcome:'Detect blanks, inconsistent categories, duplicates and invalid values.',project:'Clean a synthetic club attendance register and document changes.'},
  {code:'EDL-03',title:'Formulas that Answer Questions',outcome:'Use SUM, AVERAGE, COUNT/COUNTA, MIN/MAX and conditional formulas appropriately.',project:'Create a transparent weekly activity summary.'},
  {code:'EDL-04',title:'Sort, Filter and Validate',outcome:'Filter records, apply simple validation and identify exceptions without deleting evidence.',project:'Build a data-quality exception sheet.'},
  {code:'EDL-05',title:'Charts with a Purpose',outcome:'Match chart type to question and avoid misleading scales or decoration.',project:'Produce two decision-ready charts from one dataset.'},
  {code:'EDL-06',title:'Mini Dashboard & Evidence Note',outcome:'Combine indicators, charts, source notes and limitations.',project:'Create a one-page Young Analysts club dashboard.'},
 ]},
 {slug:'statistics',title:'Statistics for Young Analysts',audience:'Builder → Analyst',purpose:'Describe variation, compare groups and reason carefully from samples without overstating evidence.',modules:[
  {code:'STA-01',title:'Questions, Data and Variation',outcome:'Translate a question into measurable variables and recognise natural variation.',project:'Design a small measurement plan.'},
  {code:'STA-02',title:'Centre',outcome:'Calculate and interpret mean, median and mode in context.',project:'Compare summaries for two synthetic study-time groups.'},
  {code:'STA-03',title:'Spread and Outliers',outcome:'Use range and simple distribution reasoning to explain why averages are incomplete.',project:'Diagnose an outlier-sensitive dataset.'},
  {code:'STA-04',title:'Percentages, Rates and Comparisons',outcome:'Choose denominators correctly and compare quantities fairly.',project:'Analyse participation rates across unequal groups.'},
  {code:'STA-05',title:'Samples and Uncertainty',outcome:'Explain why a sample may differ from a population and identify obvious selection bias.',project:'Critique three proposed school survey samples.'},
  {code:'STA-06',title:'Evidence Claims',outcome:'Separate description, association and causal claims.',project:'Write a bounded statistical evidence brief.'},
 ]},
 {slug:'research',title:'Research & Survey Skills',audience:'Analyst',purpose:'Ask answerable questions and collect useful evidence ethically and efficiently.',modules:[
  {code:'RES-01',title:'From Problem to Research Question',outcome:'Define a focused, answerable question and intended decision use.',project:'Turn a broad school issue into a research question.'},
  {code:'RES-02',title:'Variables and Measurement',outcome:'Operationalise concepts using clear variables and response formats.',project:'Create a measurement matrix.'},
  {code:'RES-03',title:'Questionnaire Design',outcome:'Write neutral questions with mutually useful response options.',project:'Repair a flawed five-question survey.'},
  {code:'RES-04',title:'Sampling',outcome:'Distinguish population, sample and sampling frame and identify bias risks.',project:'Create a feasible sampling plan for a synthetic club.'},
  {code:'RES-05',title:'Ethics, Privacy and Data Minimisation',outcome:'Collect only necessary information and recognise consent/privacy risks.',project:'Conduct a data-minimisation review.'},
  {code:'RES-06',title:'Pilot, Analyse and Report',outcome:'Pilot an instrument, log defects and produce a bounded evidence summary.',project:'Run a synthetic pilot and revision log.'},
 ]},
 {slug:'ai-literacy',title:'AI Literacy for Young Analysts',audience:'Builder → Innovator',purpose:'Use generative AI as a fallible tool: frame tasks, verify outputs, protect data and document human judgement.',modules:[
  {code:'AIL-01',title:'What AI Does and Does Not Know',outcome:'Distinguish generated output from verified evidence.',project:'Classify AI claims by verification need.'},
  {code:'AIL-02',title:'Prompting as Problem Specification',outcome:'Provide task, context, constraints and desired output without sensitive data.',project:'Improve three weak prompts and explain why.'},
  {code:'AIL-03',title:'Verification and Sources',outcome:'Cross-check factual outputs against supplied or authoritative evidence.',project:'Audit an intentionally flawed AI answer.'},
  {code:'AIL-04',title:'Bias, Fairness and Representation',outcome:'Identify how examples, data and framing can produce uneven outputs.',project:'Compare outputs from differently framed prompts.'},
  {code:'AIL-05',title:'Privacy, Attribution and Responsible Use',outcome:'Recognise information that should not be entered and disclose meaningful AI assistance.',project:'Create a responsible-use checklist.'},
  {code:'AIL-06',title:'Human-in-the-Loop Project',outcome:'Use AI for a bounded task while preserving verification and human decision ownership.',project:'Produce an AI-assisted evidence product with verification log.'},
 ]},
 {slug:'data-analytics-teens',title:'Data Analytics for Teens',audience:'Analyst → Innovator',purpose:'Complete an end-to-end analytical workflow from question to defensible recommendation.',modules:[
  {code:'DAT-01',title:'Frame the Decision Question',outcome:'Define decision, users, analytical question and success criteria.',project:'Write an analysis charter.'},
  {code:'DAT-02',title:'Inspect and Clean',outcome:'Profile a dataset and create a reproducible cleaning log.',project:'Clean a synthetic school-resource dataset.'},
  {code:'DAT-03',title:'Explore and Visualise',outcome:'Use summaries and charts to find patterns worth investigating.',project:'Create an exploratory analysis notebook or workbook.'},
  {code:'DAT-04',title:'Compare and Interpret',outcome:'Compare groups/rates and distinguish meaningful evidence from noise or artefacts.',project:'Investigate participation differences.'},
  {code:'DAT-05',title:'Explain Limitations',outcome:'Identify missing data, selection, measurement and causal limitations.',project:'Write an analytical limitations register.'},
  {code:'DAT-06',title:'Decision Brief & Presentation',outcome:'Connect question, method, evidence, uncertainty and proportionate action.',project:'Deliver a one-page brief plus five-minute presentation.'},
 ]},
]

const rows=[
 ['Section','Item','Specification','Evidence or assumption','Owner','Quality check','Status'],
 ['Population','Target population','All programme graduates completing training in the defined cohort and counties','Approved participant definition and completion records','MERL lead','Eligibility definition reviewed','Draft'],
 ['Frame','Frame source','Deduplicated graduate register with current eligibility fields','Frame extract date and reconciliation report','Data manager','Coverage and duplicate audit','Draft'],
 ['Design','Selection method','Stratified random sample by county and sex','Subgroup reporting requirement','Statistician','Reproducible random seed and code archived','Draft'],
 ['Size','Completed sample','','Confidence, precision, prevalence and design-effect assumptions','Statistician','Independent recalculation','Draft'],
 ['Response','Issued sample','','Expected response rate and controlled reserve selections','Field lead','Call-attempt and disposition review','Draft'],
 ['Analysis','Weighting plan','Base weights adjusted for response and calibrated where justified','Selection probabilities and response diagnostics','Analyst','Weighted and unweighted results compared','Draft'],
 ['Limitations','Known constraints','','Frame gaps, exclusions, non-response and design limitations','MERL lead','Claims aligned to evidence','Draft'],
]
const escape=(value:string)=>`"${value.replaceAll('"','""')}"`
export async function GET(){const csv='\ufeff'+rows.map(row=>row.map(escape).join(',')).join('\r\n');return new Response(csv,{headers:{'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="MERL_Module_08_Sampling_Plan_Template.csv"','cache-control':'public, max-age=3600'}})}

const rows=[
 ['Record type','Item ID','Variable or procedure','Question/instruction','Response or rule','Source/owner','Quality check','Protection/escalation','Version/status'],
 ['Tool specification','Q01','employment_7d','During the last seven days, did you perform any work for pay or profit?','Yes; No; Prefer not to answer','Graduate / enumerator','Required; permitted values only','Private interview; no employer contact without consent','v0.1 pilot'],
 ['Field protocol','P01','Informed consent','Read approved information and confirm voluntary consent before collection','Stop immediately if consent is refused or withdrawn','Field supervisor','Consent status reviewed daily','Follow withdrawal and record-retention procedure','v0.1 pilot'],
 ['Pilot log','T01','Comprehension test','Record misunderstood terms without coaching the intended answer','Issue; frequency; proposed repair','Tool lead','Review across enumerators and respondent groups','Do not retain identifying examples','Open'],
 ['Release record','R01','Production approval','Document pilot evidence, changes, owner, languages and effective date','Approved; revisions required','MERL lead','Independent specification review','Archive approved source; restrict editing','Pending'],
 ['Tool specification','Q02','','','','','','',''],
 ['Field protocol','P02','','','','','','',''],
 ['Pilot log','T02','','','','','','',''],
]
const escape=(value:string)=>`"${value.replaceAll('"','""')}"`
export async function GET(){const csv='\ufeff'+rows.map(row=>row.map(escape).join(',')).join('\r\n');return new Response(csv,{headers:{'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="MERL_Module_07_Fieldwork_Package_Template.csv"','cache-control':'public, max-age=3600'}})}

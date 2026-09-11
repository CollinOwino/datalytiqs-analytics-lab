const rows=[
 ['Section','Requirement ID','Decision / service','Specification','Owner','Control or service level','Acceptance test','Status'],
 ['Decision','MS01','Monthly implementation review','Identify counties below target and assign action by sixth working day','Programme director','Accepted data available by 10:00','Test dated decision record against accepted dataset','Draft'],
 ['Data flow','MS02','Source-to-repository hand-off','Approved form; encrypted transfer; validation queue; authorised acceptance','Data manager','No unlogged correction','Trace one synthetic record through every state','Draft'],
 ['Access','MS03','Role-based access','County viewers see their aggregate data; analysts receive approved de-identified extracts','System owner','Quarterly access review; immediate revocation','Test permitted and prohibited roles','Draft'],
 ['Reporting','MS04','Decision dashboard','Show numerator, denominator, definition, period, target and refresh time','Analyst','Mobile and keyboard accessible','Complete accessibility and interpretation checks','Draft'],
 ['Continuity','MS05','Backup and recovery','Encrypted backup with tested restore and incident escalation','System owner','Recovery objectives documented','Restore a test dataset and reconcile checksums','Draft'],
 ['Change','MS06','Indicator revision','Approved version, effective date, migration and comparability note','MERL lead','No silent overwrite','Reproduce reports before and after change','Draft'],
 ['Learning','MS07','Decision follow-up','Record action, owner, due date and measured result','Programme director','Open actions reviewed monthly','Trace evidence to decision and outcome','Draft'],
]
const escape=(value:string)=>`"${value.replaceAll('"','""')}"`
export async function GET(){const csv='\ufeff'+rows.map(row=>row.map(escape).join(',')).join('\r\n');return new Response(csv,{headers:{'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="MERL_Module_10_Monitoring_System_Specification.csv"','cache-control':'public, max-age=3600'}})}

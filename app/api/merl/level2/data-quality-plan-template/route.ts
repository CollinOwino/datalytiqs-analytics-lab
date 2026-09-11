const rows=[
 ['Record type','Rule or finding ID','Indicator / field','Quality dimension','Test or finding','Threshold / severity','Evidence source','Owner','Due date','Status'],
 ['Review rule','DQ01','graduate_id','Uniqueness','Count duplicate active identifiers','0 duplicates','Approved participant register','Data manager','','Draft'],
 ['Review rule','DQ02','employment_status','Validity','Permitted values and required skip logic','≥98% valid','Collection specification','Analyst','','Draft'],
 ['Review rule','DQ03','monthly submission','Timeliness','Accepted by fifth working day','≥95% on time','Submission log','County MERL officer','','Draft'],
 ['Query','Q001','','','Describe flagged condition','','Source record / respondent query','','','Open'],
 ['Correction','C001','','Integrity','Original value; corrected value; reason; actor; timestamp','','Authorised evidence','','','Pending approval'],
 ['Action','CAPA01','','','Root cause; corrective action; preventive action','High / medium / low','Review finding','','','Open'],
 ['Certification','CERT01','Review batch','All','Reviewer conclusion and limitations','','Signed review record','Independent reviewer','','Pending'],
]
const escape=(value:string)=>`"${value.replaceAll('"','""')}"`
export async function GET(){const csv='\ufeff'+rows.map(row=>row.map(escape).join(',')).join('\r\n');return new Response(csv,{headers:{'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="MERL_Module_09_Data_Quality_Plan.csv"','cache-control':'public, max-age=3600'}})}

const rows=[
 ['Indicator ID','Indicator statement','Decision/use','Population/unit','Required variables','Reference period','Disaggregation','Potential source','Collection method','Verification rule','Quality/protection risk','Mitigation'],
 ['IND-01','Percentage of graduates in decent employment six months after completion','Review training relevance and employer partnerships','Verified programme graduates','Completion date; follow-up date; employment status; decent-work criteria','Six months after completion','Sex; disability; county','Graduate registry; tracer follow-up','Structured tracer interview with proportionate verification','Apply documented decent-work criteria; report non-response separately','Disclosure in small groups; inaccurate self-report','Suppress small cells; restrict access; verify a defined sample'],
 ['IND-02','','','','','','','','','','',''],
 ['IND-03','','','','','','','','','','',''],
 ['IND-04','','','','','','','','','','',''],
 ['IND-05','','','','','','','','','','',''],
]

const escape=(value:string)=>`"${value.replaceAll('"','""')}"`

export async function GET(){
 const csv='\ufeff'+rows.map(row=>row.map(escape).join(',')).join('\r\n')
 return new Response(csv,{headers:{'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="MERL_Level_2_Data_Requirements_Template.csv"','cache-control':'public, max-age=3600'}})
}

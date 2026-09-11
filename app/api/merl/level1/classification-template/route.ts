export async function GET(){
 const rows=[
  ['Evidence item','Primary function','Rationale','Decision supported','Important limitation'],
  ['','','','',''],
  ['','','','',''],
  ['','','','',''],
  ['','','','',''],
  ['','','','',''],
  ['','','','','']
 ]
 const csv=rows.map(row=>row.map(value=>`"${value.replaceAll('"','""')}"`).join(',')).join('\r\n')
 return new Response(csv,{headers:{'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="MERL_Module_01_Evidence_Classification_Matrix.csv"','cache-control':'public, max-age=3600'}})
}

import {NextResponse} from 'next/server'

const rows=[
 ['Result level','Result statement','Indicator','Baseline','Target and timeframe','Disaggregation','Means of verification','Frequency','Responsible role','Assumption'],
 ['Impact','','','','','','','','',''],
 ['Outcome','','','','','','','','',''],
 ['Output 1','','','','','','','','',''],
 ['Output 2','','','','','','','','',''],
 ['Key activity','','','','','','','','','']
]

function escapeCsv(value:string){
 return `"${value.replaceAll('"','""')}"`
}

export async function GET(){
 const csv=rows.map(row=>row.map(escapeCsv).join(',')).join('\r\n')
 return new NextResponse(csv,{
  headers:{
   'Content-Type':'text/csv; charset=utf-8',
   'Content-Disposition':'attachment; filename="MERL_Module_04_Professional_Logframe_Template.csv"',
   'Cache-Control':'public, max-age=3600'
  }
 })
}

import {NextResponse} from 'next/server'

const rows=[
 ['Indicator name','Linked result','Operational definition','Numerator','Denominator','Unit','Direction','Baseline','Target and timeframe','Disaggregation','Data source','Collection method','Frequency','Responsible role','Data-quality checks','Limitations and ethical safeguards'],
 ['Indicator 1','','','','','','','','','','','','','','',''],
 ['Indicator 2','','','','','','','','','','','','','','',''],
 ['Indicator 3','','','','','','','','','','','','','','',''],
 ['Indicator 4','','','','','','','','','','','','','','',''],
 ['Indicator 5','','','','','','','','','','','','','','','']
]

function escapeCsv(value:string){
 return `"${value.replaceAll('"','""')}"`
}

export async function GET(){
 const csv=rows.map(row=>row.map(escapeCsv).join(',')).join('\r\n')
 return new NextResponse(csv,{
  headers:{
   'Content-Type':'text/csv; charset=utf-8',
   'Content-Disposition':'attachment; filename="MERL_Module_05_Indicator_Reference_Template.csv"',
   'Cache-Control':'public, max-age=3600'
  }
 })
}

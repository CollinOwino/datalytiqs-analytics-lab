import {NextResponse} from 'next/server'

const rows=[
 ['Component','Statement','Evidence or rationale','Indicator','Key assumption','Risk or unintended effect','Owner and review trigger'],
 ['Problem','','','','','',''],
 ['Long-term change','','','','','',''],
 ['Causal pathway 1','','','','','',''],
 ['Causal pathway 2','','','','','',''],
 ['Intervention','','','','','',''],
 ['Narrative (200–300 words)','','','','','','']
]

function escapeCsv(value:string){
 return `"${value.replaceAll('"','""')}"`
}

export async function GET(){
 const csv=rows.map(row=>row.map(escapeCsv).join(',')).join('\r\n')
 return new NextResponse(csv,{
  headers:{
   'Content-Type':'text/csv; charset=utf-8',
   'Content-Disposition':'attachment; filename="MERL_Module_03_Theory_of_Change_Template.csv"',
   'Cache-Control':'public, max-age=3600'
  }
 })
}

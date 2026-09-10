import {NextResponse} from 'next/server'

const rows=[
 ['Result level','Result statement','Indicator','Means of verification','Key assumption','External risk'],
 ['Input','','','','',''],
 ['Activity','','','','',''],
 ['Output','','','','',''],
 ['Outcome','','','','',''],
 ['Impact','','','','','']
]

function escapeCsv(value:string){
 return `"${value.replaceAll('"','""')}"`
}

export async function GET(){
 const csv=rows.map(row=>row.map(escapeCsv).join(',')).join('\r\n')
 return new NextResponse(csv,{
  headers:{
   'Content-Type':'text/csv; charset=utf-8',
   'Content-Disposition':'attachment; filename="MERL_Module_02_Results_Chain_Template.csv"',
   'Cache-Control':'public, max-age=3600'
  }
 })
}

import {readFile} from 'node:fs/promises'
import path from 'node:path'

export async function GET(){
 const file=path.join(process.cwd(),'curricula','merl','level1','data','MERL-DS-001-youth-employment.csv')
 try{
  const body=await readFile(file,'utf8')
  return new Response(body,{status:200,headers:{'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="MERL-DS-001-youth-employment.csv"','cache-control':'public, max-age=3600'}})
 }catch{
  return Response.json({error:'MERL Level 1 dataset is unavailable.'},{status:404})
 }
}

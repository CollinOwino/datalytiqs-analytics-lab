'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

const requiredKeys=['analysis_code','descriptive_evidence','interpretation'] as const

async function ownedProject(projectId:string){
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) redirect('/login')
  const {data:project}=await supabase.from('learner_projects').select('id').eq('id',projectId).eq('user_id',user.id).single()
  if(!project) redirect('/cases/001')
  return {supabase,user}
}

export async function saveStage03(formData:FormData){
  const projectId=String(formData.get('project_id')??'')
  const {supabase}=await ownedProject(projectId)
  const now=new Date().toISOString()
  const rows=requiredKeys.map(key=>({project_id:projectId,stage_number:3,response_key:key,response_value:{value:String(formData.get(key)??'').trim()},updated_at:now}))
  const {error}=await supabase.from('stage_responses').upsert(rows,{onConflict:'project_id,stage_number,response_key'})
  if(error) throw new Error(`Unable to save Stage 03: ${error.message}`)
  redirect(`/python-editor?project=${encodeURIComponent(projectId)}&saved=1`)
}

export async function completeStage03(formData:FormData){
  const projectId=String(formData.get('project_id')??'')
  const {supabase,user}=await ownedProject(projectId)
  const {data:responses,error}=await supabase.from('stage_responses').select('response_key,response_value').eq('project_id',projectId).eq('stage_number',3)
  if(error) throw new Error(`Unable to validate Stage 03: ${error.message}`)
  const completed=new Set((responses??[]).filter(r=>{const v=typeof r.response_value==='string'?r.response_value:r.response_value?.value;return typeof v==='string'&&v.trim().length>0}).map(r=>r.response_key))
  if(!requiredKeys.every(k=>completed.has(k))) redirect(`/python-editor?project=${encodeURIComponent(projectId)}&error=incomplete`)
  const now=new Date().toISOString()
  const {error:e1}=await supabase.from('case_progress').update({status:'completed',completed_at:now,updated_at:now}).eq('project_id',projectId).eq('stage_number',3)
  if(e1) throw new Error(`Unable to complete Stage 03: ${e1.message}`)
  const {error:e2}=await supabase.from('case_progress').update({status:'ready',updated_at:now}).eq('project_id',projectId).eq('stage_number',4).eq('status','locked')
  if(e2) throw new Error(`Stage 03 completed, but Stage 04 could not be unlocked: ${e2.message}`)
  const {error:e3}=await supabase.from('learner_projects').update({current_stage:4,progress_percent:50,status:'in_progress',updated_at:now}).eq('id',projectId).eq('user_id',user.id)
  if(e3) throw new Error(`Unable to update project progress: ${e3.message}`)
  redirect(`/python-editor?project=${encodeURIComponent(projectId)}&saved=completed`)
}

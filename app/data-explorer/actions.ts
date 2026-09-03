'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

const requiredKeys=['dataset_profile','data_quality_note'] as const

async function ownedProject(projectId:string){
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) redirect('/login')
  const {data:project}=await supabase.from('learner_projects').select('id').eq('id',projectId).eq('user_id',user.id).single()
  if(!project) redirect('/cases/001')
  return {supabase,user}
}

export async function saveStage02(formData:FormData){
  const projectId=String(formData.get('project_id')??'')
  const {supabase}=await ownedProject(projectId)
  const datasetProfile=String(formData.get('dataset_profile')??'').trim()
  const qualityNote=String(formData.get('data_quality_note')??'').trim()
  const rows=[
    {project_id:projectId,stage_number:2,response_key:'dataset_profile',response_value:{value:datasetProfile},updated_at:new Date().toISOString()},
    {project_id:projectId,stage_number:2,response_key:'data_quality_note',response_value:{value:qualityNote},updated_at:new Date().toISOString()}
  ]
  const {error}=await supabase.from('stage_responses').upsert(rows,{onConflict:'project_id,stage_number,response_key'})
  if(error) throw new Error(`Unable to save Stage 02: ${error.message}`)
  redirect(`/data-explorer?project=${encodeURIComponent(projectId)}&saved=1`)
}

export async function completeStage02(formData:FormData){
  const projectId=String(formData.get('project_id')??'')
  const {supabase,user}=await ownedProject(projectId)
  const {data:responses,error}=await supabase.from('stage_responses').select('response_key,response_value').eq('project_id',projectId).eq('stage_number',2)
  if(error) throw new Error(`Unable to validate Stage 02: ${error.message}`)
  const completed=new Set((responses??[]).filter(r=>{const v=typeof r.response_value==='string'?r.response_value:r.response_value?.value;return typeof v==='string'&&v.trim().length>0}).map(r=>r.response_key))
  if(!requiredKeys.every(k=>completed.has(k))) redirect(`/data-explorer?project=${encodeURIComponent(projectId)}&error=incomplete`)
  const now=new Date().toISOString()
  const {error:e1}=await supabase.from('case_progress').update({status:'completed',completed_at:now,updated_at:now}).eq('project_id',projectId).eq('stage_number',2)
  if(e1) throw new Error(`Unable to complete Stage 02: ${e1.message}`)
  const {error:e2}=await supabase.from('case_progress').update({status:'ready',updated_at:now}).eq('project_id',projectId).eq('stage_number',3).eq('status','locked')
  if(e2) throw new Error(`Stage 02 completed, but Stage 03 could not be unlocked: ${e2.message}`)
  const {error:e3}=await supabase.from('learner_projects').update({current_stage:3,progress_percent:33,status:'in_progress',updated_at:now}).eq('id',projectId).eq('user_id',user.id)
  if(e3) throw new Error(`Unable to update project progress: ${e3.message}`)
  redirect(`/data-explorer?project=${encodeURIComponent(projectId)}&saved=completed`)
}

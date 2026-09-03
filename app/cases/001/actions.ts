'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'

export async function beginStage01() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: caseStudy, error: caseError } = await supabase
    .from('case_studies').select('id,title').eq('case_code','001').single()
  if (caseError || !caseStudy) throw new Error('Case Study 001 is not available.')

  const { data: existing } = await supabase
    .from('learner_projects').select('id').eq('user_id',user.id).eq('case_id',caseStudy.id).maybeSingle()

  let projectId = existing?.id
  if (!projectId) {
    const { data: project, error } = await supabase.from('learner_projects').insert({
      user_id:user.id, case_id:caseStudy.id, title:'Case Study 001 Analysis',
      status:'in_progress', current_stage:1, progress_percent:0, started_at:new Date().toISOString()
    }).select('id').single()
    if (error || !project) throw new Error(error?.message || 'Unable to create learner project.')
    projectId = project.id
    const rows = Array.from({length:6},(_,i)=>({
      project_id:projectId, stage_number:i+1,
      status:i===0?'in_progress':'locked',
      started_at:i===0?new Date().toISOString():null
    }))
    const { error: stageError } = await supabase.from('case_progress').insert(rows)
    if (stageError) throw new Error(stageError.message)
  } else {
    await supabase.from('learner_projects').update({status:'in_progress',current_stage:1,updated_at:new Date().toISOString()}).eq('id',projectId)
    await supabase.from('case_progress').update({status:'in_progress',started_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('project_id',projectId).eq('stage_number',1).eq('status','ready')
  }
  redirect(`/cases/001/stage-01?project=${projectId}`)
}

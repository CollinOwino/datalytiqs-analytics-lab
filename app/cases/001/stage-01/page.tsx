import { redirect } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/server'

const responseKeys = ['stakeholders', 'management_problem', 'analytical_questions'] as const

export default async function Stage01({searchParams}:{searchParams:Promise<{project?:string,saved?:string,error?:string}>}){
  const {project,saved,error:pageError} = await searchParams
  const supabase = await createClient()
  const {data:{user}} = await supabase.auth.getUser()
  if(!user) redirect('/login')
  if(!project) redirect('/cases/001')

  const {data:p} = await supabase
    .from('learner_projects')
    .select('id,title,status,current_stage,progress_percent')
    .eq('id',project)
    .eq('user_id',user.id)
    .single()
  if(!p) redirect('/cases/001')

  const {data:existing} = await supabase
    .from('stage_responses')
    .select('response_key,response_value')
    .eq('project_id',project)
    .eq('stage_number',1)

  const values = Object.fromEntries((existing ?? []).map(r => [r.response_key, typeof r.response_value === 'string' ? r.response_value : r.response_value?.value ?? ''])) as Record<string,string>

  const {data:stage01Progress} = await supabase
    .from('case_progress')
    .select('status')
    .eq('project_id',project)
    .eq('stage_number',1)
    .maybeSingle()

  const isCompleted = stage01Progress?.status === 'completed'

  async function saveStage01(formData:FormData){
    'use server'
    const serverSupabase = await createClient()
    const {data:{user:currentUser}} = await serverSupabase.auth.getUser()
    if(!currentUser) redirect('/login')

    const projectId = String(formData.get('project_id') ?? '')
    const {data:ownedProject} = await serverSupabase
      .from('learner_projects')
      .select('id')
      .eq('id',projectId)
      .eq('user_id',currentUser.id)
      .single()
    if(!ownedProject) redirect('/cases/001')

    const rows = responseKeys.map(key => ({
      project_id: projectId,
      stage_number: 1,
      response_key: key,
      response_value: {value:String(formData.get(key) ?? '').trim()},
      updated_at: new Date().toISOString()
    }))

    const {error} = await serverSupabase
      .from('stage_responses')
      .upsert(rows,{onConflict:'project_id,stage_number,response_key'})
    if(error) throw new Error(`Unable to save Stage 01: ${error.message}`)

    redirect(`/cases/001/stage-01?project=${encodeURIComponent(projectId)}&saved=1`)
  }

  async function completeStage01(formData:FormData){
    'use server'
    const serverSupabase = await createClient()
    const {data:{user:currentUser}} = await serverSupabase.auth.getUser()
    if(!currentUser) redirect('/login')

    const projectId = String(formData.get('project_id') ?? '')
    const {data:ownedProject} = await serverSupabase
      .from('learner_projects')
      .select('id')
      .eq('id',projectId)
      .eq('user_id',currentUser.id)
      .single()
    if(!ownedProject) redirect('/cases/001')

    const {data:responses,error:responseError} = await serverSupabase
      .from('stage_responses')
      .select('response_key,response_value')
      .eq('project_id',projectId)
      .eq('stage_number',1)
    if(responseError) throw new Error(`Unable to validate Stage 01: ${responseError.message}`)

    const completedKeys = new Set((responses ?? [])
      .filter(r => {
        const value = typeof r.response_value === 'string' ? r.response_value : r.response_value?.value
        return typeof value === 'string' && value.trim().length > 0
      })
      .map(r => r.response_key))

    if(!responseKeys.every(key => completedKeys.has(key))){
      redirect(`/cases/001/stage-01?project=${encodeURIComponent(projectId)}&error=incomplete`)
    }

    const now = new Date().toISOString()
    const {error:completeError} = await serverSupabase
      .from('case_progress')
      .update({status:'completed',completed_at:now,updated_at:now})
      .eq('project_id',projectId)
      .eq('stage_number',1)
    if(completeError) throw new Error(`Unable to complete Stage 01: ${completeError.message}`)

    const {error:unlockError} = await serverSupabase
      .from('case_progress')
      .update({status:'ready',updated_at:now})
      .eq('project_id',projectId)
      .eq('stage_number',2)
      .eq('status','locked')
    if(unlockError) throw new Error(`Stage 01 completed, but Stage 02 could not be unlocked: ${unlockError.message}`)

    const {error:projectError} = await serverSupabase
      .from('learner_projects')
      .update({current_stage:2,progress_percent:17,status:'in_progress',updated_at:now})
      .eq('id',projectId)
      .eq('user_id',currentUser.id)
    if(projectError) throw new Error(`Unable to update project progress: ${projectError.message}`)

    redirect(`/cases/001/stage-01?project=${encodeURIComponent(projectId)}&saved=completed`)
  }

  return <main style={{maxWidth:1000,margin:'48px auto',padding:24}}>
    <a href="/cases/001">← Case Study 001</a>
    <p className="eyebrow" style={{marginTop:32}}>STAGE 01</p>
    <h1>Understand the Management Problem</h1>
    <p>Frame the school leadership problem before touching the data.</p>

    <section style={{marginTop:32}}>
      <h2>Required work</h2>
      <ol>
        <li>Read the student brief and management context.</li>
        <li>Identify the principal decision-makers and stakeholders.</li>
        <li>State the core management problem in your own words.</li>
        <li>Formulate 3–5 analytical questions the evidence should answer.</li>
      </ol>
      <p><b>Project:</b> {p.title}</p>
      <p><b>Status:</b> {isCompleted ? 'Stage 01 completed' : 'In progress'}</p>
    </section>

    <form action={saveStage01} style={{marginTop:40,display:'grid',gap:24}}>
      <input type="hidden" name="project_id" value={p.id}/>

      <label style={{display:'grid',gap:8}}>
        <b>1. Principal decision-makers and stakeholders</b>
        <textarea name="stakeholders" required rows={5} defaultValue={values.stakeholders ?? ''} placeholder="Identify the people or groups who will use, influence or be affected by the analysis."/>
      </label>

      <label style={{display:'grid',gap:8}}>
        <b>2. Core management problem</b>
        <textarea name="management_problem" required rows={6} defaultValue={values.management_problem ?? ''} placeholder="State the management problem clearly in your own words."/>
      </label>

      <label style={{display:'grid',gap:8}}>
        <b>3. Analytical questions</b>
        <textarea name="analytical_questions" required rows={8} defaultValue={values.analytical_questions ?? ''} placeholder="Formulate 3–5 questions that the evidence should answer."/>
      </label>

      {saved === '1' && <p role="status"><b>Stage 01 draft saved.</b> Your responses have been persisted.</p>}
      {pageError === 'incomplete' && <p role="alert"><b>Stage 01 is incomplete.</b> Save a response for all three required fields before completing the stage.</p>}
      <button type="submit">Save Stage 01 Draft</button>
    </form>

    <section style={{marginTop:24}}>
      {isCompleted || saved === 'completed' ? <>
        <p role="status"><b>Stage 01 completed.</b> Stage 02 is now unlocked and your project progress has been updated.</p>
        <a href="/data-explorer">Continue to Stage 02 — Inspect & Prepare Dataset →</a>
      </> : <form action={completeStage01}>
        <input type="hidden" name="project_id" value={p.id}/>
        <button type="submit">Complete Stage 01 →</button>
      </form>}
    </section>
  </main>
}

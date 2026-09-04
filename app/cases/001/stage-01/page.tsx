import { redirect } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/server'
import { saveStage01 } from '../actions'

export default async function Stage01({searchParams}:{searchParams:Promise<{project?:string;saved?:string;error?:string}>}){
  const {project,saved,error} = await searchParams
  const supabase = await createClient()
  const {data:{user}} = await supabase.auth.getUser()
  if(!user) redirect('/login')
  if(!project) redirect('/cases/001')
  const {data:p} = await supabase.from('learner_projects').select('id,title,status').eq('id',project).eq('user_id',user.id).single()
  if(!p) redirect('/cases/001')
  const {data:progress} = await supabase.from('case_progress').select('answers,completed_tasks,status,updated_at').eq('project_id',project).eq('stage_number',1).single()
  const answers = (progress?.answers || {}) as Record<string,string>
  const completed = new Set<string>(progress?.completed_tasks || [])
  return <main style={{maxWidth:1000,margin:'48px auto',padding:24}}>
    <a href="/cases/001">← Case Study 001</a>
    <p className="eyebrow" style={{marginTop:32}}>STAGE 01</p>
    <h1>Understand the Management Problem</h1>
    <p>Frame the school leadership problem before touching the data.</p>
    {saved && <p role="status" style={{padding:14,background:'#E7F5EF',color:'#176B4D'}}>Stage 01 saved successfully. Your work will be restored when you return.</p>}
    {error && <p role="alert" style={{padding:14,background:'#FDECEC',color:'#A73737'}}>{error}</p>}
    <section style={{marginTop:32}}>
      <h2>Required work</h2>
      <ol>
        <li>Read the student brief and management context.</li>
        <li>Identify the principal decision-makers and stakeholders.</li>
        <li>State the core management problem in your own words.</li>
        <li>Formulate 3–5 analytical questions the evidence should answer.</li>
      </ol>
      <p><b>Project:</b> {p.title}</p>
      <p><b>Status:</b> In progress</p>
    </section>
    <form action={saveStage01} style={{display:'grid',gap:24,marginTop:32,padding:28,background:'#fff',border:'1px solid #E4E9F0'}}>
      <input type="hidden" name="project_id" value={project}/>
      <label style={{display:'grid',gap:8}}><b>Principal decision-makers and stakeholders</b><textarea name="stakeholders" required rows={5} defaultValue={answers.stakeholders} placeholder="Identify who will use or be affected by the analysis."/></label>
      <label style={{display:'grid',gap:8}}><b>Core management problem</b><textarea name="problem_statement" required rows={6} defaultValue={answers.problem_statement} placeholder="State the management problem in your own words."/></label>
      <label style={{display:'grid',gap:8}}><b>Analytical questions</b><textarea name="analytical_questions" required rows={8} defaultValue={answers.analytical_questions} placeholder="Write 3–5 questions that the evidence should answer."/></label>
      <fieldset style={{display:'grid',gap:10,border:'1px solid #E4E9F0',padding:18}}><legend><b>Stage checklist</b></legend>
        {[["brief","I have read the student brief and management context."],["stakeholders","I have identified the decision-makers and stakeholders."],["problem","I have stated the core management problem."],["questions","I have formulated 3–5 analytical questions."]].map(([value,label])=><label key={value}><input type="checkbox" name="completed_tasks" value={value} defaultChecked={completed.has(value)}/> {label}</label>)}
      </fieldset>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}><small>{progress?.updated_at ? `Last saved ${new Date(progress.updated_at).toLocaleString('en-KE')}` : 'Not saved yet'}</small><button className="button primary" type="submit">Save Stage 01</button></div>
    </form>
  </main>
}

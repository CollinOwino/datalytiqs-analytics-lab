import { redirect } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/server'

export default async function Stage01({searchParams}:{searchParams:Promise<{project?:string}>}){
  const {project} = await searchParams
  const supabase = await createClient()
  const {data:{user}} = await supabase.auth.getUser()
  if(!user) redirect('/login')
  if(!project) redirect('/cases/001')
  const {data:p} = await supabase.from('learner_projects').select('id,title,status').eq('id',project).eq('user_id',user.id).single()
  if(!p) redirect('/cases/001')
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
      <p><b>Status:</b> In progress</p>
    </section>
  </main>
}

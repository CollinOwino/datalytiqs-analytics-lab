'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import { runFoundationCode } from './runner'

export async function startPythonKidsPilot() {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser()
  if(!user) redirect('/login?next=/python-for-kids')
  const {error}=await supabase.rpc('start_python_kids_pilot')
  if(error) redirect('/python-for-kids?state=action-error')
  revalidatePath('/python-for-kids'); redirect('/python-for-kids?state=started')
}

export async function savePythonKidsAttempt(input:{lessonCode:string;code:string}) {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser()
  if(!user) return {saved:false,reason:'Sign in to save your progress.'}
  const result=runFoundationCode(input.lessonCode,input.code)
  if(result.errorCategory==='lesson'||result.errorCategory==='limit'||result.errorCategory==='safety') return {saved:false,reason:result.feedback}
  const {error}=await supabase.rpc('record_python_kids_attempt',{p_lesson_code:input.lessonCode,p_challenge_code:`lesson-${input.lessonCode}`,p_code:input.code,p_passed:result.ok,p_feedback:result.feedback,p_error_category:result.errorCategory??null})
  if(error) return {saved:false,reason:'Start the free pathway before saving progress.'}
  revalidatePath('/python-for-kids'); revalidatePath(`/python-for-kids/${input.lessonCode}`)
  return {saved:true}
}

export async function submitPythonKidsProject(formData:FormData){
  const title=String(formData.get('title')||'').trim(),code=String(formData.get('code')||''),reflection=String(formData.get('reflection')||'').trim()
  if(title.length<3||code.length<20||reflection.length<20)redirect('/python-for-kids/10.3?state=project-incomplete#project-submission')
  const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login?next=/python-for-kids/10.3')
  const{error}=await supabase.rpc('submit_python_kids_project',{p_module_code:'10',p_title:title,p_code:code,p_reflection:reflection})
  if(error)redirect('/python-for-kids/10.3?state=project-error#project-submission')
  revalidatePath('/python-for-kids');redirect('/python-for-kids/10.3?state=project-submitted#project-submission')
}

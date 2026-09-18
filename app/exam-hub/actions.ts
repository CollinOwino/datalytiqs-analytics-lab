'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

export async function startCa35p() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/exam-hub')

  const { error } = await supabase.rpc('enroll_in_exam_programme', { p_programme_code: 'CA35P' })
  if (error) redirect('/exam-hub?state=action-error')
  revalidatePath('/exam-hub')
  redirect('/exam-hub?state=enrolled')
}

export async function setSubtopicProgress(formData: FormData) {
  const subtopicId=String(formData.get('subtopic_id')||''),topicCode=String(formData.get('topic_code')||''),status=String(formData.get('status')||'')
  if(!subtopicId||!/^[1-5]\.0$/.test(topicCode)||!['in_progress','completed'].includes(status)) redirect('/exam-hub?state=action-error')
  const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser()
  if(!user) redirect(`/login?next=${encodeURIComponent(`/exam-hub/${topicCode}`)}`)
  const{error}=await supabase.rpc('record_exam_subtopic_progress',{p_subtopic_id:subtopicId,p_status:status})
  if(error) redirect(`/exam-hub/${topicCode}?state=action-error`)
  revalidatePath('/exam-hub');revalidatePath(`/exam-hub/${topicCode}`);redirect(`/exam-hub/${topicCode}?state=progress-saved`)
}

export async function setTargetExamDate(formData: FormData) {
  const targetDate=String(formData.get('target_exam_date')||'')
  if(!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) redirect('/exam-hub?state=action-error')
  const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser()
  if(!user) redirect('/login?next=/exam-hub')
  const{error}=await supabase.rpc('set_exam_target_date',{p_programme_code:'CA35P',p_target_exam_date:targetDate})
  if(error) redirect('/exam-hub?state=action-error')
  revalidatePath('/exam-hub');redirect('/exam-hub?state=study-plan-saved')
}

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
  const subtopicId = String(formData.get('subtopic_id') || '')
  const topicCode = String(formData.get('topic_code') || '')
  const status = String(formData.get('status') || '')
  if (!subtopicId || !/^[1-5]\.0$/.test(topicCode) || !['in_progress', 'completed'].includes(status)) {
    redirect('/exam-hub?state=action-error')
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(`/exam-hub/${topicCode}`)}`)
  const { error } = await supabase.rpc('record_exam_subtopic_progress', { p_subtopic_id: subtopicId, p_status: status })
  if (error) redirect(`/exam-hub/${topicCode}?state=action-error`)
  revalidatePath('/exam-hub')
  revalidatePath(`/exam-hub/${topicCode}`)
  redirect(`/exam-hub/${topicCode}?state=progress-saved`)
}

export async function submitTopicOneQuiz(formData: FormData) {
  const answers = Object.fromEntries(
    ['q1', 'q2', 'q3', 'q4', 'q5'].map((code) => [code, String(formData.get(code) || '')]),
  )
  if (Object.values(answers).some((answer) => !['a', 'b', 'c', 'd'].includes(answer))) {
    redirect('/exam-hub/1.0?state=quiz-incomplete#topic-quiz')
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=%2Fexam-hub%2F1.0')
  const { error } = await supabase.rpc('submit_ca35p_topic1_quiz', { p_answers: answers })
  if (error) redirect('/exam-hub/1.0?state=action-error#topic-quiz')
  revalidatePath('/exam-hub/1.0')
  redirect('/exam-hub/1.0?state=quiz-submitted#topic-quiz')
}

export async function submitTopicOnePractical(formData: FormData) {
  const summary = String(formData.get('summary') || '').trim()
  const evidenceLink = String(formData.get('evidence_link') || '').trim()
  if (summary.length < 80 || summary.length > 3000 || (evidenceLink && !/^https:\/\/\S+$/.test(evidenceLink))) {
    redirect('/exam-hub/1.0?state=practical-invalid#practical-submission')
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=%2Fexam-hub%2F1.0')
  const { error } = await supabase.rpc('submit_ca35p_topic1_practical', {
    p_summary: summary,
    p_evidence_link: evidenceLink || null,
  })
  if (error) redirect('/exam-hub/1.0?state=action-error#practical-submission')
  revalidatePath('/exam-hub/1.0')
  redirect('/exam-hub/1.0?state=practical-submitted#practical-submission')
}

export async function submitTopicQuiz(formData: FormData) {
  const topicCode = String(formData.get('topic_code') || '')
  if (!/^[1-5]\.0$/.test(topicCode)) redirect('/exam-hub?state=action-error')
  const answers = Object.fromEntries(
    ['q1', 'q2', 'q3', 'q4', 'q5'].map((code) => [code, String(formData.get(code) || '')]),
  )
  if (Object.values(answers).some((answer) => !['a', 'b', 'c', 'd'].includes(answer))) {
    redirect(`/exam-hub/${topicCode}?state=quiz-incomplete#topic-quiz`)
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(`/exam-hub/${topicCode}`)}`)
  const { error } = await supabase.rpc('submit_ca35p_topic_quiz', { p_topic_code: topicCode, p_answers: answers })
  if (error) redirect(`/exam-hub/${topicCode}?state=action-error#topic-quiz`)
  revalidatePath('/exam-hub')
  revalidatePath(`/exam-hub/${topicCode}`)
  redirect(`/exam-hub/${topicCode}?state=quiz-submitted#topic-quiz`)
}

export async function submitTopicPractical(formData: FormData) {
  const topicCode = String(formData.get('topic_code') || '')
  const summary = String(formData.get('summary') || '').trim()
  const evidenceLink = String(formData.get('evidence_link') || '').trim()
  if (!/^[1-5]\.0$/.test(topicCode) || summary.length < 80 || summary.length > 3000 || (evidenceLink && !/^https:\/\/\S+$/.test(evidenceLink))) {
    redirect(`/exam-hub/${topicCode || '1.0'}?state=practical-invalid#practical-submission`)
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(`/exam-hub/${topicCode}`)}`)
  const { error } = await supabase.rpc('submit_ca35p_topic_practical', {
    p_topic_code: topicCode,
    p_summary: summary,
    p_evidence_link: evidenceLink || null,
  })
  if (error) redirect(`/exam-hub/${topicCode}?state=action-error#practical-submission`)
  revalidatePath(`/exam-hub/${topicCode}`)
  redirect(`/exam-hub/${topicCode}?state=practical-submitted#practical-submission`)
}

export async function setTargetExamDate(formData: FormData) {
  const targetDate=String(formData.get('target_exam_date')||'')
  if(!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) redirect('/exam-hub?state=action-error')
  const target=new Date(targetDate+'T00:00:00Z');const tomorrow=new Date();tomorrow.setUTCHours(0,0,0,0);tomorrow.setUTCDate(tomorrow.getUTCDate()+1)
  if(Number.isNaN(target.getTime())||target<tomorrow) redirect('/exam-hub?state=action-error')
  const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser()
  if(!user) redirect('/login?next=/exam-hub')
  const{error}=await supabase.rpc('set_exam_target_date',{p_programme_code:'CA35P',p_target_exam_date:targetDate})
  if(error) redirect('/exam-hub?state=action-error')
  revalidatePath('/exam-hub');redirect('/exam-hub?state=study-plan-saved')
}

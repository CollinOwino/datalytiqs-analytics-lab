'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

export async function startCa35p() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/exam-hub')

  const { error } = await supabase.rpc('enroll_in_exam_programme', { p_programme_code: 'CA35P' })
  if (error) redirect(`/exam-hub?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/exam-hub')
  redirect('/exam-hub?started=1')
}

export async function setTopicProgress(formData: FormData) {
  const topicId = String(formData.get('topic_id') || '')
  const enrollmentId = String(formData.get('enrollment_id') || '')
  const status = String(formData.get('status') || '')
  if (!topicId || !enrollmentId || !['in_progress', 'completed'].includes(status)) {
    redirect('/exam-hub?error=Invalid%20progress%20request')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/exam-hub')

  const now = new Date().toISOString()
  const { error } = await supabase.from('exam_topic_progress').upsert({
    topic_id: topicId,
    enrollment_id: enrollmentId,
    user_id: user.id,
    status,
    started_at: now,
    completed_at: status === 'completed' ? now : null,
    updated_at: now,
  }, { onConflict: 'enrollment_id,topic_id' })

  if (error) redirect(`/exam-hub?error=${encodeURIComponent(error.message)}`)
  revalidatePath('/exam-hub')
  redirect('/exam-hub?updated=1')
}

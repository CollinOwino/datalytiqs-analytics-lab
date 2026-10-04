import { NextResponse } from 'next/server'
import { createClient } from '../../../../../../lib/supabase/server'
import { createAdminClient } from '../../../../../../lib/supabase/admin'

export async function POST(request:Request,{params}:{params:Promise<{assessmentId:string}>}){
  const {assessmentId}=await params
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) return NextResponse.json({error:'Authentication required'},{status:401})
  const admin=createAdminClient()
  const {data:assessment}=await admin.from('exam_assessments').select('id,programme_id,time_limit_minutes,max_attempts,status').eq('id',assessmentId).eq('assessment_type','mock').eq('status','published').maybeSingle()
  if(!assessment) return NextResponse.json({error:'Mock not available'},{status:404})
  const {data:enrollment}=await supabase.from('exam_enrollments').select('id').eq('programme_id',assessment.programme_id).eq('user_id',user.id).eq('status','active').maybeSingle()
  if(!enrollment) return NextResponse.json({error:'Active enrolment required'},{status:403})
  const {data:existing}=await supabase.from('exam_mock_attempts').select('id,started_at,expires_at,status').eq('assessment_id',assessment.id).eq('enrollment_id',enrollment.id).eq('status','in_progress').maybeSingle()
  if(existing) return NextResponse.json(existing)
  const {count}=await admin.from('exam_mock_attempts').select('id',{count:'exact',head:true}).eq('assessment_id',assessment.id).eq('enrollment_id',enrollment.id)
  if(assessment.max_attempts&&Number(count||0)>=assessment.max_attempts) return NextResponse.json({error:'Maximum attempts reached'},{status:409})
  const started=new Date(); const expires=new Date(started.getTime()+assessment.time_limit_minutes*60000)
  const {data:attempt,error}=await supabase.from('exam_mock_attempts').insert({assessment_id:assessment.id,enrollment_id:enrollment.id,user_id:user.id,started_at:started.toISOString(),expires_at:expires.toISOString()}).select('id,started_at,expires_at,status').single()
  if(error) return NextResponse.json({error:'Unable to start mock'},{status:400})
  return NextResponse.json(attempt,{status:201})
}

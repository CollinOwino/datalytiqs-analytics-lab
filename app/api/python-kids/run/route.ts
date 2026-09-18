import { NextResponse } from 'next/server'
import { runFoundationCode } from '../../../python-for-kids/runner'
import { getLesson } from '../../../python-for-kids/content'
import { createClient } from '../../../../lib/supabase/server'

export async function POST(request: Request) {
  let body: { lessonCode?: string; code?: string }
  try { body=await request.json() } catch { return NextResponse.json({error:'Invalid request.'},{status:400}) }
  if (typeof body.lessonCode!=='string' || typeof body.code!=='string') return NextResponse.json({error:'Lesson and code are required.'},{status:400})
  const lesson=getLesson(body.lessonCode)
  if(!lesson) return NextResponse.json({error:'Lesson not found.'},{status:404})
  if(lesson.module>3){
    const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser()
    if(!user) return NextResponse.json({error:'Full programme access required.'},{status:401})
    const programme=await supabase.from('learning_programmes').select('id').eq('code','PY-KIDS').single()
    const grant=programme.data?await supabase.from('learning_access_grants').select('id').eq('user_id',user.id).eq('programme_id',programme.data.id).is('revoked_at',null).lte('starts_at',new Date().toISOString()).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).limit(1).maybeSingle():{data:null}
    if(!grant.data) return NextResponse.json({error:'Full programme access required.'},{status:403})
  }
  return NextResponse.json(runFoundationCode(body.lessonCode,body.code),{headers:{'Cache-Control':'no-store'}})
}

import { NextResponse } from 'next/server'
import { createClient } from '../../../../../../lib/supabase/server'
import { createAdminClient } from '../../../../../../lib/supabase/admin'

export async function POST(request:Request,{params}:{params:Promise<{attemptId:string}>}){
  const {attemptId}=await params
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser()
  if(!user) return NextResponse.json({error:'Authentication required'},{status:401})
  const body=await request.json().catch(()=>({})); const answers=(body?.answers&&typeof body.answers==='object')?body.answers:{}
  const admin=createAdminClient()
  const {data:attempt}=await admin.from('exam_mock_attempts').select('id,assessment_id,enrollment_id,user_id,expires_at,status').eq('id',attemptId).eq('user_id',user.id).maybeSingle()
  if(!attempt||attempt.status!=='in_progress') return NextResponse.json({error:'Live attempt not found'},{status:404})
  const timedOut=Date.now()>new Date(attempt.expires_at).getTime()
  const {data:mapped}=await admin.from('exam_assessment_questions').select('question_id,points,exam_questions!inner(id,topic_id)').eq('assessment_id',attempt.assessment_id).order('sequence_no')
  const qids=(mapped||[]).map((m:any)=>m.question_id)
  const {data:keys}=qids.length?await admin.schema('private').from('exam_question_keys').select('question_id,answer_key').in('question_id',qids):{data:[]}
  const keyMap=new Map((keys||[]).map((k:any)=>[k.question_id,k.answer_key]))
  let earned=0,total=0; const topicRaw=new Map<string,{earned:number,total:number}>()
  for(const m of mapped||[]){const pts=Number(m.points||1); total+=pts; const key:any=keyMap.get(m.question_id); const expected=Array.isArray(key?.correct)?key.correct.map(String).sort():[]; const given=Array.isArray(answers[m.question_id])?answers[m.question_id].map(String).sort():[String(answers[m.question_id]??'')]; const ok=expected.length===given.length&&expected.every((x:string,i:number)=>x===given[i]); if(ok) earned+=pts; const topic=(Array.isArray(m.exam_questions)?m.exam_questions[0]:m.exam_questions)?.topic_id; if(topic){const row=topicRaw.get(topic)||{earned:0,total:0}; row.total+=pts;if(ok)row.earned+=pts;topicRaw.set(topic,row)}}
  const pct=total?Math.round(earned/total*100):0
  const {data:assessment}=await admin.from('exam_assessments').select('pass_mark').eq('id',attempt.assessment_id).single()
  const passed=pct>=Number(assessment?.pass_mark||70)
  const domainScores=Object.fromEntries([...topicRaw.entries()].map(([k,v])=>[k,Math.round(v.earned/v.total*100)]))
  await admin.from('exam_mock_attempts').update({answers,score:earned,percentage:pct,passed,domain_scores:domainScores,status:'submitted',submitted_at:new Date().toISOString()}).eq('id',attempt.id)
  const {data:topicCompetencies}=await admin.from('exam_topic_competencies').select('topic_id,competency_id').in('topic_id',[...topicRaw.keys()])
  for(const tc of topicCompetencies||[]){const score=domainScores[tc.topic_id]; if(score===undefined)continue; await admin.from('exam_competency_evidence').insert({enrollment_id:attempt.enrollment_id,user_id:user.id,competency_id:tc.competency_id,source_type:'mock',source_id:attempt.id,score})}
  await admin.from('exam_recommendations').delete().eq('enrollment_id',attempt.enrollment_id).eq('user_id',user.id).eq('status','open')
  for(const [topicId,score] of Object.entries(domainScores)){if(Number(score)>=70)continue; const tc=(topicCompetencies||[]).find((x:any)=>x.topic_id===topicId); await admin.from('exam_recommendations').insert({enrollment_id:attempt.enrollment_id,user_id:user.id,topic_id:topicId,competency_id:tc?.competency_id||null,reason:`Mock domain score ${score}% is below the 70% DatalytIQs readiness threshold. Revisit theory, repeat the topic quiz and complete/review the mapped practical assignment before the next mock.`,priority:Number(score)<50?1:2,status:'open'})}
  return NextResponse.json({attempt_id:attempt.id,score:earned,max_score:total,percentage:pct,passed,domain_scores:domainScores,timed_out:timedOut})
}

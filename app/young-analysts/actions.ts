'use server'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {createClient} from '../../lib/supabase/server'
import {youngAnalystQuestionBank} from './question-bank'
import {youngAnalystAnswerKey} from './question-key.server'

const validTracks=new Set(['excel-data-literacy','statistics','research','ai-literacy','data-analytics-teens'])
const validStatuses=new Set(['learning','evidence_submitted','revision_needed','competent'])

async function auth(){
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser()
 if(!user) redirect('/login?next=/young-analysts/learn')
 return {supabase,user}
}

export async function getYoungAnalystState(track:string){
 if(!validTracks.has(track)) throw new Error('Invalid Young Analysts track.')
 const {supabase}=await auth()
 const {data,error}=await supabase.from('young_analyst_competency_state').select('*').eq('track_slug',track).order('module_code')
 if(error) throw new Error(error.message)
 return data??[]
}

export async function recordYoungLesson(input:{track:string;moduleCode:string;lessonCode:string}){
 if(!validTracks.has(input.track)) throw new Error('Invalid track.')
 const {supabase,user}=await auth()
 const {error}=await supabase.from('young_analyst_lesson_progress').upsert({user_id:user.id,track_slug:input.track,module_code:input.moduleCode,lesson_code:input.lessonCode,status:'completed',completed_at:new Date().toISOString()},{onConflict:'user_id,lesson_code'})
 if(error) throw new Error(error.message)
 await supabase.from('young_analyst_competency_state').upsert({user_id:user.id,track_slug:input.track,module_code:input.moduleCode,status:'learning',updated_at:new Date().toISOString()},{onConflict:'user_id,track_slug,module_code',ignoreDuplicates:true})
 revalidatePath('/young-analysts/learn'); revalidatePath('/young-analysts/learn/'+input.track)
 return {ok:true}
}

export async function gradeYoungQuiz(track:string,moduleCode:string,answers:Record<string,number>){
 if(!validTracks.has(track)) return {ok:false as const,error:'Invalid track.'}
 const items=youngAnalystQuestionBank.filter(q=>q.track===track&&q.module===moduleCode)
 if(!items.length) return {ok:false as const,error:'No scored items are configured for this module yet.'}
 if(items.some(q=>answers[q.id]===undefined)) return {ok:false as const,error:'Answer every question before submitting.'}
 const correct=items.filter(q=>answers[q.id]===youngAnalystAnswerKey[q.id]?.answer).length
 const score=Math.round(correct/items.length*100),passed=score>=70
 const {supabase,user}=await auth()
 const {data:prior}=await supabase.from('young_analyst_quiz_attempts').select('attempt_no').eq('user_id',user.id).eq('module_code',moduleCode).order('attempt_no',{ascending:false}).limit(1)
 const attempt=(prior?.[0]?.attempt_no??0)+1
 const {error}=await supabase.from('young_analyst_quiz_attempts').insert({user_id:user.id,track_slug:track,module_code:moduleCode,attempt_no:attempt,score,passed,answers})
 if(error) return {ok:false as const,error:error.message}
 revalidatePath('/young-analysts/learn/'+track)
 return {ok:true as const,score,passed,attempts:attempt,feedback:items.map(q=>({id:q.id,correct:answers[q.id]===youngAnalystAnswerKey[q.id]?.answer,rationale:youngAnalystAnswerKey[q.id]?.rationale||''}))}
}

export async function submitYoungEvidence(input:{track:string;moduleCode:string;title:string;evidence:string;reflection:string;datasetId?:string}){
 if(!validTracks.has(input.track)) throw new Error('Invalid track.')
 if(input.title.trim().length<3||input.evidence.trim().length<40||input.reflection.trim().length<30) throw new Error('Provide a title, substantive evidence and reflection.')
 const {supabase,user}=await auth()
 const {data,error}=await supabase.from('young_analyst_evidence').insert({user_id:user.id,track_slug:input.track,module_code:input.moduleCode,title:input.title.trim(),evidence_text:input.evidence.trim(),reflection:input.reflection.trim(),dataset_id:input.datasetId||null,status:'submitted'}).select('id').single()
 if(error) throw new Error(error.message)
 await supabase.from('young_analyst_competency_state').upsert({user_id:user.id,track_slug:input.track,module_code:input.moduleCode,status:'evidence_submitted',latest_evidence_id:data.id,updated_at:new Date().toISOString()},{onConflict:'user_id,track_slug,module_code'})
 revalidatePath('/young-analysts/learn/'+input.track)
 return {ok:true,id:data.id}
}

export async function reviewYoungEvidence(input:{evidenceId:string,method:number,testing:number,reasoning:number,responsible:number,feedback:string}){
 const scores=[input.method,input.testing,input.reasoning,input.responsible]
 if(scores.some(x=>!Number.isInteger(x)||x<0||x>3)) throw new Error('Rubric scores must be whole numbers from 0 to 3.')
 const {supabase,user}=await auth()
 const {data:evidence,error:readError}=await supabase.from('young_analyst_evidence').select('id,user_id,track_slug,module_code').eq('id',input.evidenceId).single()
 if(readError||!evidence) throw new Error('Evidence not found.')
 const total=scores.reduce((a,b)=>a+b,0),competent=total>=8&&input.responsible>0
 const {error}=await supabase.from('young_analyst_reviews').insert({evidence_id:input.evidenceId,reviewer_id:user.id,method_score:input.method,testing_score:input.testing,reasoning_score:input.reasoning,responsible_score:input.responsible,total_score:total,decision:competent?'competent':'revision_needed',feedback:input.feedback.trim()})
 if(error) throw new Error(error.message)
 await supabase.from('young_analyst_evidence').update({status:competent?'competent':'revision_needed'}).eq('id',input.evidenceId)
 await supabase.from('young_analyst_competency_state').upsert({user_id:evidence.user_id,track_slug:evidence.track_slug,module_code:evidence.module_code,status:competent?'competent':'revision_needed',rubric_score:total,updated_at:new Date().toISOString()},{onConflict:'user_id,track_slug,module_code'})
 revalidatePath('/young-analysts/instructor'); revalidatePath('/young-analysts/learn/'+evidence.track_slug)
 return {ok:true,total,decision:competent?'competent':'revision_needed'}
}

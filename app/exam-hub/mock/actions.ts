'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'

type MockResponse = Record<string,string>
const codePattern = /^(M(?:0[1-9]|1[0-9]|20)|P[123]|S-(?:FIN|GOV))$/
function clean(input:MockResponse){
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length>25)throw new Error('Invalid response set.')
  const result:MockResponse={}
  for(const [code,value] of Object.entries(input)){
    if(!codePattern.test(code)||typeof value!=='string'||value.length>5000)throw new Error('Invalid answer or response length.')
    result[code]=value
  }
  return result
}
async function authenticated(){const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('Sign in to continue.');return supabase}

export async function startFullMock(){
  let id:string|null=null
  try{const supabase=await authenticated();const{data,error}=await supabase.rpc('start_ca35p_mock');if(error)throw error;id=data as string}catch{redirect('/exam-hub/mock?state=start-error')}
  revalidatePath('/exam-hub/mock');redirect(`/exam-hub/mock?attempt=${encodeURIComponent(id!)}`)
}

export async function saveMockResponses(attemptId:string,answers:MockResponse):Promise<{ok:boolean;message:string}>{
  if(!/^[0-9a-f-]{36}$/i.test(attemptId))return{ok:false,message:'Invalid attempt.'}
  try{const supabase=await authenticated();const{error}=await supabase.rpc('save_ca35p_mock',{p_attempt_id:attemptId,p_responses:clean(answers)});if(error)throw error;return{ok:true,message:'Draft saved to your account.'}}catch(error){return{ok:false,message:error instanceof Error?error.message:'Could not save your draft.'}}
}

export async function submitFullMock(attemptId:string,answers:MockResponse):Promise<{ok:boolean;message:string}>{
  if(!/^[0-9a-f-]{36}$/i.test(attemptId))return{ok:false,message:'Invalid attempt.'}
  try{
    const supabase=await authenticated()
    const{data:attempt,error:loadError}=await supabase.from('exam_assessment_attempts').select('started_at').eq('id',attemptId).eq('status','in_progress').maybeSingle()
    if(loadError||!attempt)throw new Error('Attempt not found or already submitted.')
    if(Date.now()<new Date(attempt.started_at).getTime()+180*60000){const{error:saveError}=await supabase.rpc('save_ca35p_mock',{p_attempt_id:attemptId,p_responses:clean(answers)});if(saveError)throw saveError}
    const{error}=await supabase.rpc('submit_ca35p_mock',{p_attempt_id:attemptId});if(error)throw error
  }catch(error){return{ok:false,message:error instanceof Error?error.message:'Submission could not be completed.'}}
  revalidatePath('/exam-hub/mock');revalidatePath('/exam-hub/mock/review');redirect('/exam-hub/mock?state=submitted')
}

export async function reviewFullMock(formData:FormData){
  const attemptId=String(formData.get('attempt_id')||'')
  const scores=Object.fromEntries(['P1','P2','P3',String(formData.get('special_code')||'')].map(code=>[code,String(formData.get('score_'+code)||'')]))
  const feedback=String(formData.get('feedback')||'').trim()
  if(!/^[0-9a-f-]{36}$/i.test(attemptId)||Object.keys(scores).length!==4||Object.values(scores).some(value=>!/^(0|[1-9]|1[0-9]|20)$/.test(value))||feedback.length<30||feedback.length>3000)redirect('/exam-hub/mock/review?state=invalid')
  const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login?next=/exam-hub/mock/review')
  const{error}=await supabase.rpc('review_ca35p_mock',{p_attempt_id:attemptId,p_scores:scores,p_feedback:feedback})
  if(error)redirect('/exam-hub/mock/review?state=error')
  revalidatePath('/exam-hub/mock/review');revalidatePath('/exam-hub/mock');redirect('/exam-hub/mock/review?state=saved')
}

'use server'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {createClient} from '../../../lib/supabase/server'

async function authenticated(){
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) redirect('/login?next=%2Fdata-science%2Ffoundations')
  return {supabase,user}
}

export async function getDataScienceModuleOneState(){
  const {supabase}=await authenticated()
  const {data,error}=await supabase.rpc('get_data_science_module1_state')
  if(error) throw new Error(`Unable to load Module 01 progress: ${error.message}`)
  return Array.isArray(data)?data[0]??null:data
}

export async function markDataScienceLesson(lessonIndex:number){
  if(!Number.isInteger(lessonIndex)||lessonIndex<0||lessonIndex>2) throw new Error('Invalid lesson record.')
  const {supabase}=await authenticated()
  const {error}=await supabase.rpc('mark_data_science_module1_lesson',{p_lesson_index:lessonIndex})
  if(error) throw new Error(error.message)
  revalidatePath('/data-science/foundations')
  return {ok:true}
}

export async function submitDataScienceEvidence(content:string){
  const clean=content.trim()
  if(clean.length<100||clean.length>20000) throw new Error('Professional evidence must contain 100 to 20,000 characters.')
  const {supabase}=await authenticated()
  const {data,error}=await supabase.rpc('submit_data_science_module1_evidence',{
    p_evidence_type:'Data Science Problem-Framing Brief',p_content:clean
  })
  if(error) throw new Error(error.message)
  revalidatePath('/data-science/foundations')
  return {ok:true,id:data}
}

export async function getDataScienceQuiz(){
  const {supabase}=await authenticated()
  const {data,error}=await supabase.rpc('get_data_science_module1_quiz')
  if(error) throw new Error(error.message)
  return data??[]
}

export async function gradeDataScienceQuiz(answers:Record<string,string>){
  const {supabase}=await authenticated()
  try{
    const {data,error}=await supabase.rpc('grade_data_science_module1_quiz',{p_answers:answers})
    if(error) return {ok:false as const,error:error.message}
    const result=Array.isArray(data)?data[0]:data
    if(!result) return {ok:false as const,error:'Quiz grading returned no result; no attempt was recorded.'}
    const {data:persisted,error:verifyError}=await supabase.rpc('get_data_science_module1_state')
    if(verifyError) return {ok:false as const,error:`The quiz was graded, but persistence could not be verified: ${verifyError.message}`}
    const state=Array.isArray(persisted)?persisted[0]:persisted
    if(!state||Number(state.quiz_attempts)<Number(result.attempts)||state.quiz_score===null){
      return {ok:false as const,error:'The quiz transaction did not persist its score and attempt count.'}
    }
    revalidatePath('/data-science/foundations')
    return {ok:true as const,score:Number(result.score),passed:Boolean(result.passed),attempts:Number(result.attempts),module02Unlocked:Boolean(result.module_02_unlocked)}
  }catch(error){
    return {ok:false as const,error:error instanceof Error?error.message:'Quiz grading failed.'}
  }
}

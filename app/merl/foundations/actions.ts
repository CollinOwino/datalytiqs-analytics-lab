'use server'

import {redirect} from 'next/navigation'
import {revalidatePath} from 'next/cache'
import {createClient} from '../../../lib/supabase/server'

const validModules=new Set(['01','02','03','04','05'])

async function authenticated(){
 const supabase=await createClient()
 const {data:{user}}=await supabase.auth.getUser()
 if(!user) redirect('/login?next=%2Fmerl%2Ffoundations')
 return {supabase,user}
}

export async function getMerlLevel1State(){
 const {supabase}=await authenticated()
 const {data,error}=await supabase.rpc('get_merl_level1_progress')
 if(error) throw new Error(`Unable to load MERL progress: ${error.message}`)
 return data??[]
}

export async function markLessonEvidence(moduleId:string,lessonIndex:number){
 if(!validModules.has(moduleId)||lessonIndex<0||lessonIndex>2) throw new Error('Invalid lesson evidence request.')
 const {supabase}=await authenticated()
 const {error}=await supabase.rpc('mark_merl_level1_lesson',{p_module_id:moduleId,p_lesson_index:lessonIndex})
 if(error) throw new Error(error.message)
 revalidatePath('/merl/foundations')
 return {ok:true}
}

export async function submitProfessionalEvidence(moduleId:string,evidenceType:string,content:string){
 if(!validModules.has(moduleId)) throw new Error('Invalid module.')
 if(content.trim().length<20) throw new Error('Professional evidence must contain at least 20 characters.')
 const {supabase}=await authenticated()
 const {data,error}=await supabase.rpc('submit_merl_level1_evidence',{p_module_id:moduleId,p_evidence_type:evidenceType,p_content:content.trim()})
 if(error) throw new Error(error.message)
 revalidatePath('/merl/foundations')
 return {ok:true,id:data}
}

export async function getModuleQuiz(moduleId:string){
 if(!validModules.has(moduleId)) throw new Error('Invalid module.')
 const {supabase}=await authenticated()
 const {data,error}=await supabase.rpc('get_merl_level1_quiz',{p_module_id:moduleId})
 if(error) throw new Error(error.message)
 return data??[]
}

export async function gradeModuleQuiz(moduleId:string,answers:Record<string,string>){
 if(!validModules.has(moduleId)) return {ok:false as const,error:'Invalid module.'}
 const {supabase}=await authenticated()
 try{
  const {data,error}=await supabase.rpc('grade_merl_level1_quiz',{p_module_id:moduleId,p_answers:answers})
  if(error) return {ok:false as const,error:error.message}
  const result=Array.isArray(data)?data[0]:data
  if(!result) return {ok:false as const,error:'Quiz grading returned no result; the attempt was not recorded.'}

  const {data:rows,error:progressError}=await supabase.rpc('get_merl_level1_progress')
  if(progressError) return {ok:false as const,error:`Quiz was graded but persistence could not be verified: ${progressError.message}`}
  const persisted=rows?.find((row:{module_id:string})=>row.module_id===moduleId)
  const attempts=Number(result.attempts)
  const score=Number(result.score)
  if(!persisted||Number(persisted.quiz_attempts)<attempts||persisted.quiz_score===null){
   return {ok:false as const,error:'Quiz grading did not persist the score and attempt count.'}
  }

  revalidatePath('/merl/foundations')
  return {ok:true as const,score,passed:Boolean(result.passed),attempts}
 }catch(error){
  return {ok:false as const,error:error instanceof Error?error.message:'Quiz grading failed.'}
 }
}

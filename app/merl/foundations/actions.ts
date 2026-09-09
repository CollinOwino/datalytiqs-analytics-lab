'use server'

import {redirect} from 'next/navigation'
import {revalidatePath} from 'next/cache'
import {createClient} from '../../../lib/supabase/server'

const validModules=new Set(['01','02','03','04','05'])

async function authenticated(){
 const supabase=await createClient()
 const {data:{user}}=await supabase.auth.getUser()
 if(!user) redirect('/login')
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
 if(!validModules.has(moduleId)) throw new Error('Invalid module.')
 const {supabase}=await authenticated()
 const {data,error}=await supabase.rpc('grade_merl_level1_quiz',{p_module_id:moduleId,p_answers:answers})
 if(error) throw new Error(error.message)
 revalidatePath('/merl/foundations')
 return data?.[0]??null
}

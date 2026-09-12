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

function row(data:unknown){return Array.isArray(data)?data[0]??null:data}

export async function getDataScienceModuleOneState(){
  const {supabase}=await authenticated()
  const {data,error}=await supabase.rpc('get_data_science_module1_state')
  if(error) throw new Error(`Unable to load Module 01 progress: ${error.message}`)
  return row(data)
}

export async function getDataScienceModuleTwoState(){
  const {supabase}=await authenticated()
  const {data,error}=await supabase.rpc('get_data_science_module2_state')
  if(error) throw new Error(`Unable to load Module 02 progress: ${error.message}`)
  return row(data)
}

export async function markDataScienceModuleTwoLesson(lessonIndex:number){
  if(!Number.isInteger(lessonIndex)||lessonIndex<0||lessonIndex>2) throw new Error('Invalid lesson record.')
  const {supabase}=await authenticated()
  const {error}=await supabase.rpc('mark_data_science_module2_lesson',{p_lesson_index:lessonIndex})
  if(error) throw new Error(error.message)
  revalidatePath('/data-science/foundations/02')
  return {ok:true}
}

export async function submitDataScienceModuleTwoEvidence(content:string){
  const clean=content.trim()
  if(clean.length<100||clean.length>20000) throw new Error('Professional evidence must contain 100 to 20,000 characters.')
  const {supabase}=await authenticated()
  const {data,error}=await supabase.rpc('submit_data_science_module2_evidence',{p_evidence_type:'Data Structure and Quality Assessment',p_content:clean})
  if(error) throw new Error(error.message)
  revalidatePath('/data-science/foundations/02')
  return {ok:true,id:data}
}

export async function getDataScienceModuleTwoQuiz(){
  const {supabase}=await authenticated()
  const {data,error}=await supabase.rpc('get_data_science_module2_quiz')
  if(error) throw new Error(error.message)
  return data??[]
}

export async function gradeDataScienceModuleTwoQuiz(answers:Record<string,string>){
  const {supabase}=await authenticated()
  try{
    const {data,error}=await supabase.rpc('grade_data_science_module2_quiz',{p_answers:answers})
    if(error) return {ok:false as const,error:error.message}
    const result=row(data) as {score:number;passed:boolean;attempts:number;module_03_unlocked:boolean}|null
    if(!result) return {ok:false as const,error:'Quiz grading returned no result; no attempt was recorded.'}
    const {data:persisted,error:verifyError}=await supabase.rpc('get_data_science_module2_state')
    if(verifyError) return {ok:false as const,error:`The quiz was graded, but persistence could not be verified: ${verifyError.message}`}
    const state=row(persisted) as {quiz_attempts:number;quiz_score:number|null}|null
    if(!state||Number(state.quiz_attempts)<Number(result.attempts)||state.quiz_score===null) return {ok:false as const,error:'The quiz transaction did not persist its score and attempt count.'}
    revalidatePath('/data-science/foundations/02')
    return {ok:true as const,score:Number(result.score),passed:Boolean(result.passed),attempts:Number(result.attempts),module03Unlocked:Boolean(result.module_03_unlocked)}
  }catch(error){return {ok:false as const,error:error instanceof Error?error.message:'Quiz grading failed.'}}
}

export async function getDataScienceModuleThreeState(){
  const {supabase}=await authenticated()
  const {data,error}=await supabase.rpc('get_data_science_module3_state')
  if(error) throw new Error(`Unable to load Module 03 progress: ${error.message}`)
  return row(data)
}

export async function markDataScienceModuleThreeLesson(lessonIndex:number){
  if(!Number.isInteger(lessonIndex)||lessonIndex<0||lessonIndex>2) throw new Error('Invalid lesson record.')
  const {supabase}=await authenticated()
  const {error}=await supabase.rpc('mark_data_science_module3_lesson',{p_lesson_index:lessonIndex})
  if(error) throw new Error(error.message)
  revalidatePath('/data-science/foundations/03')
  return {ok:true}
}

export async function submitDataScienceModuleThreeEvidence(content:string){
  const clean=content.trim()
  if(clean.length<100||clean.length>20000) throw new Error('Professional evidence must contain 100 to 20,000 characters.')
  const {supabase}=await authenticated()
  const {data,error}=await supabase.rpc('submit_data_science_module3_evidence',{p_evidence_type:'Data Acquisition and Governance Plan',p_content:clean})
  if(error) throw new Error(error.message)
  revalidatePath('/data-science/foundations/03')
  return {ok:true,id:data}
}

export async function getDataScienceModuleThreeQuiz(){
  const {supabase}=await authenticated()
  const {data,error}=await supabase.rpc('get_data_science_module3_quiz')
  if(error) throw new Error(error.message)
  return data??[]
}

export async function gradeDataScienceModuleThreeQuiz(answers:Record<string,string>){
  const {supabase}=await authenticated()
  try{
    const {data,error}=await supabase.rpc('grade_data_science_module3_quiz',{p_answers:answers})
    if(error) return {ok:false as const,error:error.message}
    const result=row(data) as {score:number;passed:boolean;attempts:number;module_04_unlocked:boolean}|null
    if(!result) return {ok:false as const,error:'Quiz grading returned no result; no attempt was recorded.'}
    const {data:persisted,error:verifyError}=await supabase.rpc('get_data_science_module3_state')
    if(verifyError) return {ok:false as const,error:`The quiz was graded, but persistence could not be verified: ${verifyError.message}`}
    const state=row(persisted) as {quiz_attempts:number;quiz_score:number|null}|null
    if(!state||Number(state.quiz_attempts)<Number(result.attempts)||state.quiz_score===null) return {ok:false as const,error:'The quiz transaction did not persist its score and attempt count.'}
    revalidatePath('/data-science/foundations/03')
    return {ok:true as const,score:Number(result.score),passed:Boolean(result.passed),attempts:Number(result.attempts),module04Unlocked:Boolean(result.module_04_unlocked)}
  }catch(error){return {ok:false as const,error:error instanceof Error?error.message:'Quiz grading failed.'}}
}

export async function getDataScienceModuleFourState(){
  const {supabase}=await authenticated();const {data,error}=await supabase.rpc('get_data_science_module4_state')
  if(error) throw new Error(`Unable to load Module 04 progress: ${error.message}`);return row(data)
}
export async function markDataScienceModuleFourLesson(lessonIndex:number){
  if(!Number.isInteger(lessonIndex)||lessonIndex<0||lessonIndex>2) throw new Error('Invalid lesson record.')
  const {supabase}=await authenticated();const {error}=await supabase.rpc('mark_data_science_module4_lesson',{p_lesson_index:lessonIndex})
  if(error) throw new Error(error.message);revalidatePath('/data-science/foundations/04');return {ok:true}
}
export async function submitDataScienceModuleFourEvidence(content:string){
  const clean=content.trim();if(clean.length<100||clean.length>20000) throw new Error('Professional evidence must contain 100 to 20,000 characters.')
  const {supabase}=await authenticated();const {data,error}=await supabase.rpc('submit_data_science_module4_evidence',{p_evidence_type:'Exploratory Data Analysis Report',p_content:clean})
  if(error) throw new Error(error.message);revalidatePath('/data-science/foundations/04');return {ok:true,id:data}
}
export async function getDataScienceModuleFourQuiz(){
  const {supabase}=await authenticated();const {data,error}=await supabase.rpc('get_data_science_module4_quiz');if(error) throw new Error(error.message);return data??[]
}
export async function gradeDataScienceModuleFourQuiz(answers:Record<string,string>){
  const {supabase}=await authenticated()
  try{const {data,error}=await supabase.rpc('grade_data_science_module4_quiz',{p_answers:answers});if(error)return {ok:false as const,error:error.message}
    const result=row(data) as {score:number;passed:boolean;attempts:number;module_05_unlocked:boolean}|null;if(!result)return {ok:false as const,error:'Quiz grading returned no result; no attempt was recorded.'}
    const {data:persisted,error:verifyError}=await supabase.rpc('get_data_science_module4_state');if(verifyError)return {ok:false as const,error:`The quiz was graded, but persistence could not be verified: ${verifyError.message}`}
    const state=row(persisted) as {quiz_attempts:number;quiz_score:number|null}|null;if(!state||Number(state.quiz_attempts)<Number(result.attempts)||state.quiz_score===null)return {ok:false as const,error:'The quiz transaction did not persist its score and attempt count.'}
    revalidatePath('/data-science/foundations/04');return {ok:true as const,score:Number(result.score),passed:Boolean(result.passed),attempts:Number(result.attempts),module05Unlocked:Boolean(result.module_05_unlocked)}
  }catch(error){return {ok:false as const,error:error instanceof Error?error.message:'Quiz grading failed.'}}
}

export async function getDataScienceModuleFiveState(){const{supabase}=await authenticated();const{data,error}=await supabase.rpc('get_data_science_module5_state');if(error)throw new Error(`Unable to load Module 05 progress: ${error.message}`);return row(data)}
export async function markDataScienceModuleFiveLesson(lessonIndex:number){if(!Number.isInteger(lessonIndex)||lessonIndex<0||lessonIndex>2)throw new Error('Invalid lesson record.');const{supabase}=await authenticated();const{error}=await supabase.rpc('mark_data_science_module5_lesson',{p_lesson_index:lessonIndex});if(error)throw new Error(error.message);revalidatePath('/data-science/foundations/05');return{ok:true}}
export async function submitDataScienceModuleFiveEvidence(content:string){const clean=content.trim();if(clean.length<100||clean.length>20000)throw new Error('Professional evidence must contain 100 to 20,000 characters.');const{supabase}=await authenticated();const{data,error}=await supabase.rpc('submit_data_science_module5_evidence',{p_evidence_type:'Statistical Inference Plan and Results Brief',p_content:clean});if(error)throw new Error(error.message);revalidatePath('/data-science/foundations/05');return{ok:true,id:data}}
export async function getDataScienceModuleFiveQuiz(){const{supabase}=await authenticated();const{data,error}=await supabase.rpc('get_data_science_module5_quiz');if(error)throw new Error(error.message);return data??[]}
export async function gradeDataScienceModuleFiveQuiz(answers:Record<string,string>){const{supabase}=await authenticated();try{const{data,error}=await supabase.rpc('grade_data_science_module5_quiz',{p_answers:answers});if(error)return{ok:false as const,error:error.message};const result=row(data)as{score:number;passed:boolean;attempts:number;module_06_unlocked:boolean}|null;if(!result)return{ok:false as const,error:'Quiz grading returned no result; no attempt was recorded.'};const{data:persisted,error:verifyError}=await supabase.rpc('get_data_science_module5_state');if(verifyError)return{ok:false as const,error:`The quiz was graded, but persistence could not be verified: ${verifyError.message}`};const state=row(persisted)as{quiz_attempts:number;quiz_score:number|null}|null;if(!state||Number(state.quiz_attempts)<Number(result.attempts)||state.quiz_score===null)return{ok:false as const,error:'The quiz transaction did not persist its score and attempt count.'};revalidatePath('/data-science/foundations/05');return{ok:true as const,score:Number(result.score),passed:Boolean(result.passed),attempts:Number(result.attempts),module06Unlocked:Boolean(result.module_06_unlocked)}}catch(error){return{ok:false as const,error:error instanceof Error?error.message:'Quiz grading failed.'}}}

export async function getDataScienceModuleSixState(){const{supabase}=await authenticated();const{data,error}=await supabase.rpc('get_data_science_module6_state');if(error)throw new Error(`Unable to load Module 06 progress: ${error.message}`);return row(data)}
export async function markDataScienceModuleSixLesson(lessonIndex:number){if(!Number.isInteger(lessonIndex)||lessonIndex<0||lessonIndex>2)throw new Error('Invalid lesson record.');const{supabase}=await authenticated();const{error}=await supabase.rpc('mark_data_science_module6_lesson',{p_lesson_index:lessonIndex});if(error)throw new Error(error.message);revalidatePath('/data-science/foundations/06');return{ok:true}}
export async function submitDataScienceModuleSixEvidence(content:string){const clean=content.trim();if(clean.length<100||clean.length>20000)throw new Error('Professional evidence must contain 100 to 20,000 characters.');const{supabase}=await authenticated();const{data,error}=await supabase.rpc('submit_data_science_module6_evidence',{p_evidence_type:'Python Reproducibility Package and Audit Record',p_content:clean});if(error)throw new Error(error.message);revalidatePath('/data-science/foundations/06');return{ok:true,id:data}}
export async function getDataScienceModuleSixQuiz(){const{supabase}=await authenticated();const{data,error}=await supabase.rpc('get_data_science_module6_quiz');if(error)throw new Error(error.message);return data??[]}
export async function gradeDataScienceModuleSixQuiz(answers:Record<string,string>){const{supabase}=await authenticated();try{const{data,error}=await supabase.rpc('grade_data_science_module6_quiz',{p_answers:answers});if(error)return{ok:false as const,error:error.message};const result=row(data)as{score:number;passed:boolean;attempts:number;module_07_unlocked:boolean}|null;if(!result)return{ok:false as const,error:'Quiz grading returned no result; no attempt was recorded.'};const{data:persisted,error:verifyError}=await supabase.rpc('get_data_science_module6_state');if(verifyError)return{ok:false as const,error:`The quiz was graded, but persistence could not be verified: ${verifyError.message}`};const state=row(persisted)as{quiz_attempts:number;quiz_score:number|null}|null;if(!state||Number(state.quiz_attempts)<Number(result.attempts)||state.quiz_score===null)return{ok:false as const,error:'The quiz transaction did not persist its score and attempt count.'};revalidatePath('/data-science/foundations/06');return{ok:true as const,score:Number(result.score),passed:Boolean(result.passed),attempts:Number(result.attempts),module07Unlocked:Boolean(result.module_07_unlocked)}}catch(error){return{ok:false as const,error:error instanceof Error?error.message:'Quiz grading failed.'}}}

export async function getDataScienceModuleSevenState(){const{supabase}=await authenticated();const{data,error}=await supabase.rpc('get_data_science_module7_state');if(error)throw new Error(`Unable to load Module 07 progress: ${error.message}`);return row(data)}
export async function markDataScienceModuleSevenLesson(lessonIndex:number){if(!Number.isInteger(lessonIndex)||lessonIndex<0||lessonIndex>2)throw new Error('Invalid lesson record.');const{supabase}=await authenticated();const{error}=await supabase.rpc('mark_data_science_module7_lesson',{p_lesson_index:lessonIndex});if(error)throw new Error(error.message);revalidatePath('/data-science/foundations/07');return{ok:true}}
export async function submitDataScienceModuleSevenEvidence(content:string){const clean=content.trim();if(clean.length<100||clean.length>20000)throw new Error('Professional evidence must contain 100 to 20,000 characters.');const{supabase}=await authenticated();const{data,error}=await supabase.rpc('submit_data_science_module7_evidence',{p_evidence_type:'Decision Visualisation Portfolio and Communication Brief',p_content:clean});if(error)throw new Error(error.message);revalidatePath('/data-science/foundations/07');return{ok:true,id:data}}
export async function getDataScienceModuleSevenQuiz(){const{supabase}=await authenticated();const{data,error}=await supabase.rpc('get_data_science_module7_quiz');if(error)throw new Error(error.message);return data??[]}
export async function gradeDataScienceModuleSevenQuiz(answers:Record<string,string>){const{supabase}=await authenticated();try{const{data,error}=await supabase.rpc('grade_data_science_module7_quiz',{p_answers:answers});if(error)return{ok:false as const,error:error.message};const result=row(data)as{score:number;passed:boolean;attempts:number;module_08_unlocked:boolean}|null;if(!result)return{ok:false as const,error:'Quiz grading returned no result; no attempt was recorded.'};const{data:persisted,error:verifyError}=await supabase.rpc('get_data_science_module7_state');if(verifyError)return{ok:false as const,error:`The quiz was graded, but persistence could not be verified: ${verifyError.message}`};const state=row(persisted)as{quiz_attempts:number;quiz_score:number|null}|null;if(!state||Number(state.quiz_attempts)<Number(result.attempts)||state.quiz_score===null)return{ok:false as const,error:'The quiz transaction did not persist its score and attempt count.'};revalidatePath('/data-science/foundations/07');return{ok:true as const,score:Number(result.score),passed:Boolean(result.passed),attempts:Number(result.attempts),module08Unlocked:Boolean(result.module_08_unlocked)}}catch(error){return{ok:false as const,error:error instanceof Error?error.message:'Quiz grading failed.'}}}

export async function getDataScienceModuleEightState(){const{supabase}=await authenticated();const{data,error}=await supabase.rpc('get_data_science_module8_state');if(error)throw new Error(`Unable to load Module 08 progress: ${error.message}`);return row(data)}
export async function markDataScienceModuleEightLesson(lessonIndex:number){if(!Number.isInteger(lessonIndex)||lessonIndex<0||lessonIndex>2)throw new Error('Invalid lesson record.');const{supabase}=await authenticated();const{error}=await supabase.rpc('mark_data_science_module8_lesson',{p_lesson_index:lessonIndex});if(error)throw new Error(error.message);revalidatePath('/data-science/foundations/08');return{ok:true}}
export async function submitDataScienceModuleEightEvidence(content:string){const clean=content.trim();if(clean.length<100||clean.length>20000)throw new Error('Professional evidence must contain 100 to 20,000 characters.');const{supabase}=await authenticated();const{data,error}=await supabase.rpc('submit_data_science_module8_evidence',{p_evidence_type:'Regression and Predictive Model Validation Report',p_content:clean});if(error)throw new Error(error.message);revalidatePath('/data-science/foundations/08');return{ok:true,id:data}}
export async function getDataScienceModuleEightQuiz(){const{supabase}=await authenticated();const{data,error}=await supabase.rpc('get_data_science_module8_quiz');if(error)throw new Error(error.message);return data??[]}
export async function gradeDataScienceModuleEightQuiz(answers:Record<string,string>){const{supabase}=await authenticated();try{const{data,error}=await supabase.rpc('grade_data_science_module8_quiz',{p_answers:answers});if(error)return{ok:false as const,error:error.message};const result=row(data)as{score:number;passed:boolean;attempts:number;module_09_unlocked:boolean}|null;if(!result)return{ok:false as const,error:'Quiz grading returned no result; no attempt was recorded.'};const{data:persisted,error:verifyError}=await supabase.rpc('get_data_science_module8_state');if(verifyError)return{ok:false as const,error:`The quiz was graded, but persistence could not be verified: ${verifyError.message}`};const state=row(persisted)as{quiz_attempts:number;quiz_score:number|null}|null;if(!state||Number(state.quiz_attempts)<Number(result.attempts)||state.quiz_score===null)return{ok:false as const,error:'The quiz transaction did not persist its score and attempt count.'};revalidatePath('/data-science/foundations/08');return{ok:true as const,score:Number(result.score),passed:Boolean(result.passed),attempts:Number(result.attempts),module09Unlocked:Boolean(result.module_09_unlocked)}}catch(error){return{ok:false as const,error:error instanceof Error?error.message:'Quiz grading failed.'}}}

export async function getDataScienceModuleNineState(){const{supabase}=await authenticated();const{data,error}=await supabase.rpc('get_data_science_module9_state');if(error)throw new Error(`Unable to load Module 09 progress: ${error.message}`);return row(data)}
export async function markDataScienceModuleNineLesson(lessonIndex:number){if(!Number.isInteger(lessonIndex)||lessonIndex<0||lessonIndex>2)throw new Error('Invalid lesson record.');const{supabase}=await authenticated();const{error}=await supabase.rpc('mark_data_science_module9_lesson',{p_lesson_index:lessonIndex});if(error)throw new Error(error.message);revalidatePath('/data-science/foundations/09');return{ok:true}}
export async function submitDataScienceModuleNineEvidence(content:string){const clean=content.trim();if(clean.length<100||clean.length>20000)throw new Error('Professional evidence must contain 100 to 20,000 characters.');const{supabase}=await authenticated();const{data,error}=await supabase.rpc('submit_data_science_module9_evidence',{p_evidence_type:'ML System Release and Operations Plan',p_content:clean});if(error)throw new Error(error.message);revalidatePath('/data-science/foundations/09');return{ok:true,id:data}}
export async function getDataScienceModuleNineQuiz(){const{supabase}=await authenticated();const{data,error}=await supabase.rpc('get_data_science_module9_quiz');if(error)throw new Error(error.message);return data??[]}
export async function gradeDataScienceModuleNineQuiz(answers:Record<string,string>){const{supabase}=await authenticated();try{const{data,error}=await supabase.rpc('grade_data_science_module9_quiz',{p_answers:answers});if(error)return{ok:false as const,error:error.message};const result=row(data)as{score:number;passed:boolean;attempts:number;module_10_unlocked:boolean}|null;if(!result)return{ok:false as const,error:'Quiz grading returned no result; no attempt was recorded.'};const{data:persisted,error:verifyError}=await supabase.rpc('get_data_science_module9_state');if(verifyError)return{ok:false as const,error:`The quiz was graded, but persistence could not be verified: ${verifyError.message}`};const state=row(persisted)as{quiz_attempts:number;quiz_score:number|null}|null;if(!state||Number(state.quiz_attempts)<Number(result.attempts)||state.quiz_score===null)return{ok:false as const,error:'The quiz transaction did not persist its score and attempt count.'};revalidatePath('/data-science/foundations/09');return{ok:true as const,score:Number(result.score),passed:Boolean(result.passed),attempts:Number(result.attempts),module10Unlocked:Boolean(result.module_10_unlocked)}}catch(error){return{ok:false as const,error:error instanceof Error?error.message:'Quiz grading failed.'}}}

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

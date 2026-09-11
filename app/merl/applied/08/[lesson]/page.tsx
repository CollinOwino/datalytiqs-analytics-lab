import {notFound,redirect} from 'next/navigation'
import {createClient} from '../../../../../lib/supabase/server'
import LessonExperience from './lesson-experience'

export default async function ModuleEightLesson({params}:{params:Promise<{lesson:string}>}){
 const {lesson}=await params
 if(!['1','2','3'].includes(lesson)) notFound()
 const supabase=await createClient()
 const {data:{user}}=await supabase.auth.getUser()
 if(!user) redirect(`/login?next=${encodeURIComponent(`/merl/applied/08/${lesson}`)}`)
 const {data,error}=await supabase.rpc('get_merl_level1_progress')
 const foundationsComplete=!error&&['01','02','03','04','05'].every(moduleId=>data?.some((row:{module_id:string;module_completed_at:string|null})=>row.module_id===moduleId&&row.module_completed_at))
 if(!foundationsComplete) redirect('/merl/applied')
 return <LessonExperience lesson={lesson as '1'|'2'|'3'}/>
}

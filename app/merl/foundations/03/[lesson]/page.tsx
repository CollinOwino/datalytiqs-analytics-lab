import {notFound,redirect} from 'next/navigation'
import {createClient} from '../../../../../lib/supabase/server'
import LessonExperience from './lesson-experience'

export default async function ModuleThreeLesson({params}:{params:Promise<{lesson:string}>}){
 const {lesson}=await params
 if(!['1','2','3'].includes(lesson)) notFound()
 const supabase=await createClient()
 const {data:{user}}=await supabase.auth.getUser()
 if(!user) redirect(`/login?next=${encodeURIComponent(`/merl/foundations/03/${lesson}`)}`)
 return <LessonExperience lesson={lesson as '1'|'2'|'3'}/>
}

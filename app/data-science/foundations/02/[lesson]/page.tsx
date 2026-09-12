import {notFound,redirect} from 'next/navigation'
import {createClient} from '../../../../../lib/supabase/server'
import ModuleTwoLesson from './lesson-experience'

export default async function Page({params}:{params:Promise<{lesson:string}>}){
 const {lesson}=await params;if(!['1','2','3'].includes(lesson))notFound()
 const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser()
 if(!user)redirect(`/login?next=${encodeURIComponent(`/data-science/foundations/02/${lesson}`)}`)
 const {data,error}=await supabase.rpc('get_data_science_module2_state')
 if(error||!(Array.isArray(data)?data[0]:data)?.module_01_completed)redirect('/data-science/foundations')
 return <ModuleTwoLesson lesson={lesson as '1'|'2'|'3'}/>
}

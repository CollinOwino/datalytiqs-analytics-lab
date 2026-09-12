import {notFound,redirect} from 'next/navigation'
import {createClient} from '../../../../../lib/supabase/server'
import ModuleTenLesson from './lesson-experience'
export default async function Page({params}:{params:Promise<{lesson:string}>}){const{lesson}=await params;if(!['1','2','3'].includes(lesson))notFound();const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect(`/login?next=${encodeURIComponent(`/data-science/foundations/10/${lesson}`)}`);const{data,error}=await supabase.rpc('get_data_science_module10_state');const state=Array.isArray(data)?data[0]:data;if(error||!state?.module_09_completed)redirect('/data-science/foundations/09');return <ModuleTenLesson lesson={lesson as '1'|'2'|'3'}/>}

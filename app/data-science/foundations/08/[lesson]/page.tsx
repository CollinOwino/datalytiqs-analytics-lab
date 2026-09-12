import {notFound,redirect} from 'next/navigation'
import {createClient} from '../../../../../lib/supabase/server'
import ModuleEightLesson from './lesson-experience'
export default async function Page({params}:{params:Promise<{lesson:string}>}){const{lesson}=await params;if(!['1','2','3'].includes(lesson))notFound();const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect(`/login?next=${encodeURIComponent(`/data-science/foundations/08/${lesson}`)}`);const{data,error}=await supabase.rpc('get_data_science_module8_state');const state=Array.isArray(data)?data[0]:data;if(error||!state?.module_07_completed)redirect('/data-science/foundations/07');return <ModuleEightLesson lesson={lesson as '1'|'2'|'3'}/>}

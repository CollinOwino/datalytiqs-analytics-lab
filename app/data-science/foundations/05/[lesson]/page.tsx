import {notFound,redirect} from 'next/navigation'
import {createClient} from '../../../../../lib/supabase/server'
import ModuleFiveLesson from './lesson-experience'
export default async function Page({params}:{params:Promise<{lesson:string}>}){const{lesson}=await params;if(!['1','2','3'].includes(lesson))notFound();const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect(`/login?next=${encodeURIComponent(`/data-science/foundations/05/${lesson}`)}`);const{data,error}=await supabase.rpc('get_data_science_module5_state');const state=Array.isArray(data)?data[0]:data;if(error||!state?.module_04_completed)redirect('/data-science/foundations/04');return <ModuleFiveLesson lesson={lesson as '1'|'2'|'3'}/>}

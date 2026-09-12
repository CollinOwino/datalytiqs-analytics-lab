import {redirect} from 'next/navigation'
import {createClient} from '../../../../lib/supabase/server'
import ModuleTenExperience from './module-ten-experience'
import '../05/module-five.css'
export const metadata={title:'Module 10: Data Science Capstone and Professional Portfolio',description:'Integrate, defend and hand over an auditable data-science project.'}
export default async function Page(){const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login?next=%2Fdata-science%2Ffoundations%2F10');const{data,error}=await supabase.rpc('get_data_science_module10_state');const state=Array.isArray(data)?data[0]:data;if(error||!state?.module_09_completed)redirect('/data-science/foundations/09');return <ModuleTenExperience/>}

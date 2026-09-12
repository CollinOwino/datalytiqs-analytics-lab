import {redirect} from 'next/navigation'
import {createClient} from '../../../../lib/supabase/server'
import ModuleNineExperience from './module-nine-experience'
import '../05/module-five.css'
export const metadata={title:'Module 09: Machine Learning Systems and Model Operations',description:'Release, monitor and govern machine-learning systems safely.'}
export default async function Page(){const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login?next=%2Fdata-science%2Ffoundations%2F09');const{data,error}=await supabase.rpc('get_data_science_module9_state');const state=Array.isArray(data)?data[0]:data;if(error||!state?.module_08_completed)redirect('/data-science/foundations/08');return <ModuleNineExperience/>}

import {redirect} from 'next/navigation'
import {createClient} from '../../../../lib/supabase/server'
import ModuleSevenExperience from './module-seven-experience'
import '../05/module-five.css'
export const metadata={title:'Module 07: Data Visualisation and Analytical Communication',description:'Design truthful, accessible visual evidence for clear decisions.'}
export default async function Page(){const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login?next=%2Fdata-science%2Ffoundations%2F07');const{data,error}=await supabase.rpc('get_data_science_module7_state');const state=Array.isArray(data)?data[0]:data;if(error||!state?.module_06_completed)redirect('/data-science/foundations/06');return <ModuleSevenExperience/>}

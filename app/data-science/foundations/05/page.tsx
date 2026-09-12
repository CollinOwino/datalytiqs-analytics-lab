import {redirect} from 'next/navigation'
import {createClient} from '../../../../lib/supabase/server'
import ModuleFiveExperience from './module-five-experience'
import './module-five.css'
export const metadata={title:'Module 05: Statistical Reasoning and Inference',description:'Estimate effects, quantify uncertainty and interpret statistical evidence responsibly.'}
export default async function Page(){const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login?next=%2Fdata-science%2Ffoundations%2F05');const{data,error}=await supabase.rpc('get_data_science_module5_state');const state=Array.isArray(data)?data[0]:data;if(error||!state?.module_04_completed)redirect('/data-science/foundations/04');return <ModuleFiveExperience/>}

import {redirect} from 'next/navigation'
import {createClient} from '../../../../lib/supabase/server'
import ModuleSixExperience from './module-six-experience'
import '../05/module-five.css'

export const metadata={title:'Module 06: Reproducible Analysis with Python',description:'Build auditable Python workflows that another analyst can rerun, test and verify.'}
export default async function Page(){const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login?next=%2Fdata-science%2Ffoundations%2F06');const{data,error}=await supabase.rpc('get_data_science_module6_state');const state=Array.isArray(data)?data[0]:data;if(error||!state?.module_05_completed)redirect('/data-science/foundations/05');return <ModuleSixExperience/>}

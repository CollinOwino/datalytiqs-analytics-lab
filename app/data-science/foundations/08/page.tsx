import {redirect} from 'next/navigation'
import {createClient} from '../../../../lib/supabase/server'
import ModuleEightExperience from './module-eight-experience'
import '../05/module-five.css'
export const metadata={title:'Module 08: Regression and Predictive Modelling',description:'Build, validate and communicate regression and predictive models responsibly.'}
export default async function Page(){const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login?next=%2Fdata-science%2Ffoundations%2F08');const{data,error}=await supabase.rpc('get_data_science_module8_state');const state=Array.isArray(data)?data[0]:data;if(error||!state?.module_07_completed)redirect('/data-science/foundations/07');return <ModuleEightExperience/>}

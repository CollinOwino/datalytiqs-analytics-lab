import {redirect} from 'next/navigation'
import {createClient} from '../../../../lib/supabase/server'
import ModuleFourExperience from './module-four-experience'
import './module-four.css'

export const metadata={title:'Module 04: Exploratory Data Analysis',description:'Explore distributions, relationships, missingness and anomalies before formal modelling.'}
export default async function Page(){const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login?next=%2Fdata-science%2Ffoundations%2F04');const{data,error}=await supabase.rpc('get_data_science_module4_state');const state=Array.isArray(data)?data[0]:data;if(error||!state?.module_03_completed)redirect('/data-science/foundations/03');return <ModuleFourExperience/>}

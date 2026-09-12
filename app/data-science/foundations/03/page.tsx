import {redirect} from 'next/navigation'
import {createClient} from '../../../../lib/supabase/server'
import ModuleThreeExperience from './module-three-experience'
import './module-three.css'

export const metadata={title:'Module 03: Data Collection, Sources and Governance',description:'Design lawful, proportionate and reproducible data-acquisition systems.'}

export default async function DataScienceModuleThree(){
 const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser()
 if(!user)redirect('/login?next=%2Fdata-science%2Ffoundations%2F03')
 const {data,error}=await supabase.rpc('get_data_science_module3_state');const state=Array.isArray(data)?data[0]:data
 if(error||!state?.module_02_completed)redirect('/data-science/foundations/02')
 return <ModuleThreeExperience/>
}

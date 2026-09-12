import {redirect} from 'next/navigation'
import {createClient} from '../../../../lib/supabase/server'
import ModuleTwoExperience from './module-two-experience'

export const metadata={title:'Module 02: Data Types, Structures and Quality',description:'Classify data, design analysis-ready structures and assess data quality.'}

export default async function DataScienceModuleTwo(){
 const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser()
 if(!user)redirect('/login?next=%2Fdata-science%2Ffoundations%2F02')
 const {data,error}=await supabase.rpc('get_data_science_module2_state')
 if(error||!(Array.isArray(data)?data[0]:data)?.module_01_completed)redirect('/data-science/foundations')
 return <ModuleTwoExperience/>
}

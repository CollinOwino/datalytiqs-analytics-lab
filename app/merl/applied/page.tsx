import {redirect} from 'next/navigation'
import {createClient} from '../../../lib/supabase/server'
import AppliedExperience from './applied-experience'

export default async function MerlApplied(){
 const supabase=await createClient()
 const {data:{user}}=await supabase.auth.getUser()
 if(!user)redirect('/login?next=%2Fmerl%2Fapplied')
 const{data,error}=await supabase.rpc('get_merl_level1_progress')
 const complete=!error&&['01','02','03','04','05'].every(id=>data?.some((row:{module_id:string;module_completed_at:string|null})=>row.module_id===id&&row.module_completed_at))
 if(!complete)return <main style={{maxWidth:800,margin:'50px auto',padding:24,fontFamily:'system-ui',color:'#0b2c4d'}}><a href="/merl/foundations">← MERL Level 1</a><h1>Level 2 locked</h1><p>Complete all five Level 1 competency gates before beginning Applied Monitoring Systems.</p></main>
 const isTestAccount=user.app_metadata?.test_account===true||user.app_metadata?.is_test_account===true||user.app_metadata?.data_classification==='acceptance_test'
 return <AppliedExperience isTestAccount={isTestAccount}/>
}

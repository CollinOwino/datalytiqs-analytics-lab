'use client'

import {useRouter} from 'next/navigation'
import {useState} from 'react'

export default function ExecutiveUtilities(){
 const router=useRouter()
 const[refreshing,setRefreshing]=useState(false)
 function refresh(){
  setRefreshing(true)
  router.refresh()
  window.setTimeout(()=>setRefreshing(false),800)
 }
 return <nav className="ceo-utilities" aria-label="Page utilities">
  <button type="button" onClick={refresh} disabled={refreshing} aria-live="polite">{refreshing?'Refreshing…':'Refresh intelligence'}</button>
  <button type="button" onClick={()=>window.print()}>Print executive brief</button>
  <a href="#direction">Record direction</a>
 </nav>
}

import type{LearnerProject,ProjectPatch}from'./types'
async function json<T>(r:Response):Promise<T>{const b=await r.json();if(!r.ok)throw new Error(b?.error?.message||'Persistence API error');return b}
export const listProjects=()=>fetch('/api/projects',{cache:'no-store'}).then(json<LearnerProject[]>)
export const createProject=(input:{caseId:string;title:string;code:string;activeDataset?:string})=>fetch('/api/projects',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)}).then(json<LearnerProject>)
export const loadProject=(id:string)=>fetch(`/api/projects/${id}`,{cache:'no-store'}).then(json<LearnerProject>)
export const saveProject=(id:string,patch:ProjectPatch,expectedVersion?:number)=>fetch(`/api/projects/${id}`,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({patch,expectedVersion})}).then(json<LearnerProject>)

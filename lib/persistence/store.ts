import type{PersistenceStore}from'./types'
import{MemoryPersistenceStore}from'./providers/memory'
let store:PersistenceStore|null=null
export function getPersistenceStore():PersistenceStore{if(store)return store;switch(process.env.PERSISTENCE_PROVIDER||'memory'){case'memory':store=new MemoryPersistenceStore();break;default:throw new Error(`Unsupported PERSISTENCE_PROVIDER: ${process.env.PERSISTENCE_PROVIDER}`)}return store}
export const defaultStages=()=>Array.from({length:6},(_,i)=>({stageId:String(i+1).padStart(2,'0'),status:(i===0?'ready':'locked')as 'ready'|'locked',completedTasks:[],updatedAt:new Date().toISOString()}))

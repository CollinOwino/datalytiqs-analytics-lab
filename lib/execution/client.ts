import type{ExecutionAccepted,ExecutionRequest,ExecutionResult}from'./types'

const API='/api/executions'
async function json<T>(res:Response):Promise<T>{const body=await res.json().catch(()=>({}));if(!res.ok)throw new Error(body?.error?.message||body?.message||`Execution API error ${res.status}`);return body as T}
export async function submitExecution(input:Omit<ExecutionRequest,'requestId'>):Promise<ExecutionAccepted>{const requestId=crypto.randomUUID();return json(await fetch(API,{method:'POST',headers:{'content-type':'application/json','x-request-id':requestId},body:JSON.stringify({...input,requestId})}))}
export async function getExecution(executionId:string):Promise<ExecutionResult>{return json(await fetch(`${API}/${encodeURIComponent(executionId)}`,{cache:'no-store'}))}
export async function cancelExecution(executionId:string):Promise<void>{const res=await fetch(`${API}/${encodeURIComponent(executionId)}`,{method:'DELETE'});if(!res.ok)await json(res)}
export async function waitForExecution(executionId:string,{intervalMs=600,timeoutMs=35000}:{intervalMs?:number;timeoutMs?:number}={}):Promise<ExecutionResult>{const start=Date.now();for(;;){const result=await getExecution(executionId);if(['succeeded','failed','timed_out','cancelled'].includes(result.status))return result;if(Date.now()-start>timeoutMs)throw new Error('Execution status polling timed out.');await new Promise(r=>setTimeout(r,intervalMs))}}

import type{ExecutionAccepted,ExecutionProvider,ExecutionRequest,ExecutionResult}from'../types'

type RemoteConfig={baseUrl:string;token:string}

export class RemoteExecutionProvider implements ExecutionProvider{
  readonly name='remote'
  constructor(private config:RemoteConfig){}
  private headers(){return{'content-type':'application/json','authorization':`Bearer ${this.config.token}`}}
  private async parse<T>(res:Response):Promise<T>{const body=await res.json().catch(()=>({}));if(!res.ok)throw new Error(body?.error?.message||body?.message||`Remote runner error ${res.status}`);return body as T}
  async execute(request:ExecutionRequest):Promise<ExecutionAccepted>{return this.parse(await fetch(`${this.config.baseUrl}/v1/executions`,{method:'POST',headers:this.headers(),body:JSON.stringify(request),cache:'no-store'}))}
  async getResult(executionId:string):Promise<ExecutionResult>{return this.parse(await fetch(`${this.config.baseUrl}/v1/executions/${encodeURIComponent(executionId)}`,{headers:this.headers(),cache:'no-store'}))}
  async cancel(executionId:string):Promise<void>{const r=await fetch(`${this.config.baseUrl}/v1/executions/${encodeURIComponent(executionId)}`,{method:'DELETE',headers:this.headers(),cache:'no-store'});if(!r.ok)await this.parse(r)}
  async health(){return this.parse<{ok:boolean;provider:string;details?:Record<string,unknown>}>(await fetch(`${this.config.baseUrl}/v1/health`,{headers:this.headers(),cache:'no-store'}))}
}

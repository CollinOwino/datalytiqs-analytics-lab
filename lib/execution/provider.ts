import type{ExecutionProvider}from'./types'
import{MockExecutionProvider}from'./providers/mock'
import{RemoteExecutionProvider}from'./providers/remote'
let instance:ExecutionProvider|null=null
export function getExecutionProvider():ExecutionProvider{if(instance)return instance;const selected=process.env.EXECUTION_PROVIDER||'mock';switch(selected){case'mock':instance=new MockExecutionProvider();break;case'remote':{const baseUrl=process.env.SANDBOX_API_URL,token=process.env.SANDBOX_API_TOKEN;if(!baseUrl||!token)throw new Error('SANDBOX_API_URL and SANDBOX_API_TOKEN are required for remote execution.');instance=new RemoteExecutionProvider({baseUrl:baseUrl.replace(/\/$/,''),token});break}default:throw new Error(`Unsupported EXECUTION_PROVIDER: ${selected}`)}return instance}

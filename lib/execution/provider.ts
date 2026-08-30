import type{ExecutionProvider}from'./types'
import{MockExecutionProvider}from'./providers/mock'
let instance:ExecutionProvider|null=null
export function getExecutionProvider():ExecutionProvider{if(instance)return instance;const selected=process.env.EXECUTION_PROVIDER||'mock';switch(selected){case'mock':instance=new MockExecutionProvider();break;default:throw new Error(`Unsupported EXECUTION_PROVIDER: ${selected}`)}return instance}

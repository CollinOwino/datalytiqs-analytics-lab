export type ExecutionLanguage='python'
export type ExecutionStatus='queued'|'running'|'succeeded'|'failed'|'timed_out'|'cancelled'
export type OutputKind='stdout'|'stderr'|'table'|'chart'|'display'|'error'

export interface DatasetRef{datasetId?:string;name:string;downloadUrl?:string;contentBase64?:string;mimeType?:string}
export interface ExecutionLimits{timeoutMs?:number;memoryMb?:number;cpuSeconds?:number;maxOutputBytes?:number;network?:'disabled'|'restricted'}
export interface ExecutionRequest{requestId:string;caseId?:string;learnerId?:string;language:ExecutionLanguage;runtime?:string;code:string;datasets?:DatasetRef[];packages?:string[];limits?:ExecutionLimits;metadata?:Record<string,string>}
export interface TableOutput{columns:string[];rows:(string|number|boolean|null)[][];rowCount?:number;truncated?:boolean}
export interface ChartOutput{format:'png'|'svg'|'vega-lite';data?:string;url?:string;spec?:Record<string,unknown>;title?:string}
export interface ExecutionOutput{id:string;kind:OutputKind;sequence:number;text?:string;table?:TableOutput;chart?:ChartOutput;mimeType?:string;data?:string}
export interface ExecutionResult{executionId:string;requestId:string;status:ExecutionStatus;startedAt?:string;finishedAt?:string;exitCode?:number;outputs:ExecutionOutput[];metrics?:{wallTimeMs?:number;cpuTimeMs?:number;peakMemoryMb?:number};error?:{code:string;message:string;retryable:boolean;details?:Record<string,unknown>}}
export interface ExecutionAccepted{executionId:string;requestId:string;status:'queued'|'running'}
export interface ExecutionProvider{readonly name:string;execute(request:ExecutionRequest):Promise<ExecutionAccepted>;getResult(executionId:string):Promise<ExecutionResult>;cancel(executionId:string):Promise<void>;health():Promise<{ok:boolean;provider:string;details?:Record<string,unknown>}>}

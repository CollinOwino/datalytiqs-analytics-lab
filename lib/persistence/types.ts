export type StageStatus='locked'|'ready'|'in_progress'|'completed'
export interface StageProgress{stageId:string;status:StageStatus;completedTasks:string[];interpretation?:string;updatedAt:string}
export interface LearnerProject{id:string;learnerId:string;caseId:string;title:string;code:string;activeDataset?:string;stages:StageProgress[];createdAt:string;updatedAt:string;version:number}
export interface ProjectPatch{title?:string;code?:string;activeDataset?:string;stage?:{stageId:string;status?:StageStatus;completedTasks?:string[];interpretation?:string}}
export interface PersistenceStore{getProject(learnerId:string,projectId:string):Promise<LearnerProject|null>;listProjects(learnerId:string):Promise<LearnerProject[]>;createProject(input:Omit<LearnerProject,'id'|'createdAt'|'updatedAt'|'version'>):Promise<LearnerProject>;updateProject(learnerId:string,projectId:string,patch:ProjectPatch,expectedVersion?:number):Promise<LearnerProject>}

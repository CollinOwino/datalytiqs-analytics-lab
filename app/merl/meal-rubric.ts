export type MealRubricDimension={id:string;label:string;critical?:boolean;description:string}
export const MEAL_RUBRIC:MealRubricDimension[]=[
{id:'results_logic',label:'Results and causal logic',description:'Results chain, Theory of Change, assumptions and risks are coherent and defensible.'},
{id:'measurement',label:'Measurement and methodological fitness',description:'Indicators, sources, methods, sampling and analysis fit the decision and evidence question.'},
{id:'integrity',label:'Data quality, ethics, safeguarding and protection',critical:true,description:'Quality controls, limitations, consent/protection and responsible data practices are explicit.'},
{id:'accountability',label:'Accountability and stakeholder responsiveness',critical:true,description:'Stakeholders can provide feedback safely; response, closure, escalation and communication-back are specified.'},
{id:'analysis',label:'Analysis and defensible interpretation',description:'Claims follow from evidence, uncertainty and limitations are disclosed, and disaggregation is used appropriately.'},
{id:'learning',label:'Learning and reflection',description:'Priority learning questions, reflection and lessons are documented and linked to evidence.'},
{id:'adaptation',label:'Evidence-to-adaptation / decision use',description:'Evidence leads to a documented decision or adaptation with owner, due date and follow-up measure.'},
{id:'communication',label:'Communication, inclusion and professional integrity',description:'Outputs are audience-appropriate, accessible, inclusive and professionally attributable.'},
]
export const MEAL_COMPETENT_THRESHOLD=16
export const MEAL_STRONG_THRESHOLD=20
export function evaluateMealRubric(scores:Record<string,number>){
 const normalized=Object.fromEntries(MEAL_RUBRIC.map(d=>[d.id,Number(scores[d.id]??0)]))
 const invalid=Object.values(normalized).some(v=>!Number.isInteger(v)||v<0||v>3)
 if(invalid)return{valid:false,total:0,competent:false,strong:false,criticalFailure:true}
 const total=Object.values(normalized).reduce((a,b)=>a+b,0)
 const criticalFailure=MEAL_RUBRIC.some(d=>d.critical&&normalized[d.id]===0)
 const competent=!criticalFailure&&total>=MEAL_COMPETENT_THRESHOLD
 const strong=competent&&total>=MEAL_STRONG_THRESHOLD&&Object.values(normalized).every(v=>v>=2)
 return{valid:true,total,competent,strong,criticalFailure}
}

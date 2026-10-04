export const previewInstitution={
  name:'Lakeview Academy — Synthetic',code:'PREVIEW-001',club:'DatalytIQs Young Analysts Club',cohort:'Builder Cohort A',
  term:'Acceptance Test · 2026',instructors:2,guardians:12,
}

export const previewLearners=[
 {id:'YA-001',name:'Amani K.',progress:72,level:'Builder',status:'On track'},
 {id:'YA-002',name:'Baraka M.',progress:58,level:'Builder',status:'Practice suggested'},
 {id:'YA-003',name:'Chebet N.',progress:81,level:'Builder',status:'On track'},
 {id:'YA-004',name:'Dayo O.',progress:46,level:'Builder',status:'Instructor check-in'},
 {id:'YA-005',name:'Eshe W.',progress:64,level:'Builder',status:'On track'},
 {id:'YA-006',name:'Furaha T.',progress:77,level:'Builder',status:'On track'},
 {id:'YA-007',name:'Gatimu R.',progress:53,level:'Builder',status:'Practice suggested'},
 {id:'YA-008',name:'Hawa S.',progress:88,level:'Builder',status:'On track'},
 {id:'YA-009',name:'Imani P.',progress:69,level:'Builder',status:'On track'},
 {id:'YA-010',name:'Jabali L.',progress:41,level:'Builder',status:'Instructor check-in'},
 {id:'YA-011',name:'Kamau B.',progress:75,level:'Builder',status:'On track'},
 {id:'YA-012',name:'Lulu A.',progress:62,level:'Builder',status:'On track'},
]

export const previewChallenges=[
 {id:'CH-01',title:'School Water Data Detective',skill:'Data · Statistics',due:'25 Sep',status:'Open',question:'Where is water being used most, and what evidence supports your conclusion?',output:'One cleaned table, one chart and a 100-word evidence note.',criteria:['Accurate data handling','Appropriate chart','Evidence-based explanation','Privacy-aware presentation']},
 {id:'CH-02',title:'Build a Pocket-Money Tracker',skill:'Python · Problem solving',due:'02 Oct',status:'Open',question:'Can a simple program turn transactions into a useful weekly spending summary?',output:'A working Python script, test evidence and a short reflection.',criteria:['Correct variables and totals','Readable output','At least two test cases','Reflection on limitations']},
 {id:'CH-03',title:'Survey Question Clinic',skill:'Research · Data quality',due:'09 Oct',status:'Planned',question:'Which survey questions are likely to produce misleading data, and how would you improve them?',output:'A revised five-question mini-survey with reasons for each change.',criteria:['Neutral wording','Clear response options','Logical order','Ethical data minimisation']},
]

export const competencyDomains=[
 {name:'Computational thinking',evidence:'Break a problem into steps; write and test simple code.'},
 {name:'Data literacy',evidence:'Organise, clean, summarise and visualise data appropriately.'},
 {name:'Statistical reasoning',evidence:'Describe variation and make proportionate claims from evidence.'},
 {name:'Research literacy',evidence:'Ask answerable questions and collect only necessary data.'},
 {name:'AI literacy',evidence:'Use AI critically; verify outputs and recognise limitations.'},
 {name:'Communication',evidence:'Explain a method, finding, limitation and recommended action.'},
]

export const learningCycle=['Question','Plan','Build','Test','Analyse','Explain','Reflect']

export const previewMetrics={
 learners:previewLearners.length,instructors:previewInstitution.instructors,guardians:previewInstitution.guardians,
 openChallenges:previewChallenges.filter(x=>x.status==='Open').length,attention:previewLearners.filter(x=>x.progress<60).length,
 averageProgress:Math.round(previewLearners.reduce((sum,x)=>sum+x.progress,0)/previewLearners.length),
}

export const previewGuardian={
 learner:'Amani K.',relationship:'Parent / guardian',relationshipVerified:true,progress:72,completed:7,projects:2,badges:3,
 next:'Variables & Input · Challenge',strength:'Explains what code is intended to do before running it.',
 support:'Practise tracing variable values using one short example before the next challenge.',
 note:'Synthetic acceptance-test record. No real child data.',
}

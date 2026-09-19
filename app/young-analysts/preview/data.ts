export const previewInstitution={
  name:'Lakeview Academy — Synthetic',
  code:'PREVIEW-001',
  club:'DatalytIQs Young Analysts Club',
  cohort:'Builder Cohort A',
  term:'Acceptance Test · 2026',
  instructors:2,
  guardians:12,
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
 {id:'CH-01',title:'School Water Data Detective',skill:'Data · Statistics',due:'25 Sep',status:'Open'},
 {id:'CH-02',title:'Build a Pocket-Money Tracker',skill:'Python · Problem solving',due:'02 Oct',status:'Open'},
]

export const previewMetrics={
 learners:previewLearners.length,
 instructors:previewInstitution.instructors,
 guardians:previewInstitution.guardians,
 openChallenges:previewChallenges.filter(x=>x.status==='Open').length,
 attention:previewLearners.filter(x=>x.progress<60).length,
}

export const previewGuardian={
 learner:'Amani K.',
 relationship:'Parent / guardian',
 relationshipVerified:true,
 progress:72,
 completed:7,
 projects:2,
 badges:3,
 next:'Variables & Input · Challenge',
 note:'Synthetic acceptance-test record. No real child data.',
}

export type AssessmentItem={
 id:string; module:number; type:'concept'|'predict'|'debug'|'test-design'|'interpret'|'responsible-practice';
 prompt:string; options:string[]; answer:number; rationale:string;
}

export const pythonKidsAssessmentBank:AssessmentItem[]=[
 {id:'M01-Q1',module:1,type:'predict',prompt:'What prints first?\nprint("Pack bag")\nprint("Leave home")',options:['Leave home','Pack bag','Both at once'],answer:1,rationale:'Python executes these statements from top to bottom.'},
 {id:'M01-Q2',module:1,type:'debug',prompt:'Which change fixes print("Ready" ?',options:['Add a closing )','Remove the quote','Change print to PRINT'],answer:0,rationale:'The function call needs a closing parenthesis.'},
 {id:'M01-Q3',module:1,type:'test-design',prompt:'Which test best checks whether a three-step algorithm has the right order?',options:['Read only the title','Follow every step exactly in sequence','Count the letters'],answer:1,rationale:'Executing the sequence exposes missing or misplaced steps.'},

 {id:'M02-Q1',module:2,type:'predict',prompt:'What is the output of print(12 + 8)?',options:['128','20','12 + 8'],answer:1,rationale:'Unquoted numeric values are added.'},
 {id:'M02-Q2',module:2,type:'debug',prompt:'Why does print("12" + 8) fail?',options:['12 is text while 8 is numeric','Python cannot add','print cannot show numbers'],answer:0,rationale:'The operands have incompatible types for this operation.'},
 {id:'M02-Q3',module:2,type:'interpret',prompt:'A calculator prints Total: 42 after adding 24 and 18. What is the strongest evidence it is correct?',options:['The variable is named total','42 matches an independent calculation','The code has two lines'],answer:1,rationale:'Independent expected-vs-actual checking is evidence of correctness.'},

 {id:'M03-Q1',module:3,type:'concept',prompt:'Which variable name is valid and descriptive?',options:['my score','3score','lesson_count'],answer:2,rationale:'It has no spaces, does not begin with a number and communicates meaning.'},
 {id:'M03-Q2',module:3,type:'responsible-practice',prompt:'Which input is appropriate for a beginner project?',options:['Home address','Choose a story setting','Account password'],answer:1,rationale:'It serves the task without collecting sensitive personal information.'},
 {id:'M03-Q3',module:3,type:'test-design',prompt:'An interactive story accepts a character and mission. What is a useful test?',options:['Try two different safe answer pairs','Only read the code','Enter a real home address'],answer:0,rationale:'Multiple safe inputs test whether stored answers are handled correctly.'},

 {id:'M04-Q1',module:4,type:'predict',prompt:'score = 10; condition is score > 10. Does the condition run?',options:['Yes','No','Only sometimes'],answer:1,rationale:'10 is not greater than 10.'},
 {id:'M04-Q2',module:4,type:'debug',prompt:'Which operator should compare choice with "left"?',options:['=','==','+='],answer:1,rationale:'== compares values; = assigns.'},
 {id:'M04-Q3',module:4,type:'test-design',prompt:'A rule changes at score 80. Which set best tests the boundary?',options:['1, 2, 3','79, 80, 81','80, 80, 80'],answer:1,rationale:'Values immediately below, at and above the boundary test the rule.'},

 {id:'M05-Q1',module:5,type:'concept',prompt:'What makes a while loop safe?',options:['A control value that can reach the stopping condition','Many print statements','A long variable name'],answer:0,rationale:'The loop state must change so termination is reachable.'},
 {id:'M05-Q2',module:5,type:'predict',prompt:'How many iterations does for x in range(4) perform?',options:['3','4','5'],answer:1,rationale:'range(4) supplies four values: 0 through 3.'},
 {id:'M05-Q3',module:5,type:'test-design',prompt:'What evidence best shows a countdown loop is correct?',options:['It uses while','It produces expected values and terminates','It has comments'],answer:1,rationale:'Correct output plus termination tests both behaviour and safety.'},

 {id:'M06-Q1',module:6,type:'concept',prompt:'What is the first valid index of a Python list?',options:['0','1','-1 only'],answer:0,rationale:'Python sequences use zero-based indexing.'},
 {id:'M06-Q2',module:6,type:'debug',prompt:'For points=[5,6,7], which expression calculates the total?',options:['sum(points)','sum(point)','len(points)'],answer:0,rationale:'sum needs the collection; len counts items.'},
 {id:'M06-Q3',module:6,type:'test-design',prompt:'Which checks are most useful after appending an item?',options:['Check new length and last value','Check font size','Rename the list'],answer:0,rationale:'Length and final value directly test the append behaviour.'},

 {id:'M07-Q1',module:7,type:'concept',prompt:'What does return do in a function?',options:['Sends a result to the caller','Repeats the function forever','Prints automatically'],answer:0,rationale:'return makes a computed result available to the caller.'},
 {id:'M07-Q2',module:7,type:'debug',prompt:'A square function returns n+n. What should it return?',options:['n*n','n/n','n-1'],answer:0,rationale:'Squaring multiplies a value by itself.'},
 {id:'M07-Q3',module:7,type:'test-design',prompt:'What is stronger evidence that double(n) works?',options:['One successful input','Several inputs with expected results','The function is short'],answer:1,rationale:'Multiple cases provide broader behavioural evidence.'},

 {id:'M08-Q1',module:8,type:'concept',prompt:'Why include an invalid-input route in a game?',options:['To collect more personal data','To help the player recover safely','To make scoring random'],answer:1,rationale:'Helpful error handling makes the interaction robust.'},
 {id:'M08-Q2',module:8,type:'debug',prompt:'score + 2 does not update score. Which statement does?',options:['score = score + 2','print(score + 2)','score == 2'],answer:0,rationale:'Assignment stores the new state.'},
 {id:'M08-Q3',module:8,type:'test-design',prompt:'A game accepts star or moon. What should be tested?',options:['Only star','Star, moon and an invalid choice','Only the title'],answer:1,rationale:'Every valid route and invalid input should be exercised.'},

 {id:'M09-Q1',module:9,type:'concept',prompt:'What is the mean of [2,4,6]?',options:['3','4','12'],answer:1,rationale:'The total 12 divided by 3 observations is 4.'},
 {id:'M09-Q2',module:9,type:'interpret',prompt:'Values rise across only three days. Which conclusion is responsible?',options:['They will always rise','They rose in these three observations; more data are needed for a broader claim','The cause is proven'],answer:1,rationale:'The conclusion stays within the evidence and states its limitation.'},
 {id:'M09-Q3',module:9,type:'responsible-practice',prompt:'Which dataset is preferable for a beginner trend exercise?',options:['Anonymous daily reading minutes','Classmates’ passwords','Home addresses'],answer:0,rationale:'It supports the learning purpose without unnecessary sensitive data.'},

 {id:'M10-Q1',module:10,type:'test-design',prompt:'When should project acceptance tests be defined?',options:['Before or during planning, then rerun after changes','Only after presentation','Never'],answer:0,rationale:'Early expected behaviour guides implementation and regression testing.'},
 {id:'M10-Q2',module:10,type:'interpret',prompt:'A project passes two tests but fails one. What is the best next action?',options:['Claim completion','Investigate the failed case, fix it and rerun the tests','Delete the failed test'],answer:1,rationale:'A failed acceptance case is evidence requiring diagnosis and retesting.'},
 {id:'M10-Q3',module:10,type:'responsible-practice',prompt:'What makes final project evidence complete?',options:['Code only','Code, expected-vs-actual tests, explanation, limitation and reflection','A public learner profile'],answer:1,rationale:'Competency evidence combines artefact, verification and reasoning.'},
]

export function getModuleAssessment(module:number){return pythonKidsAssessmentBank.filter(item=>item.module===module)}

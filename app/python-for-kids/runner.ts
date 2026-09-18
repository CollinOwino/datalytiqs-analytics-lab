import { getLesson } from './content'

type Value = string | number
export type RunResult = { ok: boolean; output: string; feedback: string; errorCategory?: string }

function valueOf(token: string, vars: Map<string, Value>): Value {
  const value = token.trim()
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) return value.slice(1,-1)
  if (/^[a-zA-Z_]\w*$/.test(value) && vars.has(value)) return vars.get(value)!
  throw new Error(`I could not understand “${value}”. Check quotes and variable names.`)
}

function expression(source: string, vars: Map<string, Value>): Value {
  const parts = source.trim().split(/\s*([+\-*/])\s*/)
  if (parts.length === 1) return valueOf(parts[0], vars)
  let result = valueOf(parts[0], vars)
  for (let i=1;i<parts.length;i+=2) {
    const right=valueOf(parts[i+1],vars); const op=parts[i]
    if (typeof result !== 'number' || typeof right !== 'number') throw new Error('Use arithmetic operators with numbers, not text.')
    result=op==='+'?result+right:op==='-'?result-right:op==='*'?result*right:result/right
  }
  return result
}

export function runFoundationCode(lessonCode: string, code: string): RunResult {
  const lesson=getLesson(lessonCode)
  if (!lesson) return {ok:false,output:'',feedback:'This lesson is not available.',errorCategory:'lesson'}
  if (!code.trim() || code.length>2000) return {ok:false,output:'',feedback:'Keep your program between 1 and 2,000 characters.',errorCategory:'limit'}
  if (/\b(import|from|open|eval|exec|compile|globals|locals|__\w+__|while|for|def|class|lambda|try|raise)\b/.test(code)) return {ok:false,output:'',feedback:'This foundations runner only supports print, safe input, variables and arithmetic.',errorCategory:'safety'}
  const vars=new Map<string,Value>(); const output:string[]=[]; let inputIndex=0
  try {
    for (const [index,raw] of code.split(/\r?\n/).entries()) {
      const line=raw.trim(); if (!line || line.startsWith('#')) continue
      const assignment=line.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/)
      if (assignment) {
        const input=assignment[2].match(/^input\((['"])(.*?)\1\)$/)
        if (input) { output.push(input[2]); vars.set(assignment[1],lesson.inputs?.[inputIndex++] ?? 'idea'); continue }
        vars.set(assignment[1],expression(assignment[2],vars)); continue
      }
      const printed=line.match(/^print\((.*)\)$/)
      if (printed) {
        const items=printed[1].split(/\s*,\s*(?=(?:[^'"]|'[^']*'|"[^"]*")*$)/).map((item)=>expression(item,vars))
        output.push(items.join(' ')); continue
      }
      throw new Error(`Line ${index+1} needs a supported Python instruction.`)
    }
    const rendered=output.join('\n')
    const requirementsMet=lesson.required.every((word)=>code.includes(word)) && lesson.expected.every((word)=>rendered.includes(word))
    return requirementsMet
      ? {ok:true,output:rendered,feedback:'Challenge complete — your output matches the goal.'}
      : {ok:false,output:rendered,feedback:'Your program ran. Compare the output with the challenge goal and try one change.',errorCategory:'goal'}
  } catch (error) {
    return {ok:false,output:output.join('\n'),feedback:error instanceof Error?error.message:'Check your Python and try again.',errorCategory:'syntax'}
  }
}

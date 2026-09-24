'use client'

import { useState } from 'react'
import type { CalculationCheck } from './dataset-missions'

export function CalculationPractice({ checks }: { checks: readonly CalculationCheck[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  return <section className="calculation-practice" aria-labelledby="calculation-practice-title">
    <div className="exam-section-head"><div><span className="exam-kicker">DATASET SELF CHECK</span><h2 id="calculation-practice-title">Calculate, enter and interpret</h2></div><p>Use the downloadable CSV, then enter your result. These checks give immediate feedback and do not affect your scored quiz or learner record.</p></div>
    <div className="calculation-grid">{checks.map(item => {
      const numeric = Number(answers[item.code]?.replace(/,/g, ''))
      const valid = answers[item.code]?.trim() !== '' && Number.isFinite(numeric)
      const correct = valid && Math.abs(numeric - item.answer) <= item.tolerance
      return <form key={item.code} onSubmit={event => {event.preventDefault(); setRevealed(previous => ({...previous, [item.code]: true}))}}>
        <small>{item.source}</small><h3>{item.question}</h3><label htmlFor={`check-${item.code}`}>Your answer ({item.unit})</label><div className="calculation-input"><input id={`check-${item.code}`} type="text" inputMode="decimal" pattern="[-+]?[0-9,]+([.][0-9]+)?" required value={answers[item.code] ?? ''} onChange={event => {setAnswers(previous => ({...previous, [item.code]: event.target.value}));setRevealed(previous => ({...previous,[item.code]:false}))}} placeholder="Enter a number"/><button type="submit">Check answer</button></div>
        {revealed[item.code] && <div className={correct ? 'calculation-feedback correct' : 'calculation-feedback'} role="status"><strong>{correct ? 'Correct calculation.' : 'Recheck the source rows and formula.'}</strong><p>{correct ? item.explanation : 'Compare the numerator, denominator and units, then try again. You can reveal the method below.'}</p>{!correct && <details><summary>Show worked method</summary><p>{item.explanation}</p></details>}</div>}
      </form>
    })}</div>
  </section>
}

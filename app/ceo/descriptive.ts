export type NumericSummary = {
  column: string; count: number; missing: number; mean: number; median: number;
  min: number; max: number; q1: number; q3: number; standard_deviation: number
}
export type CategorySummary = { column: string; counts: { label: string; count: number }[]; other: number; missing: number }

const percentile = (sorted: number[], p: number) => {
  const index = (sorted.length - 1) * p
  const lower = Math.floor(index)
  return sorted[lower] + (sorted[Math.ceil(index)] - sorted[lower]) * (index - lower)
}

export function describeDataset(
  rows: Record<string, unknown>[],
  schema: { name: string; type: string; missing: number }[]
) {
  const summaries: NumericSummary[] = schema.filter(c => c.type === 'number').map(c => {
    const values = rows.map(r => r[c.name]).filter(v => v !== null && v !== undefined && v !== '')
      .map(Number).filter(Number.isFinite).sort((a, b) => a - b)
    const count = values.length
    const mean = values.reduce((sum, value) => sum + value, 0) / count
    return {
      column: c.name, count, missing: rows.length - count, mean,
      median: percentile(values, .5), min: values[0], max: values[count - 1],
      q1: percentile(values, .25), q3: percentile(values, .75),
      standard_deviation: count > 1
        ? Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (count - 1))
        : 0,
    }
  })
  const categories: CategorySummary[] = schema.filter(c => c.type === 'text').map(c => {
    const frequency = new Map<string, number>()
    for (const row of rows) {
      const value = row[c.name]
      if (value === null || value === undefined || value === '') continue
      const label = String(value).slice(0, 100)
      frequency.set(label, (frequency.get(label) || 0) + 1)
    }
    const sorted = [...frequency].sort((a, b) => b[1] - a[1])
    return {
      column: c.name, counts: sorted.slice(0, 6).map(([label, count]) => ({ label, count })),
      other: sorted.slice(6).reduce((sum, [, count]) => sum + count, 0), missing: c.missing,
    }
  })
  return { summaries, categories }
}

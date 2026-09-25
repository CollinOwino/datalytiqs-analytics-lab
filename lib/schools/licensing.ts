/** Approved annual commercial terms. WooCommerce remains the price authority at checkout. */
export const SCHOOL_TIERS = [
  { sku: 'DTQ-SCHOOL-STARTER-25', productId: 1644, name: 'Starter Club', seats: 25, annualPriceKes: 30_000 },
  { sku: 'DTQ-SCHOOL-GROWTH-50', productId: 1645, name: 'Growth Club', seats: 50, annualPriceKes: 50_000 },
  { sku: 'DTQ-SCHOOL-PLUS-100', productId: 1646, name: 'School Plus', seats: 100, annualPriceKes: 85_000 },
  { sku: 'DTQ-SCHOOL-INSTITUTIONAL-250', productId: 1647, name: 'Institutional', seats: 250, annualPriceKes: 175_000 },
] as const

const DAY = 24 * 60 * 60 * 1000
export const GRACE_DAYS = 30
export type LicenceState = 'pending' | 'active' | 'grace' | 'expired' | 'revoked'

function date(value: string | Date): Date {
  const parsed = value instanceof Date ? value : new Date(value)
  if (!Number.isFinite(parsed.getTime())) throw new Error('Invalid licence date')
  return parsed
}

/** The paid period ends at an exclusive instant. Grace extends existing access only. */
export function licenceState(paidThrough: string | Date | null, now: string | Date, revoked = false): LicenceState {
  if (revoked) return 'revoked'
  if (!paidThrough) return 'pending'
  const end = date(paidThrough).getTime()
  const current = date(now).getTime()
  if (current < end) return 'active'
  if (current < end + GRACE_DAYS * DAY) return 'grace'
  return 'expired'
}

/** A renewal advances a paid year; an overdue invoice starts a new year on payment. */
export function renewedPaidThrough(previousEnd: string | Date | null, paidAt: string | Date): string {
  const paid = date(paidAt)
  const previous = previousEnd ? date(previousEnd) : null
  const from = previous && previous > paid ? previous : paid
  const next = new Date(from.getTime())
  next.setUTCFullYear(next.getUTCFullYear() + 1)
  return next.toISOString()
}

/** Never enrol a new learner during grace, while pending, or above the cap. */
export function canAddLearner(sku: string, activeLearnerCount: number, state: LicenceState): boolean {
  const tier = SCHOOL_TIERS.find(t => t.sku === sku)
  if (!tier || !Number.isSafeInteger(activeLearnerCount) || activeLearnerCount < 0) return false
  return state === 'active' && activeLearnerCount < tier.seats
}

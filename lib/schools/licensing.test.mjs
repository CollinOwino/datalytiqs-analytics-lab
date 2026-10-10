import assert from 'node:assert/strict'
import test from 'node:test'
import { SCHOOL_TIERS, GRACE_DAYS, canAddLearner, licenceState, renewedPaidThrough } from './licensing.ts'

test('approved plans have distinct SKUs, product IDs and capacity/price pairs', () => {
  assert.deepEqual(SCHOOL_TIERS.map(({ seats, annualPriceKes }) => [seats, annualPriceKes]), [[25,30000],[50,50000],[100,85000],[250,175000]])
  assert.equal(new Set(SCHOOL_TIERS.map(t => t.sku)).size, 4)
  assert.equal(new Set(SCHOOL_TIERS.map(t => t.productId)).size, 4)
})

test('grace starts at paid-period end and ends exactly 30 days later', () => {
  const end = '2027-09-24T00:00:00.000Z'
  assert.equal(GRACE_DAYS, 30)
  assert.equal(licenceState(end, '2027-09-23T23:59:59.999Z'), 'active')
  assert.equal(licenceState(end, end), 'grace')
  assert.equal(licenceState(end, '2027-10-23T23:59:59.999Z'), 'grace')
  assert.equal(licenceState(end, '2027-10-24T00:00:00.000Z'), 'expired')
  assert.equal(licenceState(end, end, true), 'revoked')
  assert.equal(licenceState(null, end), 'pending')
})

test('seats never exceed the tier cap; grace permits no new admissions', () => {
  for (const tier of SCHOOL_TIERS) {
    assert.equal(canAddLearner(tier.sku, tier.seats - 1, 'active'), true)
    assert.equal(canAddLearner(tier.sku, tier.seats, 'active'), false)
    assert.equal(canAddLearner(tier.sku, tier.seats + 1, 'active'), false)
    assert.equal(canAddLearner(tier.sku, tier.seats - 1, 'grace'), false)
  }
  assert.equal(canAddLearner('unknown', 0, 'active'), false)
  assert.equal(canAddLearner(SCHOOL_TIERS[0].sku, -1, 'active'), false)
})

test('early renewal extends the previous term; late renewal starts on payment', () => {
  assert.equal(renewedPaidThrough('2027-09-24T00:00:00Z', '2027-09-01T00:00:00Z'), '2028-09-24T00:00:00.000Z')
  assert.equal(renewedPaidThrough('2027-09-24T00:00:00Z', '2027-11-01T00:00:00Z'), '2028-11-01T00:00:00.000Z')
})

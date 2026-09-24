import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import test from 'node:test'
import { SCHOOL_TIERS } from './licensing.ts'
import { validWooSignature, validatePaidSchoolOrder } from './woocommerce.ts'

test('WooCommerce signature is bound to exact raw body and rejects malformed or altered signatures', () => {
  const body = '{"id":23}'
  const secret = 'synthetic-secret-not-for-production'
  const signature = createHmac('sha256', secret).update(body).digest('base64')
  assert.equal(validWooSignature(body, signature, secret), true)
  assert.equal(validWooSignature(body + ' ', signature, secret), false)
  assert.equal(validWooSignature(body, signature.slice(1), secret), false)
  assert.equal(validWooSignature(body, signature, ''), false)
})

test('each full-price completed school order validates; unpaid, discounted and mixed baskets fail closed', () => {
  for (const tier of SCHOOL_TIERS) {
    const order = { id: 23, status: 'completed', currency: 'KES', date_paid_gmt: '2026-09-24T08:00:00Z', total: `${tier.annualPriceKes}.00`, line_items: [{ product_id: tier.productId, quantity: 1, total: `${tier.annualPriceKes}.00` }] }
    assert.deepEqual(validatePaidSchoolOrder(order), { orderId: 23, sku: tier.sku, seats: tier.seats, paidAt: order.date_paid_gmt })
    assert.equal(validatePaidSchoolOrder({ ...order, date_paid_gmt: null }), null)
    assert.equal(validatePaidSchoolOrder({ ...order, status: 'on-hold' }), null)
    assert.equal(validatePaidSchoolOrder({ ...order, currency: 'USD' }), null)
    assert.equal(validatePaidSchoolOrder({ ...order, total: '0.00' }), null)
    assert.equal(validatePaidSchoolOrder({ ...order, line_items: [...order.line_items, { product_id: 997, quantity: 1, total: '0.00' }] }), null)
    assert.equal(validatePaidSchoolOrder({ ...order, line_items: [{ ...order.line_items[0], quantity: 2 }] }), null)
  }
})

import { createHmac, timingSafeEqual } from 'node:crypto'
import { SCHOOL_TIERS } from './licensing.ts'

/** WooCommerce signs the exact UTF-8 request body with a base64 HMAC-SHA256. */
export function validWooSignature(body: string, signature: string | null, secret: string): boolean {
  if (!secret || !signature || !/^[A-Za-z0-9+/]{43}=$/.test(signature)) return false
  const expected = createHmac('sha256', secret).update(body, 'utf8').digest()
  const received = Buffer.from(signature, 'base64')
  return received.length === expected.length && timingSafeEqual(received, expected)
}

type Order = {
  id?: number; status?: string; currency?: string; total?: string;
  date_paid_gmt?: string | null;
  line_items?: Array<{ product_id?: number; quantity?: number; total?: string }>;
}

/** Amounts are parsed as integer cents to avoid float rounding or exponent inputs. */
function cents(value: unknown): number | null {
  if (typeof value !== 'string' || !/^(0|[1-9]\d{0,9})(\.\d{1,2})?$/.test(value)) return null
  const [whole, fraction = ''] = value.split('.')
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}

/** Only a verified, single-plan, full-price order can be considered for a bound school. */
export function validatePaidSchoolOrder(order: Order): { orderId: number; sku: string; seats: number; paidAt: string } | null {
  if (!Number.isSafeInteger(order.id) || (order.id ?? 0) <= 0 || order.status !== 'completed' || order.currency !== 'KES') return null
  if (!order.date_paid_gmt || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(order.date_paid_gmt) || !Number.isFinite(Date.parse(order.date_paid_gmt))) return null
  if (!Array.isArray(order.line_items) || order.line_items.length !== 1) return null
  const line = order.line_items[0]
  const tier = SCHOOL_TIERS.find(t => t.productId === line.product_id)
  if (!tier || line.quantity !== 1 || cents(line.total) !== tier.annualPriceKes * 100 || cents(order.total) !== tier.annualPriceKes * 100) return null
  return { orderId: order.id!, sku: tier.sku, seats: tier.seats, paidAt: order.date_paid_gmt }
}

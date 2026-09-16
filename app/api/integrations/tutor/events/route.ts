import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

import { createAdminClient } from '../../../../../lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BODY_BYTES = 128 * 1024
const MAX_CLOCK_SKEW_SECONDS = 5 * 60
const EVENTS = new Set(['enrolment_created', 'course_completed'])

type TutorEvent = {
  event_id: string
  event: 'enrolment_created' | 'course_completed'
  occurred_at: string
  site_url: string
  user_id: number
  user_email: string
  course_id: number
  order_id?: number
}

function error(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, {
    status,
    headers: { 'cache-control': 'no-store' },
  })
}

function validPayload(input: unknown): input is TutorEvent {
  if (!input || typeof input !== 'object') return false
  const event = input as Record<string, unknown>
  return typeof event.event_id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(event.event_id) &&
    typeof event.event === 'string' && EVENTS.has(event.event) &&
    typeof event.occurred_at === 'string' && !Number.isNaN(Date.parse(event.occurred_at)) &&
    typeof event.site_url === 'string' && event.site_url.startsWith('https://') &&
    Number.isSafeInteger(event.user_id) && (event.user_id as number) > 0 &&
    typeof event.user_email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(event.user_email) &&
    Number.isSafeInteger(event.course_id) && (event.course_id as number) > 0 &&
    (event.order_id === undefined || (Number.isSafeInteger(event.order_id) && (event.order_id as number) > 0))
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) return error('PAYLOAD_TOO_LARGE', 'The event payload exceeds the permitted size.', 413)

  const secret = process.env.DATALYTIQS_TUTOR_LAB_SECRET
  if (!secret) return error('INTEGRATION_NOT_CONFIGURED', 'Tutor integration is not configured.', 503)

  const timestamp = request.headers.get('x-datalytiqs-timestamp')
  const signature = request.headers.get('x-datalytiqs-signature')
  const timestampSeconds = Number(timestamp)
  if (!timestamp || !Number.isInteger(timestampSeconds) ||
    Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > MAX_CLOCK_SKEW_SECONDS) {
    return error('STALE_OR_INVALID_TIMESTAMP', 'A current signed timestamp is required.', 401)
  }

  const rawBody = await request.text()
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) return error('PAYLOAD_TOO_LARGE', 'The event payload exceeds the permitted size.', 413)

  const expected = `sha256=${createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')}`
  if (!signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return error('INVALID_SIGNATURE', 'The event signature is invalid.', 401)
  }

  let payload: unknown
  try { payload = JSON.parse(rawBody) } catch { return error('INVALID_JSON', 'The event body must be valid JSON.', 400) }
  if (!validPayload(payload)) return error('INVALID_EVENT', 'The event does not satisfy the integration contract.', 400)

  try {
    const supabase = createAdminClient()
    const { data, error: rpcError } = await supabase.rpc('receive_tutor_lab_event', {
      p_event_id: payload.event_id,
      p_event_type: payload.event,
      p_occurred_at: payload.occurred_at,
      p_source_url: payload.site_url,
      p_tutor_user_id: payload.user_id,
      p_user_email: payload.user_email,
      p_course_id: payload.course_id,
      p_order_id: payload.order_id ?? null,
      p_payload: payload,
    })
    if (rpcError) throw rpcError
    const result = Array.isArray(data) ? data[0] : data
    return NextResponse.json({ accepted: true, eventId: payload.event_id, status: result?.status ?? 'accepted', learnerMapped: Boolean(result?.learner_mapped) }, { status: 202, headers: { 'cache-control': 'no-store' } })
  } catch (cause) {
    console.error('Tutor integration delivery failed', { eventId: payload.event_id, event: payload.event, cause: cause instanceof Error ? cause.message : 'Unknown error' })
    return error('EVENT_PROCESSING_FAILED', 'The event could not be processed. Retry delivery later.', 503)
  }
}

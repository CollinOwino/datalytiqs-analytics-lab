import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../../../lib/supabase/admin'

export const runtime='nodejs'
export const dynamic='force-dynamic'
const MAX_BODY_BYTES=256*1024
const ALLOWED_TOPICS=new Set(['order.created','order.updated'])
const ACTIONABLE_STATUSES=new Set(['processing','completed','cancelled','refunded','failed'])

type WooOrder={id:number;status:string;billing?:{email?:string};line_items?:Array<{product_id:number;variation_id?:number;sku?:string}>}
const fail=(code:string,message:string,status:number)=>NextResponse.json({error:{code,message}},{status,headers:{'cache-control':'no-store'}})

export async function POST(request:NextRequest){
  const length=Number(request.headers.get('content-length')||0);if(length>MAX_BODY_BYTES)return fail('PAYLOAD_TOO_LARGE','Payload exceeds the permitted size.',413)
  const secret=process.env.DATALYTIQS_WOOCOMMERCE_WEBHOOK_SECRET;if(!secret)return fail('INTEGRATION_NOT_CONFIGURED','Commerce integration is not configured.',503)
  const topic=request.headers.get('x-wc-webhook-topic')||'',source=request.headers.get('x-wc-webhook-source')||'',delivery=request.headers.get('x-wc-webhook-delivery-id')||'',signature=request.headers.get('x-wc-webhook-signature')||''
  if(!ALLOWED_TOPICS.has(topic)||!/^https:\/\/datalytiqsacademy\.com\/?$/i.test(source)||!/^[0-9a-f-]{36}$/i.test(delivery))return fail('INVALID_WEBHOOK_HEADERS','Webhook source, topic or delivery identifier is invalid.',400)
  const raw=await request.text();if(Buffer.byteLength(raw,'utf8')>MAX_BODY_BYTES)return fail('PAYLOAD_TOO_LARGE','Payload exceeds the permitted size.',413)
  const expected=createHmac('sha256',secret).update(raw).digest('base64');if(signature.length!==expected.length||!timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))return fail('INVALID_SIGNATURE','Webhook signature is invalid.',401)
  let order:WooOrder;try{order=JSON.parse(raw)}catch{return fail('INVALID_JSON','Webhook body must be valid JSON.',400)}
  const email=order.billing?.email?.trim()||'',items=order.line_items||[]
  if(!Number.isSafeInteger(order.id)||order.id<1||typeof order.status!=='string'||!ACTIONABLE_STATUSES.has(order.status)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!Array.isArray(items)||items.length>100)return fail('INVALID_ORDER','Order data does not satisfy the entitlement contract.',400)
  const safeItems=items.filter(item=>Number.isSafeInteger(item.product_id)&&item.product_id>0).map(item=>({product_id:String(item.variation_id||item.product_id),sku:String(item.sku||'').trim().slice(0,100)}))
  try{const supabase=createAdminClient();const{data,error}=await supabase.rpc('process_learning_commerce_event',{p_event_id:delivery,p_event_type:topic,p_order_id:String(order.id),p_order_status:order.status,p_email:email,p_items:safeItems,p_payload_sha256:createHash('sha256').update(raw).digest('hex')});if(error)throw error;const result=Array.isArray(data)?data[0]:data;return NextResponse.json({accepted:true,deliveryId:delivery,status:result?.processing_status??'ignored',learnerMapped:Boolean(result?.learner_mapped),entitlementsChanged:Number(result?.entitlements_changed||0)},{status:202,headers:{'cache-control':'no-store'}})}catch(cause){console.error('WooCommerce entitlement delivery failed',{delivery,orderId:order.id,cause:cause instanceof Error?cause.message:'Unknown error'});return fail('EVENT_PROCESSING_FAILED','The event could not be processed. WooCommerce should retry delivery.',503)}
}

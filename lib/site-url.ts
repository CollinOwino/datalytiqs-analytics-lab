import { headers } from 'next/headers'

function httpsUrl(host: string) {
  return `https://${host.replace(/^https?:\/\//, '').replace(/\/$/, '')}`
}

export async function getSiteUrl() {
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    return httpsUrl(process.env.VERCEL_URL)
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host')
  if (host) {
    const protocol = requestHeaders.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
    return `${protocol}://${host}`
  }
  return 'http://localhost:3000'
}

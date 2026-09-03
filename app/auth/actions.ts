'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const fullName = String(formData.get('full_name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://datalytiqs-analytics-lab-cfvc.vercel.app'
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName }, emailRedirectTo: `${siteUrl}/auth/confirm` },
  })
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  redirect('/login?message=Check your email to confirm your DatalytIQs Analytics Lab account.')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

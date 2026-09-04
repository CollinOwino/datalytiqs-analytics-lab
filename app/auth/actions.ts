'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import { getSiteUrl } from '../../lib/site-url'

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
  const siteUrl = await getSiteUrl()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName }, emailRedirectTo: `${siteUrl}/auth/confirm` },
  })
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  redirect('/login?message=Check your email to confirm your DatalytIQs Analytics Lab account.')
}

export async function resendConfirmation(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') || '').trim()
  const siteUrl = await getSiteUrl()
  const { error } = await supabase.auth.resend({
    type: 'signup', email,
    options: { emailRedirectTo: `${siteUrl}/auth/confirm` },
  })
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  redirect('/login?message=If the account is awaiting confirmation, a new email has been sent. Please also check spam or junk mail.')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

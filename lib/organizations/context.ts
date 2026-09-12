import { redirect } from 'next/navigation'
import { createClient } from '../supabase/server'
import type { OrganizationContext } from './types'

export async function getOrganizationContext(preferredOrganizationId?: string): Promise<OrganizationContext | null> {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user
  if (!user) redirect('/login?next=/organisation/dashboard')

  const { data: memberships, error: memberError } = await supabase
    .from('organization_members')
    .select('organization_id,role,job_title,status')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (memberError) throw new Error(memberError.message)
  if (!memberships?.length) return null

  const selected = memberships.find(m => m.organization_id === preferredOrganizationId) ?? memberships[0]

  const [{ data: organization, error: orgError }, { data: subscription }, { data: settings }] = await Promise.all([
    supabase.from('organizations').select('id,name,slug,sector,country,onboarding_status').eq('id', selected.organization_id).single(),
    supabase.from('organization_subscriptions').select('plan,status,seats').eq('organization_id', selected.organization_id).maybeSingle(),
    supabase.from('organization_settings').select('learning_priorities,dashboard_config,reporting_period,timezone').eq('organization_id', selected.organization_id).maybeSingle(),
  ])

  if (orgError) throw new Error(orgError.message)

  return {
    organization,
    membership: { role: selected.role, job_title: selected.job_title, status: selected.status },
    subscription,
    settings,
  } as OrganizationContext
}

export async function requireExecutiveOrganization(preferredOrganizationId?: string) {
  const context = await getOrganizationContext(preferredOrganizationId)
  if (!context) redirect('/onboarding/organisation')
  if (!['ceo','org_admin'].includes(context.membership.role)) redirect('/')
  return context
}

import { redirect } from 'next/navigation'
import { createClient } from '../supabase/server'

export type ExecutiveMembership = {
  organization_id: string
  role: string
  job_title: string | null
  status: string
}

export type ExecutiveOrganization = {
  id: string
  name: string
  slug: string
  sector: string | null
  country: string
  onboarding_status: string
}

export async function getExecutiveContext(preferredOrganizationId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/executive')

  const { data: memberships, error: membershipError } = await supabase
    .from('organization_members')
    .select('organization_id, role, job_title, status')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (membershipError) throw new Error(membershipError.message)

  const activeMemberships = (memberships || []) as ExecutiveMembership[]
  const ids = activeMemberships.map((m) => m.organization_id)

  let organizations: ExecutiveOrganization[] = []
  if (ids.length) {
    const { data, error } = await supabase
      .from('organizations')
      .select('id,name,slug,sector,country,onboarding_status')
      .in('id', ids)
      .order('name')
    if (error) throw new Error(error.message)
    organizations = (data || []) as ExecutiveOrganization[]
  }

  const selected =
    organizations.find((o) => o.id === preferredOrganizationId) ||
    organizations[0] ||
    null

  const membership = selected
    ? activeMemberships.find((m) => m.organization_id === selected.id) || null
    : null

  return { supabase, user, memberships: activeMemberships, organizations, selected, membership }
}

export function withOrg(path: string, organizationId?: string | null) {
  return organizationId ? `${path}?org=${encodeURIComponent(organizationId)}` : path
}

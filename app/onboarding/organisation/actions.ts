'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'

const DEFAULT_WIDGETS = [
  'workforce_learning',
  'competency_certification',
  'analytics_activity',
  'evidence_portfolio',
  'organisation_impact',
]

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64)
}

export async function provisionPremiumOrganization(formData: FormData) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) redirect('/login?next=/onboarding/organisation')

  const name = String(formData.get('name') ?? '').trim()
  const sector = String(formData.get('sector') ?? '').trim()
  const country = String(formData.get('country') ?? 'Kenya').trim()
  const slug = slugify(String(formData.get('slug') ?? name))
  const priorities = String(formData.get('learning_priorities') ?? '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
    .slice(0, 12)

  if (name.length < 2 || slug.length < 3) {
    redirect('/onboarding/organisation?error=Provide+a+valid+organisation+name+and+slug')
  }

  const { data: orgId, error: provisionError } = await supabase.rpc('provision_premium_organization', {
    p_name: name,
    p_slug: slug,
    p_sector: sector || null,
    p_country: country || 'Kenya',
  })

  if (provisionError || !orgId) {
    redirect('/onboarding/organisation?error=' + encodeURIComponent(provisionError?.message ?? 'Provisioning failed'))
  }

  const { error: onboardingError } = await supabase.rpc('complete_organization_onboarding', {
    p_org: orgId,
    p_sector: sector,
    p_learning_priorities: priorities,
    p_dashboard_config: { widgets: DEFAULT_WIDGETS },
    p_reporting_period: String(formData.get('reporting_period') ?? 'rolling_90_days'),
  })

  if (onboardingError) {
    redirect('/onboarding/organisation?error=' + encodeURIComponent(onboardingError.message))
  }

  redirect('/organisation/dashboard?org=' + orgId)
}

export async function updateOrganizationConfiguration(formData: FormData) {
  const supabase = await createClient()
  const orgId = String(formData.get('organization_id') ?? '')
  const sector = String(formData.get('sector') ?? '')
  const priorities = String(formData.get('learning_priorities') ?? '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
    .slice(0, 12)

  const { error } = await supabase.rpc('complete_organization_onboarding', {
    p_org: orgId,
    p_sector: sector,
    p_learning_priorities: priorities,
    p_dashboard_config: { widgets: DEFAULT_WIDGETS },
    p_reporting_period: String(formData.get('reporting_period') ?? 'rolling_90_days'),
  })

  if (error) redirect('/onboarding/organisation?error=' + encodeURIComponent(error.message))
  redirect('/organisation/dashboard?org=' + orgId)
}

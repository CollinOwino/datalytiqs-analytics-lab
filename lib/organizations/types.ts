export type OrganizationRole = 'ceo' | 'org_admin' | 'manager' | 'facilitator' | 'learner'

export type DashboardWidget =
  | 'workforce_learning'
  | 'competency_certification'
  | 'analytics_activity'
  | 'evidence_portfolio'
  | 'organisation_impact'

export type OrganizationContext = {
  organization: {
    id: string
    name: string
    slug: string
    sector: string | null
    country: string
    onboarding_status: 'draft' | 'active' | 'suspended'
  }
  membership: {
    role: OrganizationRole
    job_title: string | null
    status: string
  }
  subscription: {
    plan: 'premium' | 'enterprise'
    status: string
    seats: number
  } | null
  settings: {
    learning_priorities: string[]
    dashboard_config: { widgets?: DashboardWidget[] }
    reporting_period: string
    timezone: string
  } | null
}

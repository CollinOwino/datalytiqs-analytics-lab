import Link from 'next/link'
import { logout } from '../../auth/actions'
import type { ExecutiveOrganization } from '../../../lib/executive/context'
import { withOrg } from '../../../lib/executive/context'

const nav = [
  ['Cockpit','/executive'],
  ['KPIs','/executive/kpis'],
  ['Decisions','/executive/decisions'],
  ['Actions','/executive/actions'],
  ['Data & Evidence','/executive/data'],
  ['Organisation','/executive/organization'],
] as const

export default function ExecutiveShell({
  children,
  organizations,
  selectedId,
  role,
  currentPath,
}: {
  children: React.ReactNode
  organizations: ExecutiveOrganization[]
  selectedId?: string | null
  role?: string | null
  currentPath: string
}) {
  const selected = organizations.find((o) => o.id === selectedId)
  return <main className="exec-shell">
    <aside className="exec-sidebar">
      <div className="exec-brand"><div className="exec-brand-mark">D</div><div><strong>DatalytIQs</strong><span>Executive Intelligence</span></div></div>
      <div className="exec-org-card">
        <small>ACTIVE ORGANISATION</small>
        <strong>{selected?.name || 'No organisation'}</strong>
        <span>{selected?.sector || 'Executive workspace'}</span>
      </div>
      <nav>
        {nav.map(([label,path]) => <Link key={path} className={currentPath===path?'active':''} href={withOrg(path,selectedId)}>{label}</Link>)}
      </nav>
      <div className="exec-ecosystem">
        <small>DATALYTIQS ECOSYSTEM</small>
        <a href="/">Analytics Lab ↗</a>
        <a href="https://datalytiqsacademy.com">Academy ↗</a>
        <a href="https://community.datalytiqsacademy.com">Community ↗</a>
      </div>
      <form action={logout}><button className="exec-signout" type="submit">Sign out</button></form>
    </aside>
    <section className="exec-content">
      <header className="exec-topbar">
        <div><span className="eyebrow">EXECUTIVE DECISION INFRASTRUCTURE</span><h1>{selected?.name || 'Executive Workspace'}</h1></div>
        <div className="exec-context">
          {organizations.length > 1 && <form method="get" action={currentPath}>
            <label>Organisation
              <select name="org" defaultValue={selectedId || ''}>
                {organizations.map((o)=><option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </label>
            <button type="submit">Switch</button>
          </form>}
          <div><small>ROLE</small><strong>{(role || 'member').replaceAll('_',' ')}</strong></div>
        </div>
      </header>
      {children}
    </section>
  </main>
}

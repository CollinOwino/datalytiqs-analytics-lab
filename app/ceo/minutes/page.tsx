import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import {
  confirmMinutesItem,
  delegateAction,
  reviewEvidence,
  submitActionEvidence,
} from '../minutes-actions'
import MinutesProcessForm from './minutes-process-form'
import '../ceo.css'
import './minutes.css'

export const metadata = {
  title: 'Minutes Intelligence | DatalytIQs Executive Workspace',
  description:
    'Turn meeting minutes into executive briefs, confirmed decisions, delegated actions and evidence.',
}

export default async function MinutesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=%2Fceo%2Fminutes')

  const { data: legacy } = await supabase
    .from('ceo_memberships')
    .select('organisation_id,role,display_name')
    .eq('user_id', user.id)
    .eq('active', true)
    .maybeSingle()

  if (!legacy) {
    return (
      <main className="ceo-access">
        <Link href="/ceo">← CEO Workspace</Link>
        <h1>Executive access required.</h1>
      </main>
    )
  }

  const { data: link } = await supabase
    .from('organization_legacy_links')
    .select('organization_id')
    .eq('legacy_ceo_organisation_id', legacy.organisation_id)
    .maybeSingle()

  if (!link) {
    return (
      <main className="ceo-access">
        <Link href="/ceo">← CEO Workspace</Link>
        <h1>Canonical organization link is not configured.</h1>
      </main>
    )
  }

  const oid = link.organization_id

  const [
    { data: jobs },
    { data: items },
    { data: actions },
    { data: evidence },
    { data: members },
  ] = await Promise.all([
    supabase
      .from('ceo_ai_jobs')
      .select('id,created_at,result,source_document_id')
      .eq('organization_id', oid)
      .eq('job_type', 'minutes_intelligence')
      .eq('status', 'succeeded')
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('ceo_decisions')
      .select(
        'id,title,decision_text,record_type,workflow_state,due_at,evidence_considered'
      )
      .eq('organization_id', oid)
      .neq('workflow_state', 'archived')
      .order('created_at', { ascending: false })
      .limit(30),

    supabase
      .from('ceo_actions')
      .select(
        'id,title,description,status,assigned_to,due_at,decision_id'
      )
      .eq('organization_id', oid)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(30),

    supabase
      .from('ceo_action_evidence')
      .select(
        'id,action_id,summary,external_url,review_status,created_at'
      )
      .eq('organization_id', oid)
      .order('created_at', { ascending: false })
      .limit(30),

    supabase
      .from('organization_members')
      .select(
        'user_id,role,job_title,profiles:user_id(full_name,email)'
      )
      .eq('organization_id', oid)
      .eq('status', 'active'),
  ])

  const canLead = ['ceo', 'executive'].includes(legacy.role)
  const eligibleMembers = (members ?? []).filter((m: any) => m.role !== 'viewer' && m.role !== 'learner')

  const approvedActionIds = new Set(
    (items ?? [])
      .filter(
        (x: any) =>
          x.record_type === 'proposed_action' &&
          x.workflow_state === 'approved'
      )
      .map((x: any) => x.id)
  )

  const myActions = (actions ?? []).filter(
    (a: any) => a.assigned_to === user.id
  )

  const proposedItems =
    items?.filter((x: any) => x.workflow_state === 'ai_generated') ?? []

  const approvedDecisions =
    items?.filter(
      (x: any) =>
        x.record_type === 'decision' &&
        x.workflow_state === 'approved'
    ) ?? []

  const unassignedActions =
    actions?.filter(
      (a: any) =>
        !a.assigned_to && approvedActionIds.has(a.decision_id)
    ) ?? []

  const pendingEvidence =
    evidence?.filter((e: any) => e.review_status === 'submitted') ?? []

  return (
    <main className="ceo ceo-minutes">
      <div className="ceo-minutes-shell">

        <nav className="ceo-breadcrumb" aria-label="Breadcrumb">
          <Link href="/ceo">← Command Centre</Link>
          <span aria-hidden="true">/</span>
          <span>Minutes Intelligence</span>
        </nav>

        <header className="ceo-minutes-hero">
          <div className="ceo-minutes-hero-copy">
            <p className="ceo-eyebrow">
              EXECUTIVE INTELLIGENCE WORKSPACE
            </p>

            <h1>Minutes Intelligence</h1>

            <p className="ceo-hero-lead">
              Turn meeting records into accountable execution.
            </p>

            <p className="ceo-hero-description">
              Upload approved or draft minutes, or paste meeting records.
              DatalytIQs structures them into executive briefs, decisions,
              actions, responsibilities, deadlines and evidence trails.
            </p>
          </div>

          <div className="ceo-minutes-assurance">
            <span className="ceo-assurance-label">
              PRIVATE WORKSPACE
            </span>
            <strong>Organizational intelligence</strong>
            <p>
              Records remain within the authenticated executive workflow.
              AI-extracted decisions and actions require human confirmation.
            </p>
          </div>
        </header>

        <section
          className="ceo-panel ceo-intake-panel"
          aria-labelledby="minutes-intake-title"
        >
          <div className="ceo-heading">
            <p>PROCESS MINUTES</p>
            <h2 id="minutes-intake-title">
              From meeting record to executive action
            </h2>
            <span>
              Upload a file or paste minutes below. Review extracted
              intelligence before confirming anything as an organizational
              record.
            </span>
          </div>

          <MinutesProcessForm expanded={canLead} />
        </section>

        <section className="ceo-workspace-stats" aria-label="Minutes overview">
          <div>
            <span>Recent analyses</span>
            <strong>{jobs?.length ?? 0}</strong>
          </div>
          <div>
            <span>Awaiting confirmation</span>
            <strong>{proposedItems.length}</strong>
          </div>
          <div>
            <span>Approved decisions</span>
            <strong>{approvedDecisions.length}</strong>
          </div>
          <div>
            <span>My actions</span>
            <strong>{myActions.length}</strong>
          </div>
        </section>

        <nav className="ceo-minutes-jump" aria-label="Minutes workspace sections">
          <a href="#minutes-intake-title">Process minutes</a>
          <a href="#executive-briefs">Executive briefs</a>
          {canLead && <a href="#proposed-records">Confirm proposals</a>}
          <a href="#decision-register">Decision register</a>
          {canLead && <a href="#delegation">Delegation</a>}
        </nav>

        <section className="ceo-panel" id="executive-briefs">
          <div className="ceo-heading">
            <p>EXECUTIVE BRIEF</p>
            <h2>30-second and 2-minute views</h2>
            <span>
              Rapid situational awareness from recently processed meeting
              records.
            </span>
          </div>

          {jobs?.length ? (
            <div className="ceo-record-list">
              {jobs.map((j: any) => (
                <article className="ceo-record" key={j.id}>
                  <div className="ceo-record-meta">
                    <span className="ceo-status">
                      EXECUTIVE BRIEF
                    </span>
                    <time>
                      {new Date(j.created_at).toLocaleString('en-KE')}
                    </time>
                  </div>

                  <div className="ceo-brief-grid">
                    <div>
                      <h3>30 seconds</h3>
                      <p>
                        {j.result?.brief_30_seconds || 'No brief.'}
                      </p>
                    </div>

                    <div>
                      <h3>2 minutes</h3>
                      <p>
                        {j.result?.brief_2_minutes ||
                          'No extended brief.'}
                      </p>
                    </div>
                  </div>

                  <p className="ceo-record-footnote">
                    {j.result?.decision_count ?? 0} proposed decisions ·{' '}
                    {j.result?.action_count ?? 0} proposed actions ·{' '}
                    {j.result?.fallback_used
                      ? 'Deterministic fallback used'
                      : 'Structured AI extraction'}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="ceo-empty-state">
              <strong>No minutes processed yet.</strong>
              <p>
                Your latest executive briefs will appear here after a
                meeting record is processed.
              </p>
            </div>
          )}
        </section>

        {canLead && (
          <section className="ceo-panel" id="proposed-records">
            <div className="ceo-heading">
              <p>HUMAN CONFIRMATION</p>
              <h2>Proposed decisions and actions</h2>
              <span>
                AI extraction is provisional until an authorized executive
                confirms the record.
              </span>
            </div>

            {proposedItems.length ? (
              <div className="ceo-record-list">
                {proposedItems.map((x: any) => (
                  <article className="ceo-record" key={x.id}>
                    <span className="ceo-status ceo-status-gold">
                      {x.record_type.replace('_', ' ').toUpperCase()}
                    </span>

                    <h3>{x.title}</h3>
                    <p>{x.decision_text}</p>

                    {Array.isArray(x.evidence_considered) &&
                      x.evidence_considered.length > 0 && (
                        <p className="ceo-source-note">
                          <strong>Source:</strong>{' '}
                          {x.evidence_considered
                            .map(
                              (s: any) =>
                                s.section || s.page || 'document'
                            )
                            .join(', ')}
                          {x.evidence_considered[0]?.quote
                            ? ` · ${x.evidence_considered[0].quote}`
                            : ''}
                        </p>
                      )}

                    <form
                      action={confirmMinutesItem}
                      className="ceo-action-form"
                    >
                      <input
                        type="hidden"
                        name="item_id"
                        value={x.id}
                      />

                      {x.record_type === 'proposed_action' && (
                        <div className="ceo-form-grid">
                          <label>
                            <span>Responsible officer</span>
                            <select name="assignee_id" required>
                              <option value="">
                                Select accountable officer
                              </option>

                              {eligibleMembers.map((m: any) => (
                                <option
                                  key={m.user_id}
                                  value={m.user_id}
                                >
                                  {m.profiles?.full_name ||
                                    m.profiles?.email ||
                                    m.job_title ||
                                    m.role}{' '}
                                  · {m.job_title || m.role}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label>
                            <span>Due date</span>
                            <input
                              name="due_at"
                              type="datetime-local"
                              required
                            />
                          </label>
                        </div>
                      )}

                      <button type="submit">
                        Confirm as organizational record
                      </button>
                    </form>
                  </article>
                ))}
              </div>
            ) : (
              <div className="ceo-empty-state">
                <strong>No records awaiting confirmation.</strong>
                <p>
                  Proposed decisions and actions will appear here after
                  minutes are processed.
                </p>
              </div>
            )}
          </section>
        )}

        <section className="ceo-panel" id="decision-register">
          <div className="ceo-heading">
            <p>DECISION REGISTER</p>
            <h2>Approved organizational decisions</h2>
          </div>

          {approvedDecisions.length ? (
            <div className="ceo-record-list">
              {approvedDecisions.map((x: any) => (
                <article className="ceo-record" key={x.id}>
                  <span className="ceo-status ceo-status-approved">
                    APPROVED
                  </span>

                  <h3>{x.title}</h3>
                  <p>{x.decision_text}</p>

                  {Array.isArray(x.evidence_considered) &&
                    x.evidence_considered.length > 0 && (
                      <p className="ceo-source-note">
                        <strong>Source:</strong>{' '}
                        {x.evidence_considered
                          .map(
                            (s: any) =>
                              s.section || s.page || 'document'
                          )
                          .join(', ')}
                        {x.evidence_considered[0]?.quote
                          ? ` · ${x.evidence_considered[0].quote}`
                          : ''}
                      </p>
                    )}

                  {x.due_at && (
                    <p className="ceo-record-footnote">
                      Due{' '}
                      {new Date(x.due_at).toLocaleString('en-KE')}
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="ceo-empty-state">
              <strong>No approved decisions yet.</strong>
            </div>
          )}
        </section>

        {canLead && (
          <section className="ceo-panel" id="delegation">
            <div className="ceo-heading">
              <p>DELEGATION</p>
              <h2>Assign confirmed actions</h2>
            </div>

            {unassignedActions.length ? (
              <div className="ceo-record-list">
                {unassignedActions.map((a: any) => (
                  <article className="ceo-record" key={a.id}>
                    <h3>{a.title}</h3>
                    <p>{a.description}</p>

                    <form
                      action={delegateAction}
                      className="ceo-action-form"
                    >
                      <input
                        type="hidden"
                        name="action_id"
                        value={a.id}
                      />

                      <div className="ceo-form-grid">
                        <label>
                          <span>Officer</span>
                          <select name="user_id" required>
                            <option value="">Select officer</option>
                            {eligibleMembers.map((m: any) => (
                              <option
                                key={m.user_id}
                                value={m.user_id}
                              >
                                {m.profiles?.full_name ||
                                  m.profiles?.email ||
                                  m.job_title ||
                                  m.role}{' '}
                                · {m.job_title || m.role}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          <span>Due date</span>
                          <input
                            name="due_at"
                            type="datetime-local"
                            required
                          />
                        </label>
                      </div>

                      <label>
                        <span>Delegation note</span>
                        <input name="note" />
                      </label>

                      <button type="submit">Delegate action</button>
                    </form>
                  </article>
                ))}
              </div>
            ) : (
              <div className="ceo-empty-state">
                <strong>No confirmed actions awaiting delegation.</strong>
              </div>
            )}
          </section>
        )}

        <section className="ceo-panel">
          <div className="ceo-heading">
            <p>MY ACTIONS</p>
            <h2>Submit completion evidence</h2>
          </div>

          {myActions.length ? (
            <div className="ceo-record-list">
              {myActions.map((a: any) => (
                <article className="ceo-record" key={a.id}>
                  <span className="ceo-status">
                    {a.status.toUpperCase()}
                  </span>

                  <h3>{a.title}</h3>
                  <p>{a.description}</p>

                  {!['approved', 'closed'].includes(a.status) && (
                    <form
                      action={submitActionEvidence}
                      className="ceo-action-form"
                    >
                      <input
                        type="hidden"
                        name="action_id"
                        value={a.id}
                      />

                      <label>
                        <span>Evidence summary</span>
                        <textarea
                          name="summary"
                          minLength={10}
                          required
                          rows={4}
                        />
                      </label>

                      <label>
                        <span>Evidence link (optional)</span>
                        <input name="external_url" type="url" />
                      </label>

                      <button type="submit">
                        Submit evidence
                      </button>
                    </form>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="ceo-empty-state">
              <strong>No actions currently assigned to you.</strong>
            </div>
          )}
        </section>

        {canLead && (
          <section className="ceo-panel">
            <div className="ceo-heading">
              <p>CEO REVIEW</p>
              <h2>Evidence awaiting judgement</h2>
            </div>

            {pendingEvidence.length ? (
              <div className="ceo-record-list">
                {pendingEvidence.map((e: any) => (
                  <article className="ceo-record" key={e.id}>
                    <span className="ceo-status ceo-status-gold">
                      REVIEW REQUIRED
                    </span>

                    <p>{e.summary}</p>

                    {e.external_url && (
                      <p className="ceo-source-note">
                        Evidence link recorded.
                      </p>
                    )}

                    <form
                      action={reviewEvidence}
                      className="ceo-review-actions"
                    >
                      <input
                        type="hidden"
                        name="evidence_id"
                        value={e.id}
                      />
                      <input
                        type="hidden"
                        name="action_id"
                        value={e.action_id}
                      />

                      <button
                        name="verdict"
                        value="accepted"
                        type="submit"
                      >
                        Accept evidence
                      </button>

                      <button
                        className="ceo-button-secondary"
                        name="verdict"
                        value="returned"
                        type="submit"
                      >
                        Return for action
                      </button>
                    </form>
                  </article>
                ))}
              </div>
            ) : (
              <div className="ceo-empty-state">
                <strong>No evidence awaiting executive review.</strong>
              </div>
            )}
          </section>
        )}

      </div>
    </main>
  )
}

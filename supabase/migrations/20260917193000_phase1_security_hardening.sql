-- Phase 1 follow-up: close exposed provisioning helpers and cover new foreign keys.

revoke execute on function public.complete_organization_onboarding(uuid,text,jsonb,jsonb,text) from public, anon;
grant execute on function public.complete_organization_onboarding(uuid,text,jsonb,jsonb,text) to authenticated;

revoke execute on function public.provision_premium_organization(text,text,text,text) from public, anon;
grant execute on function public.provision_premium_organization(text,text,text,text) to authenticated;

revoke execute on function public.provision_executive_pilot() from public, anon, authenticated;
grant execute on function public.provision_executive_pilot() to service_role;

create index if not exists departments_parent_idx on public.departments(parent_department_id);
create index if not exists departments_head_idx on public.departments(head_user_id);
create index if not exists departments_creator_idx on public.departments(created_by);
create index if not exists teams_department_idx on public.teams(department_id);
create index if not exists teams_lead_idx on public.teams(lead_user_id);
create index if not exists teams_creator_idx on public.teams(created_by);
create index if not exists roles_organization_idx on public.roles(organization_id);
create index if not exists role_permissions_permission_idx on public.role_permissions(permission_id);
create index if not exists member_roles_role_idx on public.member_roles(role_id);
create index if not exists member_roles_assigned_by_idx on public.member_roles(assigned_by);
create index if not exists organization_legacy_links_legacy_idx on public.organization_legacy_links(legacy_ceo_organisation_id);
create index if not exists organization_legacy_links_linked_by_idx on public.organization_legacy_links(linked_by);
create index if not exists usage_records_recorded_by_idx on public.usage_records(recorded_by);
create index if not exists audit_events_actor_idx on public.audit_events(actor_user_id);
create index if not exists activity_logs_actor_idx on public.activity_logs(actor_user_id);

comment on function public.provision_executive_pilot() is
'Acceptance-test provisioning helper. Execution restricted to service_role.';

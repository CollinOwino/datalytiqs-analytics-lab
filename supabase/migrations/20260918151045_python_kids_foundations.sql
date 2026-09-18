-- Python for Kids: shared identity, safeguarded learning evidence and configurable access.

create table public.learning_programmes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  owner_system text not null default 'academy' check (owner_system in ('academy','analytics_lab')),
  free_module_limit integer not null default 0 check (free_module_limit between 0 and 50),
  status text not null default 'draft' check (status in ('draft','pilot','published','retired')),
  external_course_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.learning_programmes(id) on delete cascade,
  code text not null,
  title text not null,
  sequence_no integer not null check (sequence_no > 0),
  status text not null default 'planned' check (status in ('planned','pilot','published','retired')),
  unique (programme_id, code), unique (programme_id, sequence_no)
);

create table public.learning_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.learning_modules(id) on delete cascade,
  code text not null unique,
  title text not null,
  sequence_no integer not null check (sequence_no > 0),
  status text not null default 'planned' check (status in ('planned','pilot','published','retired')),
  unique (module_id, sequence_no)
);

create table public.young_learner_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  safeguarding_status text not null default 'pilot' check (safeguarding_status in ('pilot','guardian_pending','guardian_verified','suspended')),
  age_band text check (age_band in ('explorer','builder','creator')),
  profile_visibility text not null default 'private' check (profile_visibility = 'private'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.learning_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  programme_id uuid not null references public.learning_programmes(id) on delete cascade,
  status text not null default 'active' check (status in ('active','paused','completed','withdrawn')),
  enrolment_source text not null default 'analytics_lab_pilot',
  enrolled_at timestamptz not null default now(),
  unique (user_id, programme_id)
);

create table public.learning_access_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  programme_id uuid not null references public.learning_programmes(id) on delete cascade,
  access_level text not null check (access_level in ('full','guided','school')),
  starts_at timestamptz not null default now(), expires_at timestamptz, revoked_at timestamptz,
  source_reference text, created_at timestamptz not null default now()
);

create table public.learning_lesson_progress (
  enrollment_id uuid not null references public.learning_enrollments(id) on delete cascade,
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress','completed')),
  attempts integer not null default 0 check (attempts >= 0),
  started_at timestamptz not null default now(), completed_at timestamptz, updated_at timestamptz not null default now(),
  primary key (enrollment_id, lesson_id)
);

create table public.learning_code_attempts (
  id bigint generated always as identity primary key,
  enrollment_id uuid not null references public.learning_enrollments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  challenge_code text not null,
  code_text text not null check (char_length(code_text) between 1 and 5000),
  passed boolean not null,
  feedback text not null,
  error_category text,
  submitted_at timestamptz not null default now()
);

create table public.learning_projects (
  id bigint generated always as identity primary key,
  enrollment_id uuid not null references public.learning_enrollments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.learning_modules(id) on delete cascade,
  title text not null,
  code_text text not null check (char_length(code_text) between 1 and 10000),
  reflection text not null check (char_length(reflection) between 20 and 2000),
  status text not null default 'submitted' check (status in ('submitted','reviewed','revision_requested','accepted')),
  submitted_at timestamptz not null default now()
);

create table public.learning_competencies (
  id uuid primary key default gen_random_uuid(), programme_id uuid not null references public.learning_programmes(id) on delete cascade,
  code text not null, title text not null, unique (programme_id, code)
);
create table public.learning_competency_evidence (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  competency_id uuid not null references public.learning_competencies(id) on delete cascade,
  source_type text not null check (source_type in ('code_attempt','project','lesson')),
  source_id text not null, level text not null check (level in ('developing','demonstrated','strong')),
  recorded_at timestamptz not null default now(), unique (user_id, competency_id, source_type, source_id)
);

create table public.learning_badges (
  id uuid primary key default gen_random_uuid(), programme_id uuid not null references public.learning_programmes(id) on delete cascade,
  code text not null, title text not null, description text not null, required_lesson_code text not null,
  unique (programme_id, code)
);
create table public.learning_badge_awards (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.learning_badges(id) on delete cascade,
  evidence_attempt_id bigint not null references public.learning_code_attempts(id) on delete cascade,
  awarded_at timestamptz not null default now(), unique (user_id, badge_id)
);

insert into public.learning_programmes(code,title,owner_system,free_module_limit,status)
values ('PY-KIDS','Python for Kids: Code, Create & Solve','academy',3,'pilot');

with programme as (select id from public.learning_programmes where code='PY-KIDS'), module_data(code,title,sequence_no,status) as (values
('01','Welcome to Coding',1,'pilot'),('02','Talking to Python',2,'pilot'),('03','Variables and User Input',3,'pilot'),
('04','Making Decisions',4,'planned'),('05','Loops and Repetition',5,'planned'),('06','Lists and Collections',6,'planned'),
('07','Functions',7,'planned'),('08','Games and Creative Coding',8,'planned'),('09','Data for Young Analysts',9,'planned'),('10','My Python Project',10,'planned'))
insert into public.learning_modules(programme_id,code,title,sequence_no,status)
select programme.id,m.code,m.title,m.sequence_no,m.status from programme cross join module_data m;

with lesson_data(module_code,code,title,sequence_no,status) as (values
('01','1.1','What Is Coding?',1,'pilot'),('01','1.2','Meet Python',2,'pilot'),('01','1.3','My First Python Challenge',3,'pilot'),
('02','2.1','Printing Messages',1,'pilot'),('02','2.2','Numbers and Calculations',2,'pilot'),('02','2.3','Make Python Calculate',3,'pilot'),
('03','3.1','Variables as Storage Boxes',1,'pilot'),('03','3.2','Asking the User Questions',2,'pilot'),('03','3.3','Build an Interactive Program',3,'pilot'),
('04','4.1','Computers Can Make Choices',1,'planned'),('04','4.2','If, Else and Elif',2,'planned'),('04','4.3','Build a Decision Game',3,'planned'),
('05','5.1','Why Repeat Code?',1,'planned'),('05','5.2','For Loops',2,'planned'),('05','5.3','While Loops and Challenges',3,'planned'),
('06','6.1','Storing Many Things',1,'planned'),('06','6.2','Reading and Changing Lists',2,'planned'),('06','6.3','Build with Lists',3,'planned'),
('07','7.1','Reusable Code',1,'planned'),('07','7.2','Parameters and Results',2,'planned'),('07','7.3','Build a Function Toolkit',3,'planned'),
('08','8.1','Planning a Game',1,'planned'),('08','8.2','Building the Game',2,'planned'),('08','8.3','Improve Your Game',3,'planned'),
('09','9.1','What Is Data?',1,'planned'),('09','9.2','Finding Meaning in Numbers',2,'planned'),('09','9.3','Tell a Story with Data',3,'planned'),
('10','10.1','Choose and Plan',1,'planned'),('10','10.2','Build, Test and Debug',2,'planned'),('10','10.3','Present and Explain',3,'planned'))
insert into public.learning_lessons(module_id,code,title,sequence_no,status)
select module.id,l.code,l.title,l.sequence_no,l.status from lesson_data l join public.learning_modules module on module.code=l.module_code join public.learning_programmes programme on programme.id=module.programme_id and programme.code='PY-KIDS';

with programme as (select id from public.learning_programmes where code='PY-KIDS')
insert into public.learning_competencies(programme_id,code,title)
select programme.id,c.code,c.title from programme cross join (values
('algorithmic-thinking','Algorithmic thinking'),('python-foundations','Python foundations'),('coding-accuracy','Coding accuracy'),
('debugging','Debugging'),('problem-solving','Problem solving'),('creative-projects','Creative project building')) as c(code,title);

with programme as (select id from public.learning_programmes where code='PY-KIDS')
insert into public.learning_badges(programme_id,code,title,description,required_lesson_code)
select programme.id,b.code,b.title,b.description,b.lesson from programme cross join (values
('first-program','First Program','Completed a first working Python challenge.','1.3'),
('calculation-builder','Calculation Builder','Used Python to solve a calculation challenge.','2.3'),
('input-explorer','Input Explorer','Built an interactive program using input and variables.','3.3')) as b(code,title,description,lesson);

create index learning_enrollments_user_idx on public.learning_enrollments(user_id,status);
create index learning_progress_enrollment_idx on public.learning_lesson_progress(enrollment_id,updated_at desc);
create index learning_attempts_user_idx on public.learning_code_attempts(user_id,submitted_at desc);
create index learning_evidence_user_idx on public.learning_competency_evidence(user_id,recorded_at desc);
create index learning_grants_user_idx on public.learning_access_grants(user_id,programme_id) where revoked_at is null;

alter table public.learning_programmes enable row level security; alter table public.learning_modules enable row level security;
alter table public.learning_lessons enable row level security; alter table public.young_learner_profiles enable row level security;
alter table public.learning_enrollments enable row level security; alter table public.learning_access_grants enable row level security;
alter table public.learning_lesson_progress enable row level security; alter table public.learning_code_attempts enable row level security;
alter table public.learning_projects enable row level security; alter table public.learning_competencies enable row level security;
alter table public.learning_competency_evidence enable row level security;
alter table public.learning_badges enable row level security; alter table public.learning_badge_awards enable row level security;

create policy learning_catalogue_read on public.learning_programmes for select to anon,authenticated using (status in ('pilot','published'));
create policy learning_modules_read on public.learning_modules for select to anon,authenticated using (status in ('pilot','published','planned'));
create policy learning_lessons_read on public.learning_lessons for select to anon,authenticated using (status in ('pilot','published','planned'));
create policy learning_competencies_read on public.learning_competencies for select to authenticated using (true);
create policy learning_badges_read on public.learning_badges for select to anon,authenticated using (true);
create policy badge_awards_own_read on public.learning_badge_awards for select to authenticated using (user_id=(select auth.uid()));
create policy young_profile_own_read on public.young_learner_profiles for select to authenticated using (user_id=(select auth.uid()));
create policy enrollment_own_read on public.learning_enrollments for select to authenticated using (user_id=(select auth.uid()));
create policy grants_own_read on public.learning_access_grants for select to authenticated using (user_id=(select auth.uid()));
create policy progress_own_read on public.learning_lesson_progress for select to authenticated using (exists(select 1 from public.learning_enrollments e where e.id=enrollment_id and e.user_id=(select auth.uid())));
create policy attempts_own_read on public.learning_code_attempts for select to authenticated using (user_id=(select auth.uid()));
create policy projects_own_read on public.learning_projects for select to authenticated using (user_id=(select auth.uid()));
create policy evidence_own_read on public.learning_competency_evidence for select to authenticated using (user_id=(select auth.uid()));

grant select on public.learning_programmes,public.learning_modules,public.learning_lessons to anon,authenticated;
grant select on public.young_learner_profiles,public.learning_enrollments,public.learning_access_grants,public.learning_lesson_progress,public.learning_code_attempts,public.learning_projects,public.learning_competencies,public.learning_competency_evidence to authenticated;
grant select on public.learning_badges to anon,authenticated;
grant select on public.learning_badge_awards to authenticated;
revoke insert,update,delete on public.young_learner_profiles,public.learning_enrollments,public.learning_access_grants,public.learning_lesson_progress,public.learning_code_attempts,public.learning_projects,public.learning_competency_evidence from anon,authenticated;
revoke insert,update,delete on public.learning_badge_awards from anon,authenticated;

create or replace function public.start_python_kids_pilot()
returns uuid language plpgsql security definer set search_path='' as $$
declare v_user uuid:=(select auth.uid()); v_programme uuid; v_enrollment uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  select id into v_programme from public.learning_programmes where code='PY-KIDS' and status in ('pilot','published');
  if v_programme is null then raise exception 'Programme unavailable'; end if;
  insert into public.young_learner_profiles(user_id,safeguarding_status) values(v_user,'pilot') on conflict(user_id) do nothing;
  insert into public.learning_enrollments(user_id,programme_id) values(v_user,v_programme)
  on conflict(user_id,programme_id) do update set status='active' returning id into v_enrollment;
  return v_enrollment;
end $$;

create or replace function public.record_python_kids_attempt(p_lesson_code text,p_challenge_code text,p_code text,p_passed boolean,p_feedback text,p_error_category text default null)
returns bigint language plpgsql security definer set search_path='' as $$
declare v_user uuid:=(select auth.uid()); v_lesson uuid; v_module_seq integer; v_enrollment uuid; v_attempt bigint; v_competency uuid; v_badge uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if char_length(p_code) not between 1 and 5000 or char_length(trim(p_feedback)) not between 2 and 1000 then raise exception 'Invalid attempt evidence'; end if;
  select lesson.id,module.sequence_no into v_lesson,v_module_seq from public.learning_lessons lesson join public.learning_modules module on module.id=lesson.module_id join public.learning_programmes programme on programme.id=module.programme_id where programme.code='PY-KIDS' and lesson.code=p_lesson_code and lesson.status in ('pilot','published');
  select enrollment.id into v_enrollment from public.learning_enrollments enrollment join public.learning_programmes programme on programme.id=enrollment.programme_id where enrollment.user_id=v_user and enrollment.status='active' and programme.code='PY-KIDS';
  if v_lesson is null or v_enrollment is null then raise exception 'Active Python for Kids pilot enrolment required'; end if;
  if v_module_seq>3 and not exists(select 1 from public.learning_access_grants grant_row join public.learning_programmes programme on programme.id=grant_row.programme_id where grant_row.user_id=v_user and programme.code='PY-KIDS' and grant_row.revoked_at is null and grant_row.starts_at<=now() and (grant_row.expires_at is null or grant_row.expires_at>now())) then raise exception 'Full programme access required'; end if;
  insert into public.learning_code_attempts(enrollment_id,user_id,lesson_id,challenge_code,code_text,passed,feedback,error_category) values(v_enrollment,v_user,v_lesson,p_challenge_code,p_code,p_passed,trim(p_feedback),p_error_category) returning id into v_attempt;
  insert into public.learning_lesson_progress(enrollment_id,lesson_id,status,attempts,completed_at,updated_at) values(v_enrollment,v_lesson,case when p_passed then 'completed' else 'in_progress' end,1,case when p_passed then now() end,now()) on conflict(enrollment_id,lesson_id) do update set status=case when excluded.status='completed' then 'completed' else public.learning_lesson_progress.status end,attempts=public.learning_lesson_progress.attempts+1,completed_at=coalesce(public.learning_lesson_progress.completed_at,excluded.completed_at),updated_at=now();
  if p_passed then
    select competency.id into v_competency from public.learning_competencies competency join public.learning_programmes programme on programme.id=competency.programme_id where programme.code='PY-KIDS' and competency.code=case when p_lesson_code='1.1' then 'algorithmic-thinking' when p_lesson_code in ('1.2','2.1','2.2','3.1','3.2') then 'python-foundations' when p_lesson_code in ('1.3','2.3','3.3') then 'creative-projects' else 'coding-accuracy' end;
    insert into public.learning_competency_evidence(user_id,competency_id,source_type,source_id,level) values(v_user,v_competency,'code_attempt',v_attempt::text,'demonstrated') on conflict do nothing;
    select badge.id into v_badge from public.learning_badges badge where badge.programme_id=(select id from public.learning_programmes where code='PY-KIDS') and badge.required_lesson_code=p_lesson_code;
    if v_badge is not null then
      insert into public.learning_badge_awards(user_id,badge_id,evidence_attempt_id) values(v_user,v_badge,v_attempt) on conflict(user_id,badge_id) do nothing;
    end if;
  end if;
  return v_attempt;
end $$;

revoke all on function public.start_python_kids_pilot() from public,anon;
revoke all on function public.record_python_kids_attempt(text,text,text,boolean,text,text) from public,anon;
grant execute on function public.start_python_kids_pilot() to authenticated;
grant execute on function public.record_python_kids_attempt(text,text,text,boolean,text,text) to authenticated;

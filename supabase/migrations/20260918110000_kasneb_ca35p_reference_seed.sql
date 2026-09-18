-- MVP reference programme: KASNEB CA35P — Business Data Analytics (Practical Paper)
-- CA35P is the canonical current identifier selected for the platform.
-- CA36P is retained as a source alias because the supplied qualifications booklet
-- displays that identifier on page 5. No syllabus topics are inferred from the booklet.

insert into public.exam_bodies(code, name, country_code, website_url, active)
values (
  'KASNEB',
  'Kenya Accountants and Secretaries National Examinations Board',
  'KE',
  'https://www.kasneb.or.ke/',
  true
)
on conflict (code) do update set
  name = excluded.name,
  country_code = excluded.country_code,
  website_url = excluded.website_url,
  active = true;

insert into public.exam_programmes(
  exam_body_id,
  code,
  title,
  description,
  free_topic_limit,
  status,
  metadata
)
select
  b.id,
  'CA35P',
  'Business Data Analytics (Practical Paper)',
  'KASNEB practical paper administered primarily on a computer-based platform.',
  3,
  'draft',
  jsonb_build_object(
    'canonical_code_basis', 'KASNEB CBE current course listing',
    'source_aliases', jsonb_build_array('CA36P'),
    'source_alias_note', 'The supplied KASNEB Qualifications Booklet displays CA36P on page 5.',
    'delivery_mode', 'computer_based',
    'qualification', 'Certified Public Accountants (CPA)',
    'level', 'Post-Advanced / practical paper',
    'source_document', jsonb_build_object(
      'title', 'QUALIFICATIONS BOOKLET',
      'page', 5,
      'modified_at', '2026-04-20T15:05:36+02:00',
      'sha256', 'cb8188233831a13b5d9c5c2492e312f354eead094ef02b73da8b5909b5e8b215'
    )
  )
from public.exam_bodies b
where b.code = 'KASNEB'
on conflict (exam_body_id, code) do update set
  title = excluded.title,
  description = excluded.description,
  free_topic_limit = excluded.free_topic_limit,
  metadata = excluded.metadata,
  updated_at = now();

-- Create a draft source record only. It must not be published until the official
-- detailed syllabus (topics, outcomes and effective dates) is acquired and checksummed.
insert into public.exam_syllabus_versions(
  programme_id,
  version_label,
  source_url,
  source_checksum,
  status
)
select
  p.id,
  'reference-booklet-2026-04-20',
  'https://cbe.kasneb.or.ke/',
  'sha256:cb8188233831a13b5d9c5c2492e312f354eead094ef02b73da8b5909b5e8b215',
  'draft'
from public.exam_programmes p
join public.exam_bodies b on b.id = p.exam_body_id
where b.code = 'KASNEB' and p.code = 'CA35P'
on conflict (programme_id, version_label) do update set
  source_url = excluded.source_url,
  source_checksum = excluded.source_checksum;

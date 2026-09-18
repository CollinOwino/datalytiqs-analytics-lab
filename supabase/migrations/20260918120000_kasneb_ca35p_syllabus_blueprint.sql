-- KASNEB CA35P provisional syllabus hierarchy and evidence-based exam blueprint.
-- Syllabus source SHA-256: adf9be0931e03c2dd66aa461971b00a6a6b57c4d1010694f3c4e41fd89f9aa43
-- Past-paper compilation SHA-256: 72dd07189e4b2f00cbb28c39a61bba4d8540ff5370f66481be75d117b301d3d6
-- Past questions are not copied. Only aggregate structure observed in 2024-2026 papers is retained.

insert into public.exam_syllabus_versions(
  programme_id, version_label, effective_from, source_checksum, status
)
select p.id, 'provisional-2022', '2022-05-30',
  'sha256:adf9be0931e03c2dd66aa461971b00a6a6b57c4d1010694f3c4e41fd89f9aa43', 'draft'
from public.exam_programmes p
join public.exam_bodies b on b.id=p.exam_body_id
where b.code='KASNEB' and p.code='CA35P'
on conflict(programme_id,version_label) do update set
  effective_from=excluded.effective_from, source_checksum=excluded.source_checksum;

with target as (
  select sv.id from public.exam_syllabus_versions sv
  join public.exam_programmes p on p.id=sv.programme_id
  join public.exam_bodies b on b.id=p.exam_body_id
  where b.code='KASNEB' and p.code='CA35P' and sv.version_label='provisional-2022'
), topic_data(code,title,description,sequence_no,learning_outcomes) as (values
  ('1.0','Introduction to Excel','Efficient and controlled spreadsheet use for analysis and financial modelling.',1,
    '["Use keyboard shortcuts efficiently","Analyse data with tables, pivot tables and common functions","Use advanced formulas and functions in financial models"]'::jsonb),
  ('2.0','Introduction to Data Analytics','Analytics foundations, data lifecycle, big data, tools and visual communication.',2,
    '["Apply the CRISP framework","Explain data models and lifecycle stages","Distinguish descriptive, predictive and prescriptive analytics","Select appropriate analytics and visualisation tools"]'::jsonb),
  ('3.0','Core Application of Data Analytics','Financial reporting and financial-management analytics.',3,
    '["Prepare and analyse financial statements","Forecast under stated assumptions","Perform sensitivity and scenario analysis","Evaluate investments and communicate results through dashboards"]'::jsonb),
  ('4.0','Application of Data Analytics in Specialised Areas','Applied analytics for management accounting, auditing, taxation and public financial management.',4,
    '["Model costs, prices, margins, budgets and variances","Apply audit analytics and sampling","Compute tax and analyse public-sector financial information"]'::jsonb),
  ('5.0','Emerging Issues in Data Analytics','Ethics, data protection, analytical limitations and adoption challenges.',5,
    '["Evaluate ethical and security risks","Recognise scepticism and implementation challenges","Assess performance limitations of analytical tools"]'::jsonb)
)
insert into public.exam_topics(syllabus_version_id,code,title,description,sequence_no,learning_outcomes)
select target.id,d.code,d.title,d.description,d.sequence_no,d.learning_outcomes from target cross join topic_data d
on conflict(syllabus_version_id,code) do update set
  title=excluded.title,description=excluded.description,sequence_no=excluded.sequence_no,
  learning_outcomes=excluded.learning_outcomes,active=true;

with programme as (
  select p.id from public.exam_programmes p join public.exam_bodies b on b.id=p.exam_body_id
  where b.code='KASNEB' and p.code='CA35P'
), competency_data(code,title,description,domain) as (values
  ('BDA-FND','Analytics foundations','Apply CRISP, data models, lifecycle concepts, big-data principles, visualisation and emerging-issue analysis.','analytics_foundations'),
  ('BDA-FAR','Financial reporting analytics','Prepare, analyse, forecast and visualise company and group financial statements.','financial_reporting'),
  ('BDA-FM','Financial management analytics','Model time value, loan amortisation, capital projects, scenarios and dashboards.','financial_management'),
  ('BDA-MA','Management accounting analytics','Estimate costs and margins; perform break-even, budget, variance and flexible-budget analysis.','management_accounting'),
  ('BDA-AUD','Audit analytics','Analyse trends, three-way matching, fraud indicators, segregation of duties, samples and model validity.','auditing'),
  ('BDA-TAX-PFM','Tax and public-finance analytics','Compute tax and wear-and-tear schedules; analyse public financial statements, budgets, debt and revenue.','tax_public_finance')
)
insert into public.exam_competencies(programme_id,code,title,description,domain)
select programme.id,c.code,c.title,c.description,c.domain from programme cross join competency_data c
on conflict(programme_id,code) do update set
  title=excluded.title,description=excluded.description,domain=excluded.domain,active=true;

with target as (
  select t.id,t.code from public.exam_topics t
  join public.exam_syllabus_versions sv on sv.id=t.syllabus_version_id
  join public.exam_programmes p on p.id=sv.programme_id
  join public.exam_bodies b on b.id=p.exam_body_id
  where b.code='KASNEB' and p.code='CA35P' and sv.version_label='provisional-2022'
), subtopic_data(topic_code,code,title,description,sequence_no,learning_outcomes) as (values
  ('1.0','1.1','Excel productivity and navigation','Keyboard shortcuts and efficient workbook navigation.',1,'["Use shortcuts to accelerate controlled spreadsheet work"]'::jsonb),
  ('1.0','1.2','Excel analytical structures','Data tables, pivot tables and commonly used analytical functions.',2,'["Construct data tables and pivot summaries","Choose appropriate common functions"]'::jsonb),
  ('1.0','1.3','Advanced formulas and financial models','Advanced formulas and functions supporting robust financial models.',3,'["Build auditable formula-driven financial models"]'::jsonb),
  ('2.0','2.1','CRISP framework and data lifecycle','Conceptual, logical and physical models; sourcing, requirements, acquisition, recording, decision use and removal.',1,'["Apply CRISP to an analytics engagement","Distinguish data-model layers","Govern the data lifecycle"]'::jsonb),
  ('2.0','2.2','Big data and analytics types','Big-data definition, the five Vs and descriptive, predictive and prescriptive analytics.',2,'["Characterise big data","Select an analytics type for a decision"]'::jsonb),
  ('2.0','2.3','Analytics technology landscape','Cleaning, storage, database, cloud, reporting and visualisation tools.',3,'["Select tools appropriate to the analytics workflow"]'::jsonb),
  ('2.0','2.4','Data visualisation in Excel','Benefits, comparison, composition and relationship charts, and quality principles.',4,'["Design accurate and decision-relevant visualisations"]'::jsonb),
  ('3.0','3.1','Financial accounting and reporting analytics','Statements, ratios, common-size and trend analysis, forecasts, scenarios and dashboards.',1,'["Prepare and analyse financial statements","Build forecast statements","Communicate financial performance visually"]'::jsonb),
  ('3.0','3.2','Financial management analytics','Cash flows, time value, amortisation, NPV, IRR, sensitivity, scenarios and dashboards.',2,'["Model financing cash flows","Evaluate projects","Test assumptions and present results"]'::jsonb),
  ('4.0','4.1','Management accounting analytics','Cost estimation, pricing, margins, break-even, budgets, variances, scenarios and flexible budgets.',1,'["Estimate cost behaviour","Model profitability and break-even","Prepare and flex budgets"]'::jsonb),
  ('4.0','4.2','Audit analytics','Trend analysis, three-way matching, fraud detection, controls testing, sampling and model validation.',2,'["Apply audit tests to large datasets","Identify control conflicts and anomalies","Evaluate model validity"]'::jsonb),
  ('4.0','4.3','Taxation and public-finance analytics','Tax computations, wear-and-tear schedules, public statements, budgets, debt, revenue and reporting.',3,'["Build tax schedules","Analyse public financial performance","Visualise debt and revenue"]'::jsonb),
  ('5.0','5.1','Adoption challenges and scepticism','Constraints affecting confidence in and adoption of analytics.',1,'["Evaluate analytics adoption barriers"]'::jsonb),
  ('5.0','5.2','Ethics, security and data protection','Ethical use, security safeguards and data-protection responsibilities.',2,'["Identify ethical risks","Apply security and data-protection principles"]'::jsonb),
  ('5.0','5.3','Analytical tool limitations','Performance and operational limitations within analytics tools.',3,'["Recognise tool constraints and select proportionate controls"]'::jsonb)
)
insert into public.exam_subtopics(topic_id,code,title,description,sequence_no,learning_outcomes)
select t.id,s.code,s.title,s.description,s.sequence_no,s.learning_outcomes
from subtopic_data s join target t on t.code=s.topic_code
on conflict(topic_id,code) do update set
  title=excluded.title,description=excluded.description,sequence_no=excluded.sequence_no,
  learning_outcomes=excluded.learning_outcomes,active=true;

with target_topics as (
  select t.id,t.code,p.id programme_id from public.exam_topics t
  join public.exam_syllabus_versions sv on sv.id=t.syllabus_version_id
  join public.exam_programmes p on p.id=sv.programme_id
  join public.exam_bodies b on b.id=p.exam_body_id
  where b.code='KASNEB' and p.code='CA35P' and sv.version_label='provisional-2022'
), mapping(topic_code,competency_code,weight) as (values
  ('1.0','BDA-FND',1.00::numeric),('2.0','BDA-FND',1.00::numeric),
  ('3.0','BDA-FAR',1.00::numeric),('3.0','BDA-FM',1.00::numeric),
  ('4.0','BDA-MA',1.00::numeric),('4.0','BDA-AUD',1.00::numeric),('4.0','BDA-TAX-PFM',1.00::numeric),
  ('5.0','BDA-FND',0.50::numeric)
)
insert into public.exam_topic_competencies(topic_id,competency_id,weight)
select t.id,c.id,m.weight from mapping m
join target_topics t on t.code=m.topic_code
join public.exam_competencies c on c.programme_id=t.programme_id and c.code=m.competency_code
on conflict(topic_id,competency_id) do update set weight=excluded.weight;

insert into public.exam_assessments(
  programme_id,syllabus_version_id,title,assessment_type,time_limit_minutes,pass_mark,max_attempts,status,metadata
)
select p.id,sv.id,'CA35P Full Mock - Current Observed Structure','mock',180,50,null,'draft',
  jsonb_build_object(
    'blueprint_basis','aggregate review of supplied 2024-2026 papers',
    'source_checksum','sha256:72dd07189e4b2f00cbb28c39a61bba4d8540ff5370f66481be75d117b301d3d6',
    'total_marks',100,
    'sections',jsonb_build_array(
      jsonb_build_object('code','I','format','single_choice','questions',20,'marks_each',1,'required',20),
      jsonb_build_object('code','II','format','practical','questions',3,'marks_each',20,'required',3),
      jsonb_build_object('code','III','format','specialisation_practical','questions',2,'marks_each',20,'required',1)
    ),
    'delivery','controlled computer-based environment using spreadsheet workbooks',
    'content_policy','Original DatalytIQs questions only; historical paper text is not reproduced.'
  )
from public.exam_programmes p
join public.exam_bodies b on b.id=p.exam_body_id
join public.exam_syllabus_versions sv on sv.programme_id=p.id and sv.version_label='provisional-2022'
where b.code='KASNEB' and p.code='CA35P'
and not exists(select 1 from public.exam_assessments a where a.programme_id=p.id and a.title='CA35P Full Mock - Current Observed Structure');

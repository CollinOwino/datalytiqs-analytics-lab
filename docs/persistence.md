# DatalytIQs Learner Persistence v1

## Objective
Persist the learner's analytical work independently of the UI and independently of the eventual database vendor.

`Browser -> /api/projects -> PersistenceStore -> database adapter`

The domain record is `LearnerProject`: learner + case + code + active dataset + six stage states + completed tasks + analytical interpretations + timestamps + optimistic version.

## API
- `GET /api/projects` — learner's projects
- `POST /api/projects` — create project
- `GET /api/projects/:id` — resume project
- `PATCH /api/projects/:id` — autosave code/progress/interpretation

`expectedVersion` enables optimistic concurrency. A stale write receives HTTP 409 instead of silently overwriting newer work.

## Provider boundary
Production databases implement `PersistenceStore`: `getProject`, `listProjects`, `createProject`, `updateProject`. The current `memory` adapter is development-only and is lost on process restart. A PostgreSQL/Supabase adapter is the recommended production step.

## Production data model
Recommended normalized tables:
1. `learner_projects` — project identity, learner_id, case_id, title, active_dataset, current code snapshot, version, timestamps.
2. `stage_progress` — project_id, stage_id, status, completed_tasks, interpretation, timestamps.
3. `project_revisions` — immutable snapshots/diffs for recovery and instructor audit.
4. `execution_records` — execution_id, project_id, code revision, provider, status, metrics, timestamps; large chart/table artifacts should live in object storage.

## Security and integrity
Learner identity must come from authenticated server session/token, never a browser-supplied learner ID in production. Every project query must be tenant/learner scoped. Use database row-level security where available. Encrypt transport and backups. Apply size limits to code and interpretations. Do not persist provider secrets or arbitrary execution filesystem contents in project records.

## Autosave policy
Recommended UI behavior: debounce code/interpretation saves by 1–2 seconds, immediately save explicit stage/task transitions, display `Saving… / Saved / Conflict / Offline`, retain an unsaved local draft if the network fails, and create periodic immutable revisions rather than a revision on every keystroke.

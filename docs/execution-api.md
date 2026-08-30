# DatalytIQs Execution API Contract v1

## Purpose
The learner application must never depend directly on E2B, Modal, Fly Machines, Kubernetes, Docker, a VPS runner, or another sandbox vendor. It talks only to the DatalytIQs Execution API. Provider-specific code lives behind `ExecutionProvider` adapters.

## Boundary
`Browser -> DatalytIQs /api/executions -> ExecutionProvider -> sandbox provider`

The application owns authentication, case/learner authorization, request validation, policy limits, normalized outputs and audit identifiers. The provider owns isolated process/container creation, runtime execution, resource enforcement and termination.

## POST /api/executions
Submits one Python execution. Returns HTTP 202.

Request shape:
```json
{
  "requestId":"uuid",
  "caseId":"001",
  "language":"python",
  "runtime":"3.12",
  "code":"print(df.head())",
  "datasets":[{"datasetId":"case-001","name":"Case_001_Dataset.xlsx"}],
  "packages":["pandas","matplotlib"],
  "limits":{"timeoutMs":30000,"memoryMb":512,"cpuSeconds":20,"maxOutputBytes":2000000,"network":"disabled"}
}
```
Response:
```json
{"executionId":"exec_...","requestId":"uuid","status":"queued"}
```

## GET /api/executions/:id
Returns the normalized execution state and ordered outputs. Terminal states: `succeeded`, `failed`, `timed_out`, `cancelled`.

Outputs are typed as `stdout`, `stderr`, `table`, `chart`, `display`, or `error`. Tables use `{columns, rows}`. Charts use PNG/SVG data or URL, or a Vega-Lite spec. This prevents vendor response formats leaking into the UI.

## DELETE /api/executions/:id
Requests cancellation and returns HTTP 204.

## GET /api/executions
Health/readiness endpoint for the selected provider.

## Mandatory production invariants
- Untrusted learner code never executes in the Next.js application process.
- Network access defaults to disabled.
- Runtime has hard wall-time, CPU, memory, process and output limits.
- Each execution receives an ephemeral isolated filesystem/runtime.
- No host credentials, application secrets, Docker socket or cloud metadata credentials are exposed to learner code.
- Dataset access is scoped to the authorized execution; prefer short-lived signed URLs or server-side transfer over permanent public URLs.
- Package installation is allowlisted/prebuilt in production rather than unrestricted `pip install` from learner code.
- Provider adapters normalize all results to the v1 types.
- Execution IDs, learner/case IDs, timestamps, provider and resource metrics should be audit logged server-side.
- Authentication, authorization and rate limits must be enforced before provider invocation.

## Provider adapter rule
A new provider implements four operations only:
```ts
execute(request)
getResult(executionId)
cancel(executionId)
health()
```
Then add it to `lib/execution/provider.ts` and select it with `EXECUTION_PROVIDER`. No Python Editor component changes should be necessary.

## Current state
`mock` is the only adapter and is intentionally non-executing. It validates the contract and integration flow safely while infrastructure is selected. A real provider adapter is the next infrastructure milestone.

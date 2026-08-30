# Secure Computation Engine — DatalytIQs Analytics Lab

## Architecture

The Analytics Lab web application must not execute learner code itself. It communicates with a separate sandbox gateway through the existing `ExecutionProvider` boundary.

```text
Browser
  -> DatalytIQs /api/executions
  -> RemoteExecutionProvider
  -> Sandbox Gateway
  -> Modal / E2B / hardened container runtime
  -> normalized stdout/stderr/table/chart result
```

## Why separate infrastructure

Learner code is untrusted input. The computation engine must therefore be isolated from DatalytIQs Academy, HumHub, application secrets, databases and the production filesystem. The sandbox provider may change without changing the learner UI or the DatalytIQs Execution API.

## Mandatory sandbox policy

Every execution should use:
- a fresh or strongly isolated runtime;
- hard wall-clock timeout;
- CPU and memory limits;
- process and filesystem quotas;
- bounded stdout/stderr and artifact sizes;
- outbound network disabled by default;
- no access to application/cloud secrets;
- no host filesystem, container socket or metadata service credentials;
- explicit runtime/package allowlist;
- automatic cleanup after completion;
- per-learner rate and concurrency limits;
- audit metadata linking execution -> learner -> project -> case -> code revision.

## Recommended MVP limits

These are starting policy values, not guarantees of provider support:

| Resource | Initial policy |
|---|---:|
| Wall time | 30 seconds |
| CPU time | 20 seconds |
| Memory | 512 MB |
| Output | 2 MB |
| Concurrent jobs / learner | 1 |
| Network | Disabled |
| Persistent filesystem | None |

Raise limits only for validated analytical use cases.

## Provider evaluation

### Modal
Good fit for short-lived and interactive isolated execution. Prefer single-use containers/sandboxes, explicit timeout and blocked outbound network for untrusted learner code. Modal-specific credentials and APIs must remain inside the sandbox gateway, never the browser.

### E2B
Good fit for interactive coding sessions and longer-lived learner environments. The gateway should still enforce DatalytIQs policy independently of provider defaults.

### Cloud/container infrastructure
A self-managed option provides maximum control but creates significantly more security and operations responsibility. Container isolation alone should not be treated as sufficient for adversarial multi-user code execution; use a hardened sandbox/runtime boundary and avoid placing the runner on the HumHub/cPanel host.

## Remote gateway protocol

The DatalytIQs application now expects the sandbox gateway to implement:

- `POST /v1/executions`
- `GET /v1/executions/{id}`
- `DELETE /v1/executions/{id}`
- `GET /v1/health`

The request and result shapes are the same normalized types defined in `lib/execution/types.ts`.

## Authentication

`SANDBOX_API_TOKEN` is server-side only. The browser never receives it. Production should prefer short-lived service identity/JWT or mTLS where infrastructure supports it, plus IP/network restrictions where practical.

## Dataset transfer

Do not make learner datasets permanently public. Preferred approaches:
1. application uploads dataset to private object storage;
2. gateway receives a short-lived signed read URL or server-side streamed copy;
3. sandbox receives only the files authorized for that execution;
4. generated artifacts are returned through controlled storage or the API;
5. temporary sandbox files are destroyed at termination.

## Current implementation state

- `mock` provider: development contract validation only.
- `remote` provider: production-facing adapter implemented.
- provider selection: environment variable `EXECUTION_PROVIDER`.
- actual Modal/E2B/container gateway deployment: intentionally deferred until provider/infrastructure selection and credentials are available.

This separation is deliberate: the secure computation engine can be deployed or replaced independently of the DatalytIQs web application.

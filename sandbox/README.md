# DatalytIQs Modal Sandbox Runner

This service implements the existing Analytics Lab remote execution contract:

- `GET /v1/health`
- `POST /v1/executions`
- `GET /v1/executions/{executionId}`
- `DELETE /v1/executions/{executionId}`

## Security boundary

Learner Python executes only inside a disposable `modal.Sandbox` with:

- outbound networking blocked;
- no API credentials injected into the learner sandbox;
- hard memory limit;
- CPU throttling/hard limit;
- bounded lifetime and idle timeout;
- bounded captured stdout/stderr;
- isolated Python mode (`python -I`).

The public HTTP worker holds only the bearer token used between Vercel and Modal.

## Deploy

From the repository root, after Modal CLI authentication:

```powershell
modal secret create datalytiqs-runner-auth SANDBOX_API_TOKEN="<generate-a-long-random-value>"
modal deploy sandbox/modal_runner.py
```

Modal prints the HTTPS Web Function URL after deployment. Configure Vercel server-side variables:

```text
EXECUTION_PROVIDER=remote
SANDBOX_API_URL=<Modal web URL without trailing slash>
SANDBOX_API_TOKEN=<same random value stored in Modal>
```

Never expose `SANDBOX_API_TOKEN` through a `NEXT_PUBLIC_` variable.

## Current MVP limitation

The runner currently executes source and returns bounded stdout/stderr. Dataset materialisation plus rich table/chart extraction is the next hardening increment after the live endpoint handshake is verified.

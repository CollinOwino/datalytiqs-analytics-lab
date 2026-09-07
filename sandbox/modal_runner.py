import base64
import json
import os
import secrets
import time
import uuid
from typing import Any

import modal

app = modal.App("datalytiqs-sandbox-runner")

runner_image = (
    modal.Image.debian_slim(python_version="3.12")
    .pip_install(
        "pandas",
        "numpy",
        "scipy",
        "statsmodels",
        "matplotlib",
        "openpyxl",
        "fastapi"
    )
)

with runner_image.imports():
    from fastapi import FastAPI, Header, HTTPException

api = FastAPI(title="DatalytIQs Sandbox Runner", version="1.0")
# MVP result store. This intentionally stores only bounded structured results, never learner secrets.
results = modal.Dict.from_name("datalytiqs-execution-results", create_if_missing=True)

MAX_CODE_CHARS = 100_000
MAX_DATASET_BYTES = 8_000_000
DEFAULT_TIMEOUT_S = 30
MAX_TIMEOUT_S = 60
DEFAULT_MEMORY_MB = 512
MAX_MEMORY_MB = 1024


def _auth(authorization: str | None) -> None:
    expected = os.environ.get("SANDBOX_API_TOKEN")
    if not expected:
        raise HTTPException(503, "Runner token is not configured")
    supplied = authorization.removeprefix("Bearer ").strip() if authorization else ""
    if not secrets.compare_digest(supplied, expected):
        raise HTTPException(401, "Unauthorized")


def _limits(body: dict[str, Any]) -> tuple[int, int, int]:
    limits = body.get("limits") or {}
    timeout_s = max(1, min(int(limits.get("timeoutMs", 30_000)) // 1000, MAX_TIMEOUT_S))
    memory_mb = max(128, min(int(limits.get("memoryMb", DEFAULT_MEMORY_MB)), MAX_MEMORY_MB))
    max_output = max(1024, min(int(limits.get("maxOutputBytes", 2_000_000)), 5_000_000))
    return timeout_s, memory_mb, max_output


@app.function(image=runner_image, timeout=75, secrets=[modal.Secret.from_name("datalytiqs-runner-auth")])
def execute_job(execution_id: str, request: dict[str, Any]) -> None:
    started = time.time()
    timeout_s, memory_mb, max_output = _limits(request)
    result: dict[str, Any] = {
        "executionId": execution_id,
        "requestId": request.get("requestId", execution_id),
        "status": "running",
        "startedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(started)),
        "outputs": [],
    }
    results[execution_id] = result

    code = request.get("code", "")
    if not isinstance(code, str) or not code.strip() or len(code) > MAX_CODE_CHARS:
        result.update(status="failed", error={"code": "INVALID_CODE", "message": "Invalid Python source.", "retryable": False})
        results[execution_id] = result
        return

    datasets = request.get("datasets") or []
    if any(len((d.get("contentBase64") or "")) > MAX_DATASET_BYTES * 2 for d in datasets):
        result.update(status="failed", error={"code": "DATASET_TOO_LARGE", "message": "Dataset exceeds runner limit.", "retryable": False})
        results[execution_id] = result
        return
    # Bootstrap the first supplied dataset into the learner namespace as `df`.
    bootstrap = ""

    if datasets:
        dataset = datasets[0]
        content_b64 = dataset.get("contentBase64") or ""
        dataset_name = dataset.get("name") or "dataset.xlsx"

        if content_b64:
            try:
                dataset_bytes = base64.b64decode(content_b64, validate=True)

                if len(dataset_bytes) > MAX_DATASET_BYTES:
                    result.update(
                        status="failed",
                        error={
                            "code": "DATASET_TOO_LARGE",
                            "message": "Decoded dataset exceeds runner limit.",
                            "retryable": False,
                        },
                    )
                    results[execution_id] = result
                    return

                encoded = base64.b64encode(dataset_bytes).decode("ascii")

                bootstrap = f"""
import base64 as _base64
import io as _io
import pandas as pd

_dataset_bytes = _base64.b64decode({encoded!r})
df = pd.read_excel(_io.BytesIO(_dataset_bytes))
"""

            except Exception as exc:
                result.update(
                    status="failed",
                    error={
                        "code": "INVALID_DATASET",
                        "message": f"Unable to prepare dataset: {{exc}}",
                        "retryable": False,
                    },
                )
                results[execution_id] = result
                return

    execution_code = bootstrap + "\n" + code

    # The sandbox has no secrets and no network. Only the worker has the API bearer secret.
    sb = modal.Sandbox.create(
        "python", "-I", "-c", execution_code,
        app=app,
        image=runner_image,
        timeout=timeout_s,
        idle_timeout=min(timeout_s, 30),
        cpu=(0.25, 1.0),
        memory=(128, memory_mb),
        block_network=True,
        env={"MPLBACKEND": "Agg", "PYTHONUNBUFFERED": "1"},
    )
    try:
        sb.wait(); exit_code = sb.returncode
        stdout = sb.stdout.read()[:max_output]
        stderr = sb.stderr.read()[:max_output]
        outputs = []
        seq = 0
        if stdout:
            outputs.append({"id": str(uuid.uuid4()), "kind": "stdout", "sequence": seq, "text": stdout}); seq += 1
        if stderr:
            outputs.append({"id": str(uuid.uuid4()), "kind": "stderr", "sequence": seq, "text": stderr}); seq += 1
        status = "succeeded" if exit_code == 0 else "failed"
        result.update(status=status, exitCode=exit_code, outputs=outputs)
    except modal.exception.TimeoutError:
        result.update(status="timed_out", error={"code": "TIMEOUT", "message": "Execution exceeded its time limit.", "retryable": False})
    except Exception as exc:
        result.update(status="failed", error={"code": "RUNNER_ERROR", "message": str(exc)[:500], "retryable": True})
    finally:
        try:
            sb.terminate()
        except Exception:
            pass
        finished = time.time()
        result["finishedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(finished))
        result["metrics"] = {"wallTimeMs": round((finished - started) * 1000)}
        results[execution_id] = result


@api.get("/v1/health")
def health(authorization: str | None = Header(default=None)):
    _auth(authorization)
    return {"ok": True, "provider": "modal", "details": {"network": "disabled", "isolation": "disposable-sandbox"}}


@api.post("/v1/executions", status_code=202)
def submit(body: dict[str, Any], authorization: str | None = Header(default=None)):
    _auth(authorization)
    execution_id = str(uuid.uuid4())
    accepted = {"executionId": execution_id, "requestId": body.get("requestId", execution_id), "status": "queued"}
    results[execution_id] = {**accepted, "outputs": []}
    execute_job.spawn(execution_id, body)
    return accepted


@api.get("/v1/executions/{execution_id}")
def get_result(execution_id: str, authorization: str | None = Header(default=None)):
    _auth(authorization)
    value = results.get(execution_id)
    if value is None:
        raise HTTPException(404, "Execution not found")
    return value


@api.delete("/v1/executions/{execution_id}", status_code=204)
def cancel(execution_id: str, authorization: str | None = Header(default=None)):
    _auth(authorization)
    value = results.get(execution_id)
    if value is None:
        raise HTTPException(404, "Execution not found")
    if value.get("status") in {"queued", "running"}:
        value["status"] = "cancelled"
        results[execution_id] = value


@app.function(image=runner_image, secrets=[modal.Secret.from_name("datalytiqs-runner-auth")])
@modal.asgi_app()
def web():
    return api

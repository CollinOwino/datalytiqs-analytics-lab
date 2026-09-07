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

    learner_source = base64.b64encode(
        code.encode("utf-8")
    ).decode("ascii")

    structured_bootstrap = """
import ast as _ast
import base64 as _base64
import io as _structured_io
import json as _structured_json

_DATALYTIQS_PREFIX = "__DATALYTIQS_OUTPUT__"


def _datalytiqs_emit(payload):
    try:
        payload_bytes = _structured_json.dumps(
            payload,
            default=str,
        ).encode("utf-8")

        payload_b64 = _base64.b64encode(
            payload_bytes
        ).decode("ascii")

        print(_DATALYTIQS_PREFIX + payload_b64)

    except Exception:
        pass


def _datalytiqs_clean(value):
    try:
        if pd.isna(value):
            return None
    except Exception:
        pass

    if hasattr(value, "item"):
        try:
            value = value.item()
        except Exception:
            pass

    if isinstance(
        value,
        (str, int, float, bool),
    ) or value is None:
        return value

    return str(value)


def _datalytiqs_table(value):
    try:
        if isinstance(value, pd.Series):
            frame = value.reset_index()

            if len(frame.columns) == 2:
                frame.columns = [
                    str(frame.columns[0]),
                    str(value.name or "value"),
                ]

        elif isinstance(value, pd.DataFrame):
            frame = value.copy()

            if not isinstance(
                frame.index,
                pd.RangeIndex,
            ):
                frame = frame.reset_index()

        else:
            return

        row_count = len(frame)
        max_rows = 200
        truncated = row_count > max_rows

        frame = frame.head(max_rows)

        columns = [
            str(column)
            for column in frame.columns
        ]

        rows = []

        for row in frame.itertuples(
            index=False,
            name=None,
        ):
            rows.append([
                _datalytiqs_clean(item)
                for item in row
            ])

        _datalytiqs_emit({
            "kind": "table",
            "table": {
                "columns": columns,
                "rows": rows,
                "rowCount": row_count,
                "truncated": truncated,
            },
        })

    except Exception:
        pass


def _datalytiqs_capture_figures():
    try:
        import matplotlib.pyplot as _structured_plt

        numbers = list(
            _structured_plt.get_fignums()
        )

        for number in numbers:
            figure = _structured_plt.figure(number)

            buffer = _structured_io.BytesIO()

            figure.savefig(
                buffer,
                format="png",
                bbox_inches="tight",
                dpi=120,
            )

            buffer.seek(0)

            title = None

            try:
                if figure._suptitle is not None:
                    title = figure._suptitle.get_text()

                elif figure.axes:
                    axis_title = (
                        figure.axes[0].get_title()
                    )

                    if axis_title:
                        title = axis_title

            except Exception:
                pass

            _datalytiqs_emit({
                "kind": "chart",
                "chart": {
                    "format": "png",
                    "data": _base64.b64encode(
                        buffer.read()
                    ).decode("ascii"),
                    "title": title,
                },
                "mimeType": "image/png",
            })

        if numbers:
            _structured_plt.close("all")

    except Exception:
        pass


try:
    import matplotlib.pyplot as _structured_plt

    def _datalytiqs_show(*args, **kwargs):
        _datalytiqs_capture_figures()

    _structured_plt.show = _datalytiqs_show

except Exception:
    pass
"""

    learner_wrapper = f"""
_learner_source = _base64.b64decode(
    {learner_source!r}
).decode("utf-8")

_tree = _ast.parse(
    _learner_source,
    filename="analysis.py",
    mode="exec",
)

_result_name = "__datalytiqs_last_value__"

if _tree.body and isinstance(
    _tree.body[-1],
    _ast.Expr,
):
    _expression = _tree.body[-1]

    _tree.body[-1] = _ast.Assign(
        targets=[
            _ast.Name(
                id=_result_name,
                ctx=_ast.Store(),
            )
        ],
        value=_expression.value,
    )

    _ast.fix_missing_locations(_tree)

exec(
    compile(
        _tree,
        "analysis.py",
        "exec",
    ),
    globals(),
    globals(),
)

if _result_name in globals():
    _datalytiqs_table(
        globals()[_result_name]
    )

_datalytiqs_capture_figures()
"""

    execution_code = (
        bootstrap
        + "\n"
        + structured_bootstrap
        + "\n"
        + learner_wrapper
    )

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

        structured_prefix = "__DATALYTIQS_OUTPUT__"
        console_lines = []

        for line in stdout.splitlines(keepends=True):
            stripped = line.strip()

            if stripped.startswith(structured_prefix):
                encoded_payload = stripped[
                    len(structured_prefix):
                ]

                try:
                    payload = json.loads(
                        base64.b64decode(
                            encoded_payload
                        ).decode("utf-8")
                    )

                    kind = payload.get("kind")

                    if (
                        kind == "table"
                        and payload.get("table")
                    ):
                        outputs.append({
                            "id": str(uuid.uuid4()),
                            "kind": "table",
                            "sequence": seq,
                            "table": payload["table"],
                        })

                        seq += 1
                        continue

                    if (
                        kind == "chart"
                        and payload.get("chart")
                    ):
                        outputs.append({
                            "id": str(uuid.uuid4()),
                            "kind": "chart",
                            "sequence": seq,
                            "chart": payload["chart"],
                            "mimeType": payload.get(
                                "mimeType",
                                "image/png",
                            ),
                        })

                        seq += 1
                        continue

                except Exception:
                    pass

            console_lines.append(line)

        console_text = "".join(console_lines)

        if console_text:
            outputs.append({
                "id": str(uuid.uuid4()),
                "kind": "stdout",
                "sequence": seq,
                "text": console_text,
            })

            seq += 1

        if stderr:
            outputs.append({
                "id": str(uuid.uuid4()),
                "kind": "stderr",
                "sequence": seq,
                "text": stderr,
            })

            seq += 1

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

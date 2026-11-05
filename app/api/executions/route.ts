import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { getExecutionProvider } from "../../../lib/execution/provider";
import { account } from "../../../lib/persistence/account";
import type {
  DatasetRef,
  ExecutionRequest,
} from "../../../lib/execution/types";

const MAX_CODE = 100_000;

async function getCaseDatasets(caseId?: string): Promise<DatasetRef[]> {
  let datasetPath: string;
  let name: string;
  let mimeType: string;
  switch (caseId) {
    case "001":
      datasetPath = path.join(
        process.cwd(),
        "data",
        "cases",
        "001",
        "Case_001_Dataset.xlsx",
      );
      name = "Case_001_Dataset.xlsx";
      mimeType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      break;
    case "pg-kenya-macro":
      datasetPath = path.join(
        process.cwd(),
        "data",
        "playgrounds",
        "kenya_macro_illustrative.csv",
      );
      name = "kenya_macro_illustrative.csv";
      mimeType = "text/csv";
      break;
    case "pg-county-services":
      datasetPath = path.join(
        process.cwd(),
        "data",
        "playgrounds",
        "county_services_illustrative.csv",
      );
      name = "county_services_illustrative.csv";
      mimeType = "text/csv";
      break;
    case "pg-community-health":
      datasetPath = path.join(
        process.cwd(),
        "data",
        "playgrounds",
        "community_health_illustrative.csv",
      );
      name = "community_health_illustrative.csv";
      mimeType = "text/csv";
      break;
    case "pg-african-demographics":
      datasetPath = path.join(
        process.cwd(),
        "data",
        "playgrounds",
        "african_demographic_livelihood_illustrative.csv",
      );
      name = "african_demographic_livelihood_illustrative.csv";
      mimeType = "text/csv";
      break;
    case "pg-kenya-housing":
      datasetPath = path.join(
        process.cwd(),
        "data",
        "playgrounds",
        "kenya_housing_illustrative.csv",
      );
      name = "kenya_housing_illustrative.csv";
      mimeType = "text/csv";
      break;
    case "101":
      datasetPath = path.join(process.cwd(), "data", "playgrounds", "kenya_concrete_strength_illustrative.csv");
      name = "kenya_concrete_strength_illustrative.csv";
      mimeType = "text/csv";
      break;
    default:
      return [];
  }
  const dataset = await readFile(datasetPath);
  return [
    {
      datasetId: `dataset-${caseId}`,
      name,
      contentBase64: dataset.toString("base64"),
      mimeType,
    },
  ];
}

export async function POST(req: NextRequest) {
  const identity = await account();
  if (!identity)
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED" } },
      { status: 401, headers: { "cache-control": "private, no-store" } },
    );
  try {
    const body = (await req.json()) as ExecutionRequest;

    if (
      body.language !== "python" ||
      typeof body.code !== "string" ||
      !body.code.trim()
    ) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "language=python and non-empty code are required.",
            retryable: false,
          },
        },
        { status: 400 },
      );
    }

    if (body.code.length > MAX_CODE) {
      return NextResponse.json(
        {
          error: {
            code: "CODE_TOO_LARGE",
            message: `Code exceeds ${MAX_CODE} characters.`,
            retryable: false,
          },
        },
        { status: 413 },
      );
    }

    const allowedCases = new Set([
      "001",
      "pg-kenya-macro",
      "pg-county-services",
      "pg-community-health",
      "pg-african-demographics",
      "pg-kenya-housing",
      "101",
    ]);
    if (body.caseId !== undefined && !allowedCases.has(body.caseId)) {
      return NextResponse.json(
        { error: { code: "INVALID_CASE" } },
        { status: 400 },
      );
    }
    const projectId = body.metadata?.projectId;
    if (projectId) {
      const { data: project } = await identity.supabase
        .from("learner_workspace_projects")
        .select("id")
        .eq("id", projectId)
        .eq("user_id", identity.userId)
        .maybeSingle();
      if (!project)
        return NextResponse.json(
          { error: { code: "PROJECT_NOT_FOUND" } },
          { status: 404 },
        );
    }
    const requestedStage =
      body.metadata?.stage === "playground" ? "playground" : "03";
    body.metadata = projectId
      ? { projectId, stage: requestedStage }
      : { stage: requestedStage };

    body.requestId = crypto.randomUUID();
    body.learnerId = identity.userId;
    body.packages = [];
    body.runtime = body.caseId === "101" ? "python-pytorch-cpu" : "python-analytics";

    body.limits = {
      timeoutMs: Math.max(
        1_000,
        Math.min(Number(body.limits?.timeoutMs) || 30_000, 60_000),
      ),
      memoryMb: Math.max(
        64,
        Math.min(Number(body.limits?.memoryMb) || 512, 1024),
      ),
      cpuSeconds: Math.max(
        1,
        Math.min(Number(body.limits?.cpuSeconds) || 20, 45),
      ),
      maxOutputBytes: Math.max(
        1_024,
        Math.min(Number(body.limits?.maxOutputBytes) || 2_000_000, 5_000_000),
      ),
      network: "disabled",
    };

    /*
     * Case datasets are attached server-side.
     * Learner browsers never need to send the canonical workbook.
     */
    const canonicalDatasets = await getCaseDatasets(body.caseId);

    body.datasets = canonicalDatasets;

    const accepted = await getExecutionProvider().execute(body);
    if (!/^[a-zA-Z0-9_-]{1,150}$/.test(accepted.executionId)) {
      await getExecutionProvider()
        .cancel(accepted.executionId)
        .catch(() => undefined);
      throw new Error("Execution identifier is invalid.");
    }
    const { error: custodyError } = await identity.supabase
      .from("learner_execution_jobs")
      .insert({
        execution_id: accepted.executionId,
        user_id: identity.userId,
        request_id: accepted.requestId,
      });
    if (custodyError) {
      if (custodyError.code !== "23505")
        await getExecutionProvider()
          .cancel(accepted.executionId)
          .catch(() => undefined);
      throw new Error("Execution custody could not be recorded.");
    }

    return NextResponse.json(accepted, {
      status: 202,
      headers: {
        "cache-control": "private, no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: {
          code: "EXECUTION_SUBMIT_FAILED",
          message:
            e instanceof Error ? e.message : "Unable to submit execution.",
          retryable: true,
        },
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  const identity = await account();
  if (!identity)
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED" } },
      { status: 401 },
    );
  try {
    return NextResponse.json(await getExecutionProvider().health(), {
      headers: {
        "cache-control": "private, no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Provider unavailable",
      },
      { status: 503 },
    );
  }
}

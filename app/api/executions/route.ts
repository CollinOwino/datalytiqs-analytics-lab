import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { getExecutionProvider } from '../../../lib/execution/provider'
import type {
  DatasetRef,
  ExecutionRequest,
} from '../../../lib/execution/types'

const MAX_CODE = 100_000

async function getCaseDatasets(caseId?: string): Promise<DatasetRef[]> {
  if (caseId !== '001') {
    return []
  }

  const datasetPath = path.join(
    process.cwd(),
    'data',
    'cases',
    '001',
    'Case_001_Dataset.xlsx'
  )

  const dataset = await readFile(datasetPath)

  return [
    {
      datasetId: 'case-001-primary',
      name: 'Case_001_Dataset.xlsx',
      contentBase64: dataset.toString('base64'),
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  ]
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExecutionRequest

    if (
      body.language !== 'python' ||
      typeof body.code !== 'string' ||
      !body.code.trim()
    ) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_REQUEST',
            message: 'language=python and non-empty code are required.',
            retryable: false,
          },
        },
        { status: 400 }
      )
    }

    if (body.code.length > MAX_CODE) {
      return NextResponse.json(
        {
          error: {
            code: 'CODE_TOO_LARGE',
            message: `Code exceeds ${MAX_CODE} characters.`,
            retryable: false,
          },
        },
        { status: 413 }
      )
    }

    body.requestId =
      body.requestId ||
      req.headers.get('x-request-id') ||
      crypto.randomUUID()

    body.limits = {
      timeoutMs: Math.min(body.limits?.timeoutMs || 30_000, 60_000),
      memoryMb: Math.min(body.limits?.memoryMb || 512, 1024),
      cpuSeconds: Math.min(body.limits?.cpuSeconds || 20, 45),
      maxOutputBytes: Math.min(
        body.limits?.maxOutputBytes || 2_000_000,
        5_000_000
      ),
      network: 'disabled',
    }

    /*
     * Case datasets are attached server-side.
     * Learner browsers never need to send the canonical workbook.
     */
    const canonicalDatasets = await getCaseDatasets(body.caseId)

    if (canonicalDatasets.length > 0) {
      body.datasets = canonicalDatasets
    }

    const accepted = await getExecutionProvider().execute(body)

    return NextResponse.json(accepted, {
      status: 202,
      headers: {
        'cache-control': 'no-store',
      },
    })
  } catch (e) {
    return NextResponse.json(
      {
        error: {
          code: 'EXECUTION_SUBMIT_FAILED',
          message:
            e instanceof Error ? e.message : 'Unable to submit execution.',
          retryable: true,
        },
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    return NextResponse.json(await getExecutionProvider().health(), {
      headers: {
        'cache-control': 'no-store',
      },
    })
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error:
          e instanceof Error ? e.message : 'Provider unavailable',
      },
      { status: 503 }
    )
  }
}

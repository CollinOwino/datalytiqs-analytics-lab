import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { account, getAccountProject } from "../../../../../lib/persistence/account";
import { createAdminClient } from "../../../../../lib/supabase/admin";

type Context = { params: Promise<{ id: string }> };
const privateHeaders = { "cache-control": "private, no-store" };

export async function POST(_request: NextRequest, { params }: Context) {
  const identity = await account();
  if (!identity) return NextResponse.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401, headers: privateHeaders });
  const { id } = await params;
  const project = await getAccountProject(identity.supabase, identity.userId, id);
  if (!project) return NextResponse.json({ error: { code: "PROJECT_NOT_FOUND" } }, { status: 404, headers: privateHeaders });
  if (!new Set(["101", "102"]).has(project.caseId) || project.stages.slice(0, 5).some((stage) => stage.status !== "completed")) {
    return NextResponse.json({ error: { code: "PATHWAY_NOT_COMPLETE" } }, { status: 409, headers: privateHeaders });
  }

  const eventId = `lab-project-${project.id}-v${project.version}`;
  const payload = {
    event_id: eventId,
    event: "lab_pathway_completed",
    occurred_at: new Date().toISOString(),
    learner_email: identity.userEmail,
    lab_user_id: identity.userId,
    project_id: project.id,
    case_id: project.caseId,
    tutor_course_id: (project.caseId === "102" ? process.env.DATALYTIQS_COMPUTER_VISION_TUTOR_COURSE_ID : process.env.DATALYTIQS_DEEP_LEARNING_TUTOR_COURSE_ID) || null,
  };
  const admin = createAdminClient();
  const { error: outboxError } = await admin.from("lab_tutor_sync_outbox").upsert({
    idempotency_key: eventId,
    user_id: identity.userId,
    project_id: project.id,
    case_id: project.caseId,
    event_type: payload.event,
    payload,
    status: "pending",
  }, { onConflict: "idempotency_key", ignoreDuplicates: true });
  if (outboxError) return NextResponse.json({ error: { code: "SYNC_QUEUE_FAILED" } }, { status: 500, headers: privateHeaders });

  const endpoint = process.env.DATALYTIQS_TUTOR_PROGRESS_URL;
  const secret = process.env.DATALYTIQS_TUTOR_LAB_SECRET;
  if (!endpoint || !secret) return NextResponse.json({ status: "queued", delivery: "configuration_pending" }, { status: 202, headers: privateHeaders });

  const body = JSON.stringify(payload);
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", "x-datalytiqs-signature": `sha256=${signature}` },
      body,
      signal: AbortSignal.timeout(8_000),
    });
    await admin.from("lab_tutor_sync_outbox").update({
      status: response.ok ? "delivered" : "retry",
      attempts: 1,
      last_attempt_at: new Date().toISOString(),
      last_error: response.ok ? null : `HTTP ${response.status}`,
      delivered_at: response.ok ? new Date().toISOString() : null,
    }).eq("idempotency_key", eventId);
    return NextResponse.json({ status: response.ok ? "delivered" : "queued" }, { status: response.ok ? 200 : 202, headers: privateHeaders });
  } catch (error) {
    await admin.from("lab_tutor_sync_outbox").update({ status: "retry", attempts: 1, last_attempt_at: new Date().toISOString(), last_error: error instanceof Error ? error.message.slice(0, 500) : "Delivery failed" }).eq("idempotency_key", eventId);
    return NextResponse.json({ status: "queued", delivery: "retry" }, { status: 202, headers: privateHeaders });
  }
}

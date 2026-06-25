import { captureServerException, initSentryServer, isSentryServerEnabled } from "$lib/server/observability";
import { json } from "@sveltejs/kit";

type ErrorPayload = {
  message?: string;
  context?: Record<string, unknown>;
};

export async function POST({ request }) {
  if (!isSentryServerEnabled()) {
    return json({ ok: true, skipped: true, reason: "missing_env" });
  }

  initSentryServer();

  let body: ErrorPayload;
  try {
    body = (await request.json()) as ErrorPayload;
  } catch {
    return json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.message) {
    return json({ error: "message is required" }, { status: 400 });
  }

  const error = new Error(body.message);
  captureServerException(error, body.context);

  return json({ ok: true });
}

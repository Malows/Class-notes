import { getPlausibleDomain, getPlausibleEventURL, isAnalyticsServerEnabled } from "$lib/server/observability";
import { json } from "@sveltejs/kit";

type AnalyticsRequestBody = {
  name?: string;
  url?: string;
  referrer?: string;
  props?: Record<string, string | number | boolean>;
};

export async function POST({ request, getClientAddress }) {
  if (!isAnalyticsServerEnabled()) {
    return json({ ok: true, skipped: true, reason: "missing_env" });
  }

  let body: AnalyticsRequestBody;
  try {
    body = (await request.json()) as AnalyticsRequestBody;
  } catch {
    return json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.name) {
    return json({ error: "name is required" }, { status: 400 });
  }

  const endpoint = getPlausibleEventURL();
  const domain = getPlausibleDomain();

  if (!endpoint || !domain) {
    return json({ ok: true, skipped: true, reason: "missing_env" });
  }

  const eventPayload = {
    domain,
    name: body.name,
    url: body.url || request.headers.get("origin") || "",
    referrer: body.referrer,
    props: body.props,
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.headers.get("user-agent") || "unknown",
        "X-Forwarded-For": request.headers.get("x-forwarded-for") || getClientAddress(),
      },
      body: JSON.stringify(eventPayload),
    });

    if (!response.ok) {
      return json({ error: "analytics_provider_error" }, { status: 502 });
    }

    return json({ ok: true });
  } catch {
    return json({ error: "analytics_unavailable" }, { status: 503 });
  }
}

import { isAnalyticsClientEnabled } from "$lib/observability/config";

type AnalyticsEventPayload = {
  name: string;
  url?: string;
  referrer?: string;
  props?: Record<string, string | number | boolean>;
};

async function sendAnalyticsEvent(payload: AnalyticsEventPayload): Promise<void> {
  if (!isAnalyticsClientEnabled()) {
    return;
  }

  try {
    await fetch("/api/v1/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // no-op by design
  }
}

export async function trackPageView(url: string, referrer?: string): Promise<void> {
  await sendAnalyticsEvent({ name: "pageview", url, referrer });
}

export async function trackEvent(
  name: string,
  props?: Record<string, string | number | boolean>,
): Promise<void> {
  await sendAnalyticsEvent({ name, props, url: window.location.href });
}

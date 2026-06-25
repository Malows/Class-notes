import * as Sentry from "@sentry/sveltekit";

const isTrue = (value: string | undefined): boolean => value === "true";

let sentryInitialized = false;

export function isAnalyticsServerEnabled(): boolean {
  return Boolean(process.env.PLAUSIBLE_HOST) && Boolean(process.env.PLAUSIBLE_DOMAIN);
}

export function isSentryServerEnabled(): boolean {
  return isTrue(process.env.SENTRY_ENABLED) && Boolean(process.env.SENTRY_DSN);
}

export function initSentryServer(): boolean {
  if (sentryInitialized || !isSentryServerEnabled()) {
    return false;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
    tracesSampleRate: 0,
  });

  sentryInitialized = true;
  return true;
}

export function getPlausibleEventURL(): string | null {
  if (!isAnalyticsServerEnabled()) {
    return null;
  }

  const host = process.env.PLAUSIBLE_HOST || "";
  return `${host.replace(/\/$/, "")}/api/event`;
}

export function getPlausibleDomain(): string | null {
  return process.env.PLAUSIBLE_DOMAIN || null;
}

export function captureServerException(error: unknown, extra?: Record<string, unknown>): void {
  if (!sentryInitialized) {
    return;
  }

  Sentry.captureException(error, extra ? { extra } : undefined);
}

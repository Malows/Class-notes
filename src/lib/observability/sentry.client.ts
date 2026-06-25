import * as Sentry from "@sentry/sveltekit";
import { getSentryEnvironment, isSentryClientEnabled } from "$lib/observability/config";

let initialized = false;

export function initSentryClient(): boolean {
  if (initialized || !isSentryClientEnabled()) {
    return false;
  }

  Sentry.init({
    dsn: import.meta.env.PUBLIC_SENTRY_DSN,
    environment: getSentryEnvironment(),
    tracesSampleRate: 0,
  });

  initialized = true;
  return true;
}

export function captureClientError(error: unknown, context?: Record<string, unknown>): void {
  if (!initialized) {
    return;
  }

  Sentry.captureException(error, context ? { extra: context } : undefined);
}

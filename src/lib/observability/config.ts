const isTrue = (value: string | undefined): boolean => value === "true";

export function isSentryClientEnabled(): boolean {
  return isTrue(import.meta.env.PUBLIC_SENTRY_ENABLED) && Boolean(import.meta.env.PUBLIC_SENTRY_DSN);
}

export function isAnalyticsClientEnabled(): boolean {
  return isTrue(import.meta.env.PUBLIC_ANALYTICS_ENABLED);
}

export function getSentryEnvironment(): string {
  return import.meta.env.PUBLIC_SENTRY_ENVIRONMENT || "development";
}

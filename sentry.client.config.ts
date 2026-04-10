import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2, // 20% for performance monitoring
  debug: false,
  enabled: process.env.NODE_ENV === 'production',
  replaysSessionSampleRate: 0, // Disable recording for normal sessions to save quota
  replaysOnErrorSampleRate: 0.2, // Record 20% of sessions with errors
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

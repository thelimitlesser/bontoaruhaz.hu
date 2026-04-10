import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://10a1dcd0f04e66792de878bc00601e53@o4511195988492288.ingest.de.sentry.io/4511195992752208",
  
  // Debug mode enabled for troubleshooting
  debug: true,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,
});

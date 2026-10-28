"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import type { BeforeSendEvent } from "@vercel/analytics";

// The consent banner (components/shared/CookieConsent) persists a choice to
// localStorage but nothing consumed it until now. This is that consumer: a
// visitor who chose "Reject Non-Essential" sends no pageviews and no custom
// events. Vercel Analytics is cookieless and aggregated, so this gate is a
// courtesy to an existing UI promise rather than a legal necessity — but it
// makes the banner real for the first time.
function consentRejected(): boolean {
  try {
    return localStorage.getItem("cookie-consent") === "rejected";
  } catch {
    return false;
  }
}

export function AnalyticsProvider() {
  function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
    return consentRejected() ? null : event;
  }

  return (
    <>
      <Analytics beforeSend={beforeSend} debug={false} />
      <SpeedInsights />
    </>
  );
}

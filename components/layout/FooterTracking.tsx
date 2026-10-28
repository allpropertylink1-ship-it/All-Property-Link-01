"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

// One delegated listener on the footer element instead of a handler per link.
// This is what keeps Footer.tsx a server component: the markup renders on the
// server with no client JS, and this adds behaviour after hydration. A
// per-link onClick approach would have forced the whole footer into
// "use client" and shipped it in every route's bundle.
//
// Sections come from data-footer-section on an ancestor (set in Footer.tsx).
// Consent is NOT re-checked here — AnalyticsProvider's beforeSend cancels the
// event centrally, which covers pageviews and custom events in one place.
export function FooterTracking() {
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    function handleClick(event: MouseEvent) {
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const sectionEl = anchor.closest("[data-footer-section]");
      const href = anchor.getAttribute("href") ?? "";
      const label = (anchor.textContent ?? "").replace(/\s+/g, " ").trim();

      track("Footer Click", {
        section: sectionEl?.getAttribute("data-footer-section") ?? "other",
        href,
        // Property values are capped to keep event payloads small.
        label: label.length > 60 ? `${label.slice(0, 57)}...` : label,
        external: /^https?:/.test(href),
      });
    }

    footer.addEventListener("click", handleClick);
    return () => footer.removeEventListener("click", handleClick);
  }, []);

  return null;
}

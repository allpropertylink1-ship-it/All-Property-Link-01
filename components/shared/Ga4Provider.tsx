"use client";

import { useEffect, useRef, useCallback, createContext, useContext, ReactNode } from "react";

type Ga4EventAction =
  | "contact_form_submit"
  | "registration_click"
  | "property_listing_view"
  | string;

interface Ga4ContextType {
  gtag: (action: Ga4EventAction, params?: Record<string, unknown>) => void;
  isReady: boolean;
}

const Ga4Context = createContext<Ga4ContextType>({
  gtag: () => {},
  isReady: false,
});

function consentRejected(): boolean {
  try {
    return localStorage.getItem("cookie-consent") === "rejected";
  } catch {
    return false;
  }
}

export function Ga4Provider({ children }: { children: ReactNode }) {
  const measurementId =
    typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID as string | undefined);
  const isReadyRef = useRef(false);
  const gtagRef = useRef<((action: string, params?: Record<string, unknown>) => void) | null>(
    null
  );

  // Load gtag.js and initialize GA4 on mount
  useEffect(() => {
    if (!measurementId || consentRejected()) return;
    if (isReadyRef.current) return;

    const scriptId = "ga4-script";
    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    script.onload = () => {
      // gtag is defined by the script above
      const g = window as unknown as {
        gtag?: (...args: unknown[]) => void;
        gtag_q?: unknown[];
      };
      if (!g.gtag) {
        g.gtag = (...args: unknown[]) => {
          g.gtag_q = g.gtag_q || [];
          g.gtag_q.push(args);
        };
      }
      g.gtag("js", new Date());
      g.gtag("config", measurementId, {
        page_path: window.location.pathname,
        send_page_view: true,
      });
      isReadyRef.current = true;
      gtagRef.current = (action, params) => {
        if (consentRejected()) return;
        g.gtag?.("event", action, params);
      };
    };
  }, [measurementId]);

  // Track page views on route changes
  useEffect(() => {
    if (!gtagRef.current || !measurementId) return;
    gtagRef.current("page_view", {
      page_path: window.location.pathname,
      page_title: document.title,
    });
  }, [measurementId]);

  const gtag = useCallback(
    (action: Ga4EventAction, params?: Record<string, unknown>) => {
      if (!gtagRef.current || consentRejected()) return;
      gtagRef.current(action, params);
    },
    []
  );

  return (
    <Ga4Context.Provider value={{ gtag, isReady: isReadyRef.current }}>
      {children}
    </Ga4Context.Provider>
  );
}

export function useGa4() {
  return useContext(Ga4Context);
}

/**
 * The 3 conversion events required by the SEO Services Agreement:
 * 1. contact_form_submit - Contact form submission
 * 2. registration_click - Registration click
 * 3. property_listing_view - Property listing view
 */
export function trackContactFormSubmit(params?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    const g = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof g.gtag === "function") {
      g.gtag("event", "contact_form_submit", {
        event_category: "conversion",
        ...params,
      });
    }
  }
}

export function trackRegistrationClick(params?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    const g = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof g.gtag === "function") {
      g.gtag("event", "registration_click", {
        event_category: "conversion",
        ...params,
      });
    }
  }
}

export function trackPropertyListingView(params?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    const g = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof g.gtag === "function") {
      g.gtag("event", "property_listing_view", {
        event_category: "engagement",
        ...params,
      });
    }
  }
}

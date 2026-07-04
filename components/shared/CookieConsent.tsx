"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Consent = "accepted" | "rejected" | null;

function CookieIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
      <path d="M8.5 8.5v.01" />
      <path d="M15.5 15.5v.01" />
      <path d="M11 11v.01" />
    </svg>
  );
}

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("cookie-consent") as Consent;
    if (stored) setConsent(stored);
  }, []);

  function acceptAll() {
    localStorage.setItem("cookie-consent", "accepted");
    setConsent("accepted");
  }

  function rejectNonEssential() {
    localStorage.setItem("cookie-consent", "rejected");
    setConsent("rejected");
  }

  if (!mounted || consent) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface p-4 shadow-lg md:bottom-auto md:top-auto md:p-6">
      <div className="mx-auto flex max-w-content flex-col items-start gap-4 md:flex-row md:items-center">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50">
            <CookieIcon className="h-4 w-4 text-primary-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              We value your privacy
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-primary-500">
                Learn more
              </Link>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={rejectNonEssential}
            className="touch-target rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          >
            Reject Non-Essential
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="touch-target rounded-lg bg-accent-300 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-400"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

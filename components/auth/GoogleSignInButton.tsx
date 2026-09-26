"use client"
import { useState, useEffect, useRef } from "react"

import { CURRENT_TERMS_VERSION } from "@/lib/auth-context"

interface GoogleSignInButtonProps {
  onError: (error: string) => void
  mode?: "signin" | "signup"
  termsAccepted?: boolean
  referralCode?: string
  /**
   * Whether this panel is the visible one. Only the active panel renders a
   * GIS button (a hidden container measures 0px and steals layout). Defaults
   * true (standalone pages).
   */
  active?: boolean
}

function waitForGsi(timeoutMs = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as unknown as { google?: { accounts?: { id?: unknown } } }).google?.accounts?.id) {
      resolve()
      return
    }
    const started = Date.now()
    const timer = setInterval(() => {
      if ((window as unknown as { google?: { accounts?: { id?: unknown } } }).google?.accounts?.id) {
        clearInterval(timer)
        resolve()
      } else if (Date.now() - started > timeoutMs) {
        clearInterval(timer)
        reject(new Error("Google script load timed out"))
      }
    }, 100)
  })
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("google-gsi-script")) {
      // A second button instance mounted while the script is still loading:
      // the element exists but window.google may not yet. Poll for it
      // instead of resolving immediately (that raced to a dead button).
      waitForGsi().then(resolve, reject)
      return
    }
    const script = document.createElement("script")
    script.id = "google-gsi-script"
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    const timeout = setTimeout(() => reject(new Error("Google script load timed out")), 10000)
    script.onload = () => { clearTimeout(timeout); resolve() }
    script.onerror = () => { clearTimeout(timeout); reject(new Error("Failed to load Google script")) }
    document.head.appendChild(script)
  })
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "103540540209-89aqffdkc4f7mk2q19v1kk5k5a8liu4v.apps.googleusercontent.com"

/**
 * Name of the first-party intent cookie the signup panel maintains while it
 * is visible. The redirect callback route reads it to recover the Terms
 * acceptance + referral that a redirect round-trip would otherwise lose
 * (GIS posts only the credential). Short-lived, same-site, cleared on use.
 */
const INTENT_COOKIE = "apl_gintent"

function writeIntentCookie(termsAccepted: boolean | undefined, referralCode: string | undefined) {
  try {
    const returnUrl = new URLSearchParams(window.location.search).get("return")
    const value = encodeURIComponent(JSON.stringify({
      termsAccepted: termsAccepted === true,
      referralCode: (referralCode || "").trim() || null,
      termsVersion: CURRENT_TERMS_VERSION,
      returnUrl,
    }))
    const secure = window.location.protocol === "https:" ? "; Secure" : ""
    document.cookie = `${INTENT_COOKIE}=${value}; Path=/; Max-Age=600; SameSite=Lax${secure}`
  } catch {
    // Cookie write failure: the callback route treats a missing intent as a
    // plain sign-in attempt (new users get CONSENT_REQUIRED, surfaced back).
  }
}

function clearIntentCookie() {
  try {
    document.cookie = `${INTENT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
  } catch {
    // Best-effort only.
  }
}

export function GoogleSignInButton({ onError, mode = "signin", termsAccepted, referralCode, active = true }: GoogleSignInButtonProps) {
  const [ready, setReady] = useState(false)
  const [scriptError, setScriptError] = useState(false)
  const btnRef = useRef<HTMLDivElement>(null)
  const renderedRef = useRef(false)
  const needsConsentGate = mode === "signup" && termsAccepted === false

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    loadGoogleScript()
      .then(() => setReady(true))
      .catch(() => setScriptError(true))
  }, [])

  // Keep the signup intent cookie in step with the form while this panel is
  // visible; clear it when leaving so a later sign-in click can't inherit a
  // stale signup intent.
  useEffect(() => {
    if (mode !== "signup") return
    if (!active) {
      clearIntentCookie()
      return
    }
    writeIntentCookie(termsAccepted, referralCode)
  }, [mode, active, termsAccepted, referralCode])

  useEffect(() => {
    if (!ready) return
    if (!active || !btnRef.current) {
      // Inactive panel: allow a fresh render on reactivation.
      renderedRef.current = false
      return
    }
    const container = btnRef.current

    const google = (window as unknown as Record<string, unknown>).google as { accounts?: { id: { initialize: (config: Record<string, unknown>) => void; renderButton: (element: HTMLElement, options: Record<string, unknown>) => void } } } | undefined
    if (!google?.accounts?.id) {
      setScriptError(true)
      return
    }

    // Redirect mode (not popup): after approval Google POSTs the credential
    // to our same-origin callback route. Immune to popup blockers,
    // opener loss, and Cross-Origin-Opener-Policy postMessage blocks that
    // silently strand popup flows. No JS callback is involved, so there is
    // no stale-closure hazard — initialize once per activation.
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      ux_mode: "redirect",
      login_uri: `${window.location.origin}/api/auth/google/callback`,
    })
    if (renderedRef.current) return
    renderedRef.current = true

    const width = container.offsetWidth || 384
    google.accounts.id.renderButton(container, {
      type: "standard",
      shape: "rectangular",
      theme: "outline",
      text: mode === "signup" ? "signup_with" : "signin_with",
      size: "large",
      width,
      logo_alignment: "left",
    })
  }, [ready, active, mode])

  if (!active) {
    // Inactive panel: same footprint, no GSI wiring. Keeps toggle layout stable.
    return <div className="touch-target w-full rounded-xl border border-border bg-surface-secondary/50" style={{ minHeight: 52 }} aria-hidden="true" />
  }

  const showPlaceholder = !GOOGLE_CLIENT_ID || scriptError

  if (showPlaceholder) {
    return (
      <button
        type="button"
        disabled
        aria-label="Google sign-in unavailable"
        className="touch-target flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-border bg-surface-secondary px-4 py-3.5 text-sm font-semibold text-text-secondary opacity-50"
      >
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {!GOOGLE_CLIENT_ID ? "Google sign-in unavailable" : "Google sign-in unavailable"}
      </button>
    )
  }

  if (!ready) {
    return (
      <div className="touch-target flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-secondary px-4 py-3.5" role="status" aria-label="Loading Google sign-in">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-text-secondary">Loading Google sign-in...</span>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <div
        ref={btnRef}
        className={`touch-target w-full overflow-hidden rounded-xl ${needsConsentGate ? "pointer-events-none opacity-60" : ""}`}
        aria-disabled={needsConsentGate}
        title={needsConsentGate ? "Please accept the Terms and confirm you are 18+ to continue with Google" : undefined}
      />
      {needsConsentGate && (
        <button
          type="button"
          aria-label="Accept Terms to enable Google sign-up"
          onClick={() => onError("Please agree to the Terms of Service and Privacy Policy and confirm you are 18+ years old to continue with Google.")}
          className="absolute inset-0 z-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      )}
      {needsConsentGate && (
        <p className="mt-1.5 text-xs text-text-secondary">Please tick the agreement below to enable Google sign-up.</p>
      )}
    </div>
  )
}

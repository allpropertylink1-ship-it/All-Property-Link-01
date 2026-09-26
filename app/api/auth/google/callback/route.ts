import { NextRequest, NextResponse } from "next/server"

const API_BACKEND = process.env.API_BACKEND_URL || "https://api.allpropertylink.co.ke"

/**
 * Completes a Google redirect-mode sign-in (ux_mode: "redirect").
 *
 * Why this exists: the GIS popup flow delivers the credential via
 * window.postMessage from the accounts.google.com popup to our page, which
 * fails silently (retry loop, no account, no error) when the browser blocks
 * opener communication (Cross-Origin-Opener-Policy, popup-as-tab, strict
 * privacy setups). The redirect flow instead POSTs the credential to this
 * same-origin endpoint as a top-level navigation — immune to all of that —
 * and we finish the session here, first-party.
 *
 * Flow: Google --POST credential+g_csrf_token--> this route --POST--> backend
 * /api/auth/oauth/google (existing route, unchanged) --Set-Cookie--> browser,
 * then 302 into the /auth signed-in guard which routes by persona.
 */

interface GoogleIntent {
  termsAccepted?: boolean
  referralCode?: string | null
  termsVersion?: string
  returnUrl?: string | null
}

function fail(req: NextRequest, code: string): NextResponse {
  const dest = new URL("/auth", req.url)
  dest.searchParams.set("google_error", code)
  // 303 (not the 307 default): this route receives a POST, but the landing
  // page must be fetched with GET. A 307 would replay the credential POST
  // into /auth and die with 405 instead of showing the form/banner.
  return NextResponse.redirect(dest, 303)
}

function safeReturn(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null
  if (!value.startsWith("/") || value.startsWith("//")) return null
  if (value === "/auth" || value.startsWith("/auth/") || value.startsWith("/api/")) return null
  return value
}

export async function GET(req: NextRequest) {
  // Direct visits (or refreshes) carry no credential — back to the form.
  return fail(req, "failed")
}

export async function POST(req: NextRequest) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return fail(req, "failed")
  }
  const credential = String(form.get("credential") || "")
  const csrfBody = String(form.get("g_csrf_token") || "")
  const csrfCookie = req.cookies.get("g_csrf_token")?.value
  // GIS anti-CSRF contract for redirect mode: the token Google set as a
  // first-party cookie must match the posted body value. Fail closed.
  if (!credential || !csrfBody || !csrfCookie || csrfBody !== csrfCookie) {
    return fail(req, "csrf")
  }

  // Signup context the visible panel maintained as a first-party cookie
  // (Terms acceptance + referral survive the round-trip; GIS posts only the
  // credential). Absent/stale cookie = plain sign-in semantics.
  let intent: GoogleIntent = {}
  try {
    const raw = req.cookies.get("apl_gintent")?.value
    if (raw) intent = JSON.parse(decodeURIComponent(raw)) as GoogleIntent
  } catch {
    intent = {}
  }

  const payload: Record<string, unknown> = { credential, rememberMe: true }
  if (intent.termsAccepted === true) {
    payload.acceptedTerms = true
    payload.ageConfirmed = true
    if (intent.termsVersion) payload.termsVersion = intent.termsVersion
  }
  const ref = (intent.referralCode || "").trim()
  if (ref) payload.referralCode = ref

  // Forward the real client IP/UA so backend rate-limiting, consent records,
  // and the new-device notice see the user — not Vercel egress.
  const fwd = req.headers.get("x-forwarded-for")
  const ua = req.headers.get("user-agent")
  let upstream: Response
  try {
    upstream = await fetch(`${API_BACKEND}/api/auth/oauth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(fwd ? { "x-forwarded-for": fwd } : {}),
        ...(ua ? { "user-agent": ua } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })
  } catch {
    return fail(req, "failed")
  }

  if (!upstream.ok) {
    let code = "failed"
    try {
      const body = (await upstream.json()) as { code?: string }
      const byCode: Record<string, string> = {
        CONSENT_REQUIRED: "consent",
        LINK_VERIFICATION_REQUIRED: "link",
        EMAIL_NOT_VERIFIED: "unverified",
        PASSWORD_RESET_REQUIRED: "reset",
      }
      if (body?.code && byCode[body.code]) code = byCode[body.code]
      else if (upstream.status === 423 || upstream.status === 429) code = "locked"
    } catch {
      if (upstream.status === 423 || upstream.status === 429) code = "locked"
    }
    return fail(req, code)
  }

  // Success: land on /auth so its signed-in guard routes by persona with the
  // full session user (same destination the popup flow pushed to client-side).
  const dest = new URL("/auth", req.url)
  const ret = safeReturn(intent.returnUrl)
  if (ret) dest.searchParams.set("return", ret)
  // 303: POST-redirect-GET — the browser must GET /auth (with the fresh
  // first-party cookies), never re-POST the credential into it (405).
  const res = NextResponse.redirect(dest, 303)
  // First-party navigation response: these cookies always stick (this is the
  // path that never suffers third-party-cookie blocking).
  const setCookies = upstream.headers.getSetCookie?.() || []
  if (setCookies.length > 0) {
    for (const c of setCookies) res.headers.append("set-cookie", c)
  } else {
    const single = upstream.headers.get("set-cookie")
    if (single) res.headers.append("set-cookie", single)
  }
  // Intent served its purpose — single use.
  res.cookies.delete("apl_gintent")
  return res
}

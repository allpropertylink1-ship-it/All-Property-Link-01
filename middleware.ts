import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const API_BACKEND = process.env.API_BACKEND_URL || "https://api.allpropertylink.co.ke"

// --- SEO-safe 503 maintenance gate ---
// Session 22 constraint: edge runtime -> cPanel origin fetches TIME OUT
// (host-level IP filtering), while serverless -> origin succeeds. So the
// middleware NEVER fetches the backend directly; it fetches the SAME-ORIGIN
// proxy path /api/site-status (app/api/[...path]/route.ts forwards GETs
// without auth). Module-level in-memory cache, 30s TTL, fail-OPEN on error.
const STATUS_TTL_MS = 30_000

let statusCache: { at: number; on: boolean } = { at: 0, on: false }

interface SiteStatusPayload {
  maintenanceMode?: boolean
}

async function readMaintenanceState(origin: string): Promise<{ on: boolean } | null> {
  if (Date.now() - statusCache.at < STATUS_TTL_MS) {
    return statusCache
  }
  try {
    const res = await fetch(`${origin}/api/site-status`, { cache: "no-store" })
    if (!res.ok) return null // fail-OPEN: never gate on a failed status check
    const data = (await res.json()) as SiteStatusPayload
    statusCache = { at: Date.now(), on: data.maintenanceMode === true }
    return statusCache
  } catch {
    return null // fail-OPEN: fetch error (e.g. upstream down) => no rewrite
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/uploads/")) {
    // Images live on the cPanel origin, which is unreachable from some
    // user networks (host-level IP filtering on :80/:443). Serve them
    // same-origin through the Vercel proxy so <img> tags never depend on
    // a direct browser -> origin connection.
    const url = new URL(request.url)
    url.host = new URL(API_BACKEND).host
    url.protocol = "https"
    url.port = ""
    return NextResponse.rewrite(url.toString())
  }

  // NOTE: /api/* is intentionally NOT rewritten here. All API traffic is
  // proxied via app/api/[...path]/route.ts (serverless) which forwards
  // cookies/method/body to the origin. Edge rewrites to
  // api.allpropertylink.co.ke were timing out due to host-level IP filtering
  // on Vercel edge → origin, while serverless → origin succeeds (different
  // IP pool). See Session 22 incident.

  // Never gate API traffic or the maintenance route itself (avoids loops and
  // keeps status checks / mutations reachable during maintenance).
  if (pathname.startsWith("/api/") || pathname.startsWith("/maintenance")) {
    return NextResponse.next()
  }

  // SEO-safe 503 gate. Contract: only the EXISTENCE of the `apl_bypass`
  // cookie is checked here; value validation happens server-side in
  // RootLayout/route (other track owns it — do not change).
  if (!request.cookies.get("apl_bypass")) {
    const state = await readMaintenanceState(request.nextUrl.origin)
    if (state?.on) {
      return NextResponse.rewrite(new URL("/maintenance", request.url))
    }
  }

  if (pathname.startsWith("/dashboard")) {
    // Either cookie grants entry: the access cookie expires after 15 min but
    // /api/auth/me rotates a valid refresh token into a fresh pair, so gating
    // on the access cookie alone bounced users to login on every refresh.
    const access = request.cookies.get("access_token")?.value
    const refresh = request.cookies.get("refresh_token")?.value
    if (!access && !refresh) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|pwa-splash-demo).*)"],
}
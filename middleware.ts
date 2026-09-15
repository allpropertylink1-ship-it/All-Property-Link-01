import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const API_BACKEND = process.env.API_BACKEND_URL || "https://api.allpropertylink.co.ke"

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
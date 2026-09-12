import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const API_BACKEND = process.env.API_BACKEND_URL || "https://api.allpropertylink.co.ke"

const PUBLIC_API_PREFIXES = ["/api/properties", "/api/services", "/api/reviews", "/api/health"]

const isPublicGet = (method: string, pathname: string) =>
  method === "GET" &&
  PUBLIC_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/")) {
    // Public reads are served by app/api/[...path]/route.ts (edge-cached
    // with controlled headers). Everything else proxies straight through
    // so auth cookies reach the origin untouched.
    if (isPublicGet(request.method, pathname)) {
      return NextResponse.next()
    }
    const url = new URL(request.url)
    url.host = new URL(API_BACKEND).host
    url.protocol = "https"
    url.port = ""
    const res = NextResponse.rewrite(url.toString())
    
    // Forward cookies from the original request to the backend API
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      res.headers.set("cookie", cookieHeader)
    }

    return res
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
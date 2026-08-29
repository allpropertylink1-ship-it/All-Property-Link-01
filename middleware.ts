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
    const url = new URL(request.url)
    url.host = new URL(API_BACKEND).host
    url.protocol = "https"
    url.port = ""
    const res = NextResponse.rewrite(url.toString())
    if (isPublicGet(request.method, pathname)) {
      // Cache public listings data at the Vercel CDN edge so users never
      // wait on the shared-hosting origin for the same public payload.
      res.headers.set(
        "Cache-Control",
        "public, max-age=60, s-maxage=120, stale-while-revalidate=300"
      )
      res.headers.set("CDN-Cache-Control", "public, s-maxage=120, stale-while-revalidate=300")
      res.headers.set("Vercel-CDN-Cache-Control", "public, s-maxage=120, stale-while-revalidate=300")
      res.headers.set("Vercel-Cache-Tag", "api-public")
      res.headers.delete("Vary")
    }
    return res
  }

  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("access_token")?.value
    if (!token) {
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
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const API_BACKEND = process.env.API_BACKEND_URL || "https://api.allpropertylink.co.ke"

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/")) {
    const url = new URL(request.url)
    url.host = new URL(API_BACKEND).host
    url.protocol = "https"
    url.port = ""
    return NextResponse.rewrite(url.toString())
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
}
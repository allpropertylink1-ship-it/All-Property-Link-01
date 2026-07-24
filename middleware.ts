import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function middleware(request: NextRequest) {
  const devAuth = process.env.DEV_AUTH
  if (devAuth) {
    const auth = request.headers.get("authorization")
    const expected = "Basic " + Buffer.from(devAuth).toString("base64")
    if (auth !== expected) {
      return new NextResponse("Access denied", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="All Property Link (Dev)"' },
      })
    }
  }

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("access_token")?.value
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
}

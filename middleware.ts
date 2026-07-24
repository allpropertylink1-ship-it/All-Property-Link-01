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

  const response = NextResponse.next()
  const isDev = process.env.NODE_ENV === "development"
  const scriptSrc = isDev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'"

  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-DNS-Prefetch-Control", "on")
  response.headers.set("Cross-Origin-Opener-Policy", "unsafe-none")
  response.headers.set("Content-Security-Policy", `default-src 'self'; script-src ${scriptSrc} https://accounts.google.com https://upload-widget.cloudinary.com; style-src 'self' 'unsafe-inline' https://accounts.google.com https://upload-widget.cloudinary.com https://fonts.googleapis.com; img-src 'self' data: blob: https://res.cloudinary.com https://upload-widget.cloudinary.com https://*.basemaps.cartocdn.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.allpropertylink.co.ke https://api.cloudinary.com https://upload-widget.cloudinary.com https://nominatim.openstreetmap.org; frame-src 'self' https://accounts.google.com https://upload-widget.cloudinary.com https://widget.cloudinary.com https://cloudinary.com; object-src 'none'`)
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
}

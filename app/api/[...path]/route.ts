import { NextRequest, NextResponse } from "next/server"

const API_BACKEND = process.env.API_BACKEND_URL || "https://api.allpropertylink.co.ke"

// Public read-only prefixes safe for edge caching. Everything else keeps
// flowing through the middleware rewrite untouched (cookies intact).
const PUBLIC_PREFIXES = ["api/properties", "api/services", "api/reviews", "api/health"]

function isPublicPath(key: string): boolean {
  return PUBLIC_PREFIXES.some((p) => key === p || key.startsWith(p + "/"))
}

/**
 * GET /api/... (public prefixes only)
 *
 * Proxies to the cPanel origin with Next data-cache revalidation and serves
 * the response with edge-cacheable headers. This exists because the shared
 * host stamps `Cache-Control: no-store` on dynamic responses, which defeats
 * Vercel edge caching on plain rewrites — and a route handler is the only
 * place we fully control response headers.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const key = ["api", ...(params.path || [])].join("/")
  if (!isPublicPath(key)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const url = new URL(req.url)
  const target = `${API_BACKEND}/${key}${url.search}`
  let upstream: Response
  try {
    upstream = await fetch(target, { next: { revalidate: 60 } })
  } catch {
    return NextResponse.json({ error: "Upstream unavailable" }, { status: 502 })
  }

  const body = await upstream.arrayBuffer()
  const res = new NextResponse(body, { status: upstream.status })
  res.headers.set("Content-Type", upstream.headers.get("content-type") || "application/json")
  res.headers.set(
    "Cache-Control",
    "public, max-age=60, s-maxage=120, stale-while-revalidate=300"
  )
  res.headers.set("Vercel-Cache-Tag", "api-public")
  return res
}

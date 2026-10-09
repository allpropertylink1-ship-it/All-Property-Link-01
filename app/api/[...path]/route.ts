import { NextRequest, NextResponse } from "next/server"

const API_BACKEND = process.env.API_BACKEND_URL || "https://api.allpropertylink.co.ke"

// Public read-only prefixes safe for edge caching.
const PUBLIC_PREFIXES = ["api/properties", "api/services", "api/reviews", "api/health"]

function isPublicPath(key: string): boolean {
  return PUBLIC_PREFIXES.some((p) => key === p || key.startsWith(p + "/"))
}

async function proxy(req: NextRequest, key: string) {
  const url = new URL(req.url)
  const target = `${API_BACKEND}/${key}${url.search}`

  const headers: Record<string, string> = {}
  // Forward relevant request headers
  const cookie = req.headers.get("cookie")
  if (cookie) headers["cookie"] = cookie
  const contentType = req.headers.get("content-type")
  if (contentType) headers["content-type"] = contentType
  const csrf = req.headers.get("x-csrf-token")
  if (csrf) headers["x-csrf-token"] = csrf
  const auth = req.headers.get("authorization")
  if (auth) headers["authorization"] = auth

  const method = req.method
  let body: BodyInit | undefined
  if (method !== "GET" && method !== "HEAD") {
    const buf = await req.arrayBuffer()
    if (buf.byteLength > 0) body = buf
  }

  // Passenger sleep/wake: one 8s attempt often dies on cold start.
  // Two 4s attempts (total ~8.3s incl. 300ms gap) stay inside the Vercel
  // Hobby 10s function limit while giving the just-woken backend a 2nd chance.
  let upstream: Response | null = null
  const ATTEMPTS = 2
  const ATTEMPT_TIMEOUT_MS = 4000
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS)
    try {
      upstream = await fetch(target, {
        method,
        headers,
        body,
        signal: controller.signal,
        // Use Next cache only for public GETs; other requests bypass cache
        ...(method === "GET" && isPublicPath(key) ? { next: { revalidate: 60 } } : { cache: "no-store" }),
      })
      clearTimeout(t)
      break
    } catch (e) {
      clearTimeout(t)
      console.error(`[proxy] upstream failed ${method} ${key} -> ${target} (attempt ${attempt}/${ATTEMPTS}):`, e instanceof Error ? e.message : e)
      if (attempt < ATTEMPTS) await new Promise((r) => setTimeout(r, 300))
    }
  }
  if (!upstream) {
    // Public GETs get a 503 + Retry-After so clients retry politely;
    // mutations keep the historic 502 shape plus a retryable flag.
    const warmingUp = method === "GET" && isPublicPath(key)
    return NextResponse.json(
      {
        error: warmingUp ? "Service warming up — retrying..." : "Upstream unavailable",
        retryable: true,
        retryAfter: 3,
      },
      { status: warmingUp ? 503 : 502, headers: { "Retry-After": "3" } }
    )
  }

  const respBody = await upstream.arrayBuffer()
  const res = new NextResponse(respBody, { status: upstream.status })

  // Forward important upstream headers
  const ct = upstream.headers.get("content-type")
  if (ct) res.headers.set("Content-Type", ct)
  const setCookie = upstream.headers.getSetCookie?.() || []
  for (const sc of setCookie) res.headers.append("set-cookie", sc)
  // Fallback for single set-cookie
  if (setCookie.length === 0) {
    const single = upstream.headers.get("set-cookie")
    if (single) res.headers.set("set-cookie", single)
  }

  if (method === "GET" && isPublicPath(key) && upstream.ok) {
    res.headers.set("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300")
    res.headers.set("Vercel-Cache-Tag", "api-public")
  } else {
    res.headers.set("Cache-Control", "no-store")
  }

  return res
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  const key = ["api", ...(ctx.params.path || [])].join("/")
  return proxy(req, key)
}
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  const key = ["api", ...(ctx.params.path || [])].join("/")
  return proxy(req, key)
}
export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) {
  const key = ["api", ...(ctx.params.path || [])].join("/")
  return proxy(req, key)
}
export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) {
  const key = ["api", ...(ctx.params.path || [])].join("/")
  return proxy(req, key)
}
export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
  const key = ["api", ...(ctx.params.path || [])].join("/")
  return proxy(req, key)
}
export async function OPTIONS(req: NextRequest, ctx: { params: { path: string[] } }) {
  const key = ["api", ...(ctx.params.path || [])].join("/")
  return proxy(req, key)
}

import { NextRequest, NextResponse } from "next/server"

const API_BACKEND = process.env.API_BACKEND_URL || "https://api.allpropertylink.co.ke"

// Buckets served by the backend static mount (see backend uploadsRoutes).
// Anything else 404s here so this route can never be abused as an open proxy.
const ALLOWED_ROOTS = new Set(["properties", "services", "kyc", "avatars", "business", "misc"])

// NOTE: this route MUST stay on the Node.js runtime (the default). Vercel
// edge -> cPanel origin connections are refused by host-level IP filtering
// (same incident that forced /api/* off edge rewrites), so an `edge`
// runtime here would 502 every image. Serverless -> origin succeeds.
async function proxy(req: NextRequest, segs: string[]) {
  if (segs.length < 2) return new NextResponse("Not found", { status: 404 })
  if (!ALLOWED_ROOTS.has(segs[0])) return new NextResponse("Not found", { status: 404 })
  if (segs.some((s) => !s || s === "." || s === ".." || s.includes("\\") || s.includes("/"))) {
    return new NextResponse("Not found", { status: 404 })
  }

  const url = new URL(req.url)
  const target = `${API_BACKEND}/uploads/${segs.join("/")}${url.search}`

  // Same retry shape as app/api/[...path]: two 4s attempts stay inside the
  // Vercel Hobby 10s function limit while surviving a cold backend.
  let upstream: Response | null = null
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 4000)
    try {
      upstream = await fetch(target, { signal: controller.signal, cache: "no-store" })
      clearTimeout(t)
      break
    } catch (e) {
      clearTimeout(t)
      console.error(`[uploads-proxy] upstream failed -> ${target} (attempt ${attempt}/2):`, e instanceof Error ? e.message : e)
      if (attempt < 2) await new Promise((r) => setTimeout(r, 300))
    }
  }
  if (!upstream) return new NextResponse("Upstream unavailable", { status: 502 })

  const body = await upstream.arrayBuffer()
  const res = new NextResponse(body, { status: upstream.status })
  const ct = upstream.headers.get("content-type")
  if (ct) res.headers.set("Content-Type", ct)
  if (upstream.ok) {
    // Upload filenames are content-addressed (uuid prefix), safe to cache hard.
    res.headers.set("Cache-Control", "public, max-age=31536000, immutable")
  } else {
    res.headers.set("Cache-Control", "no-store")
  }
  return res
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params.path || [])
}

import { NextRequest, NextResponse } from "next/server"

const API_BACKEND = process.env.API_BACKEND_URL || "https://api.allpropertylink.co.ke"

export async function GET(request: NextRequest) {
  return proxy(request)
}

export async function POST(request: NextRequest) {
  return proxy(request)
}

export async function PUT(request: NextRequest) {
  return proxy(request)
}

export async function PATCH(request: NextRequest) {
  return proxy(request)
}

export async function DELETE(request: NextRequest) {
  return proxy(request)
}

async function proxy(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname
    const search = request.nextUrl.search
    const url = `${API_BACKEND}${pathname}${search}`

    const headers = new Headers(request.headers)
    headers.delete("host")

    const body = request.method !== "GET" && request.method !== "HEAD" ? await request.text() : undefined

    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
    })

    const resHeaders = new Headers(response.headers)
    resHeaders.delete("content-encoding")

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    })
  } catch (error) {
    console.error("[API PROXY]", error)
    return NextResponse.json({ error: "Proxy error" }, { status: 502 })
  }
}
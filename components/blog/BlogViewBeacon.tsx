"use client"

import { useEffect } from "react"

interface BlogViewBeaconProps {
  slug: string
}

export function BlogViewBeacon({ slug }: BlogViewBeaconProps) {
  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    fetch(`/api/blog/posts/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referrer: document.referrer || null }),
      signal: controller.signal,
    }).catch(() => {
      // Best-effort analytics: never block the page on a beacon failure
    })

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [slug])

  return null
}

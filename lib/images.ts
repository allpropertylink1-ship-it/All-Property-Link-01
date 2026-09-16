export function optimizeImageUrl(url: string, width: number): string {
  if (!url) return url
  // Local uploads: keep relative so the browser loads them same-origin
  // through the /uploads middleware proxy (the cPanel origin is not
  // directly reachable from all user networks).
  if (url.startsWith("/uploads/")) {
    return url
  }
  if (url.includes("/uploads/") && url.includes("api.allpropertylink.co.ke")) {
    return url
  }
  if (url.includes("images.pexels.com/")) {
    try {
      const u = new URL(url)
      u.searchParams.set("auto", "compress")
      u.searchParams.set("cs", "tinysrgb")
      u.searchParams.set("w", String(Math.round(width)))
      return u.toString()
    } catch {
      /* fall through */
    }
  }
  return url
}

export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  // Local uploads: keep relative so the browser loads them same-origin
  // through the /uploads middleware proxy (the cPanel origin is not
  // directly reachable from all user networks).
  if (url.startsWith("/uploads/")) {
    return url
  }
  return url
}

export function toThumbUrl(url: string, fallbackWidth = 400): string {
  if (!url) return url
  if (url.startsWith("/uploads/properties/") || url.startsWith("/uploads/services/")) {
    // /uploads/properties/uuid-name.jpg -> /uploads/properties/uuid-name-thumb.jpg
    // If already a thumb, return as-is.
    if (url.includes("-thumb.")) return url
    const dot = url.lastIndexOf(".")
    if (dot > 0) {
      const base = url.slice(0, dot)
      const ext = url.slice(dot)
      // Thumb is always jpg/webp: .webp stays .webp, everything else .jpg
      const thumbExt = ext.toLowerCase() === ".webp" ? ".webp" : ".jpg"
      return `${base}-thumb${thumbExt}`
    }
  }
  return optimizeImageUrl(url, fallbackWidth)
}

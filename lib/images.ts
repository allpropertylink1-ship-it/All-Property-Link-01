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
  const trimmed = url.trim()
  if (!trimmed) return null
  // Ghost refs: old domain or Cloudinary remnants — normalize to local
  // e.g. "https://allpropertylink.com/uploads/..." or "https://res.cloudinary.com/..." with /uploads segment
  if (trimmed.includes("/uploads/")) {
    const idx = trimmed.indexOf("/uploads/")
    return trimmed.slice(idx)
  }
  if (trimmed.startsWith("uploads/")) return `/${trimmed}`
  // Local uploads: keep relative so the browser loads them same-origin
  // through the /uploads middleware proxy (the cPanel origin is not
  // directly reachable from all user networks).
  if (trimmed.startsWith("/uploads/")) {
    return trimmed
  }
  return trimmed
}

/**
 * CONTRACT: cover = coverImage ?? images[0] ?? null
 * Helpers are the single source of truth for every consumer.
 */
function normalizeImages(images: unknown): string[] {
  if (Array.isArray(images)) {
    return (images as unknown[]).filter((u): u is string => typeof u === "string" && u.trim().length > 0).map((s) => s.trim())
  }
  if (typeof images === "string" && images.trim()) {
    const t = images.trim()
    if (t.startsWith("[") && t.endsWith("]")) {
      try {
        const parsed = JSON.parse(t)
        if (Array.isArray(parsed)) return parsed.filter((u: unknown): u is string => typeof u === "string" && u.trim().length > 0).map((s: string) => s.trim())
      } catch { /* fall through */ }
    }
  }
  return []
}

export function getCoverImage(p: { coverImage?: string | null; images?: unknown }): string | null {
  const cover = typeof p.coverImage === "string" ? p.coverImage.trim() : ""
  if (cover) return resolveImageUrl(p.coverImage!.trim()) || p.coverImage!.trim()
  const normalized = normalizeImages(p.images)
  for (const v of normalized) {
    const r = resolveImageUrl(v)
    if (r) return r
    if (v.trim()) return v.trim()
  }
  return null
}

/**
 * Cover-first deduped gallery: [cover, ...images.filter(≠cover)]
 */
export function getGalleryImages(p: { coverImage?: string | null; images?: unknown }): string[] {
  const cover = getCoverImage(p)
  const raw: string[] = normalizeImages(p.images).map((s) => resolveImageUrl(s) || s)
  if (!cover) return Array.from(new Set(raw))
  const deduped = raw.filter((u) => u !== cover)
  return [cover, ...deduped.filter((v, i, a) => a.indexOf(v) === i)]
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

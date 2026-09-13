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
  if (url.includes("res.cloudinary.com/")) {
    const parts = url.split("/image/upload/")
    if (parts.length === 2) {
      const transform = `f_auto,q_auto,w_${Math.round(width)},dpr_auto`
      return `${parts[0]}/image/upload/${transform}/${parts[1]}`
    }
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

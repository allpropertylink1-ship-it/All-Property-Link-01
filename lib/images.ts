export function optimizeImageUrl(url: string, width: number): string {
  if (!url) return url
  // Local uploads: make absolute if relative
  if (url.startsWith("/uploads/")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.allpropertylink.co.ke"
    return `${apiUrl}${url}`
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
  if (url.startsWith("/uploads/")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.allpropertylink.co.ke"
    return `${apiUrl}${url}`
  }
  return url
}

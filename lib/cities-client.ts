export interface CityCount { city: string; count: number }

// City counts come from the dedicated endpoint. While the backend rolls
// out, fall back to the legacy ?limit=1 harvest (same response shape).
// Pass type="LAND" for land-section counts; default counts exclude LAND
// (mirrors the listing default).
export async function fetchCityCounts(type?: string): Promise<CityCount[]> {
  const qs = type ? `?type=${encodeURIComponent(type)}` : ""
  try {
    const r = await fetch(`/api/properties/cities${qs}`)
    if (r.ok) {
      const d = await r.json()
      return d?.cities || []
    }
  } catch { /* fall through to legacy harvest */ }
  try {
    const r = await fetch(`/api/properties?limit=1${type ? `&type=${encodeURIComponent(type)}` : ""}`)
    if (!r.ok) return []
    const d = await r.json()
    return d?.cities || []
  } catch { return [] }
}

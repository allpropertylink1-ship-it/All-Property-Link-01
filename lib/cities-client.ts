export interface CityCount { city: string; count: number }

// City counts come from the dedicated endpoint. While the backend rolls
// out, fall back to the legacy ?limit=1 harvest (same response shape).
export async function fetchCityCounts(): Promise<CityCount[]> {
  try {
    const r = await fetch("/api/properties/cities")
    if (r.ok) {
      const d = await r.json()
      return d?.cities || []
    }
  } catch { /* fall through to legacy harvest */ }
  try {
    const r = await fetch("/api/properties?limit=1")
    if (!r.ok) return []
    const d = await r.json()
    return d?.cities || []
  } catch { return [] }
}

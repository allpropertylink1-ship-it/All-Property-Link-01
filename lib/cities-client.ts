export interface CityCount { city: string; count: number }

// Mirror of backend/src/lib/cities.ts — keep the two in sync. The city
// column is free-typed, so the API can serve case duplicates ("Nairobi" vs
// "NAIROBI") and junk ("Mombasa 2.70 acre", "2 Bedrooms", street
// addresses). Cleaning client-side too means chips stay sane even when
// the backend roll-out lags behind this deploy.
const JUNK_WORD =
  /\b(bedroom|bedrooms|bedsit|bedsitter|studio|acre|acres|plot|plots|road|roads|street|avenue|drive|estate|estates|court|ward|village|villages|area|areas|highway|along|shrine|corner|market|markets|stage|stop|floor|house|houses)\b/i

function displayCity(cleaned: string): string {
  return cleaned
    .split(" ")
    .map((w) =>
      w
        .split("-")
        .map((p) => (p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : p))
        .join("-"),
    )
    .join(" ")
}

export function cleanCityCounts(rows: CityCount[], limit = 60): CityCount[] {
  const merged = new Map<string, CityCount>()
  for (const row of rows) {
    const raw =
      typeof row?.city === "string" ? row.city.trim().replace(/\s+/g, " ") : ""
    const count =
      typeof row?.count === "number" && row.count > 0 ? Math.floor(row.count) : 0
    if (!raw || raw.length < 2 || raw.length > 26 || count <= 0) continue
    if (/[0-9]/.test(raw)) continue
    if (raw.includes(",")) continue
    if (JUNK_WORD.test(raw)) continue
    // "Kiambu County" / "Kiambu county" fold into "Kiambu".
    const key = raw.toLowerCase().replace(/\s+county$/, "")
    if (key.length < 2) continue
    const prev = merged.get(key)
    if (prev) {
      prev.count += count
    } else {
      merged.set(key, {
        city: displayCity(raw.replace(/\s+county$/i, "")),
        count,
      })
    }
  }
  return Array.from(merged.values()).sort((a, b) => b.count - a.count).slice(0, limit)
}

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
      return cleanCityCounts(d?.cities || [])
    }
  } catch { /* fall through to legacy harvest */ }
  try {
    const r = await fetch(`/api/properties?limit=1${type ? `&type=${encodeURIComponent(type)}` : ""}`)
    if (!r.ok) return []
    const d = await r.json()
    return cleanCityCounts(d?.cities || [])
  } catch { return [] }
}

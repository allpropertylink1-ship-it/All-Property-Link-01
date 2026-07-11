"use client"

import { useRef, useEffect, useState } from "react"
import { MapPin, Loader2, AlertCircle, Search } from "lucide-react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface LocationResult {
  lat: number
  lng: number
  address: string
  city: string
  region: string
  country: string
}

interface Props {
  initialAddress?: string
  initialLat?: number | null
  initialLng?: number | null
  onLocationChange: (location: LocationResult) => void
}

interface Suggestion {
  display_name: string
  lat: string
  lon: string
  type: string
}

const pinIcon = L.divIcon({
  className: "",
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40" fill="none"><path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="#0d9488"/><circle cx="16" cy="16" r="7" fill="#fff"/></svg>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
})

const nairobi: [number, number] = [-1.2921, 36.8219]

function parseCoordinates(input: string): { lat: number; lng: number } | null {
  const trimmed = input.trim()

  // Try decimal degrees: " -1.2921, 36.8219" or " -1.2921 36.8219"
  const decimalRe = /^\s*([+-]?\d+\.?\d*)\s*[,/\s]\s*([+-]?\d+\.?\d*)\s*$/
  const decimalMatch = trimmed.match(decimalRe)
  if (decimalMatch) {
    const lat = parseFloat(decimalMatch[1])
    const lng = parseFloat(decimalMatch[2])
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return { lat, lng }
  }

  // Try decimal with direction: "1.2921 S, 36.8219 E" or " 1.2921S  36.8219E"
  const decimalDirRe = /^\s*([+-]?\d+\.?\d*)\s*°?\s*([NSEWnsew])\s*[,/\s]\s*([+-]?\d+\.?\d*)\s*°?\s*([NSEWnsew])\s*$/
  const decimalDirMatch = trimmed.match(decimalDirRe)
  if (decimalDirMatch) {
    let lat = parseFloat(decimalDirMatch[1])
    let lng = parseFloat(decimalDirMatch[3])
    if (decimalDirMatch[2].toUpperCase() === "S") lat = -lat
    if (decimalDirMatch[4].toUpperCase() === "W") lng = -lng
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return { lat, lng }
  }

  // Try DMS: "1°18'30.6\"S 36°53'50.9\"E"
  const dmsRe = /^(\d+)\s*°\s*(\d+)\s*['′]\s*(\d+\.?\d*)\s*["″]\s*([NSEWnsew])\s*[,/\s]\s*(\d+)\s*°\s*(\d+)\s*['′]\s*(\d+\.?\d*)\s*["″]\s*([NSEWnsew])\s*$/
  const dmsMatch = trimmed.match(dmsRe)
  if (dmsMatch) {
    const lat = toDecimal(parseInt(dmsMatch[1]), parseInt(dmsMatch[2]), parseFloat(dmsMatch[3]), dmsMatch[4])
    const lng = toDecimal(parseInt(dmsMatch[5]), parseInt(dmsMatch[6]), parseFloat(dmsMatch[7]), dmsMatch[8])
    if (lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return { lat, lng }
  }

  // Try DMS with spaces: "1° 18' 30.6\" S, 36° 53' 50.9\" E"  (more loosely formatted)
  const dmsLooseRe = /^(\d+)\s*°\s*(\d+)\s*['′]\s*(\d+\.?\d*)\s*["″]?\s*([NSEWnsew])\s*(?:\s|,\s)*(\d+)\s*°\s*(\d+)\s*['′]\s*(\d+\.?\d*)\s*["″]?\s*([NSEWnsew])\s*$/
  const dmsLooseMatch = trimmed.match(dmsLooseRe)
  if (dmsLooseMatch) {
    const lat = toDecimal(parseInt(dmsLooseMatch[1]), parseInt(dmsLooseMatch[2]), parseFloat(dmsLooseMatch[3]), dmsLooseMatch[4])
    const lng = toDecimal(parseInt(dmsLooseMatch[5]), parseInt(dmsLooseMatch[6]), parseFloat(dmsLooseMatch[7]), dmsLooseMatch[8])
    if (lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return { lat, lng }
  }

  return null
}

function toDecimal(deg: number, min: number, sec: number, dir: string): number | null {
  if (deg < 0 || min >= 60 || sec >= 60) return null
  let decimal = deg + min / 60 + sec / 3600
  if (dir.toUpperCase() === "S" || dir.toUpperCase() === "W") decimal = -decimal
  return decimal
}

export function LocationPicker({ initialAddress, initialLat, initialLng, onLocationChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [query, setQuery] = useState(initialAddress || "")
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!mapRef.current) return

    const map = L.map(mapRef.current, {
      center: nairobi,
      zoom: 12,
      zoomControl: false,
    })

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> <a href="https://carto.com/">CARTO</a>',
    }).addTo(map)

    map.on("click", (e: L.LeafletMouseEvent) => {
      placeMarker(e.latlng.lat, e.latlng.lng)
      reverseGeocode(e.latlng.lat, e.latlng.lng)
    })

    mapInstanceRef.current = map
    setStatus("ready")
    setTimeout(() => map.invalidateSize(), 100)

    if (initialLat && initialLng) {
      const lat = Number(initialLat)
      const lng = Number(initialLng)
      map.setView([lat, lng], 15)
      placeMarker(lat, lng)
    }

    return () => { map.remove() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function placeMarker(lat: number, lng: number) {
    const map = mapInstanceRef.current
    if (!map) return
    if (markerRef.current) markerRef.current.remove()

    const marker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map)
    marker.on("dragend", () => {
      const pos = marker.getLatLng()
      reverseGeocode(pos.lat, pos.lng)
    })
    markerRef.current = marker
  }

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      )
      const data = await res.json()
      if (!data || data.error) return

      const addr = data.address || {}
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || ""
      const region = addr.state || ""
      const country = addr.country || "Kenya"
      const road = addr.road || ""
      const number = addr.house_number || ""
      const displayName = data.display_name || ""
      const shortAddress = [road, number].filter(Boolean).join(" ") || city

      setQuery(displayName)

      onLocationChange({
        lat,
        lng,
        address: shortAddress || displayName,
        city,
        region,
        country,
      })
    } catch {
    }
  }

  function handleInputChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.length < 3) {
      setShowSuggestions(false)
      return
    }

    const coords = parseCoordinates(value)
    if (coords) {
      setShowSuggestions(false)
      mapInstanceRef.current?.setView([coords.lat, coords.lng], 18)
      placeMarker(coords.lat, coords.lng)
      reverseGeocode(coords.lat, coords.lng)
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5&countrycodes=ke`,
          { headers: { "Accept-Language": "en" } }
        )
        const data: Suggestion[] = await res.json()
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      } catch {
        setShowSuggestions(false)
      }
    }, 300)
  }

  function selectSuggestion(s: Suggestion) {
    const lat = parseFloat(s.lat)
    const lng = parseFloat(s.lon)
    setQuery(s.display_name)
    setShowSuggestions(false)
    mapInstanceRef.current?.setView([lat, lng], 15)
    placeMarker(lat, lng)
    reverseGeocode(lat, lng)
  }

  return (
    <div className="space-y-3 relative">
      <div className="relative">
        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary z-10" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const coords = parseCoordinates(query)
              if (coords) {
                e.preventDefault()
                setShowSuggestions(false)
                mapInstanceRef.current?.setView([coords.lat, coords.lng], 18)
                placeMarker(coords.lat, coords.lng)
                reverseGeocode(coords.lat, coords.lng)
              }
            }
          }}
          placeholder="Search for a location or paste coordinates..."
          className="w-full rounded-lg border border-border bg-surface pl-9 pr-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-20 w-full rounded-lg border border-border bg-surface shadow-lg max-h-60 overflow-y-auto -mt-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectSuggestion(s)}
              className="flex items-start gap-2 w-full px-3 py-2.5 text-left text-sm text-text-primary hover:bg-surface-secondary transition-colors border-b border-border last:border-0"
            >
              <Search size={14} className="mt-0.5 shrink-0 text-text-secondary" />
              <span className="line-clamp-2">{s.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {status === "loading" && (
        <div className="flex h-64 w-full items-center justify-center rounded-lg border border-border bg-surface/50">
          <div className="flex flex-col items-center gap-2 text-text-secondary">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm">Loading map...</span>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="flex h-64 w-full items-center justify-center rounded-lg border border-border bg-surface/50">
          <div className="flex flex-col items-center gap-2 text-error-500">
            <AlertCircle size={24} />
            <span className="text-sm">Failed to load map</span>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        className="h-64 w-full rounded-lg border border-border z-0"
        style={{ display: status === "ready" ? "block" : "none" }}
      />

      {status === "ready" && (
        <p className="text-xs text-text-secondary">
          Search for a location or click the map to drop a pin. Drag the pin to fine-tune.
        </p>
      )}
    </div>
  )
}

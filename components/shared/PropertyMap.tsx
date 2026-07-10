"use client"

import { useRef, useEffect, useState } from "react"
import { Globe, Loader2 } from "lucide-react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Props {
  lat?: number | string | null
  lng?: number | string | null
  address: string
}

const pinIcon = L.divIcon({
  className: "",
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 32 40" fill="none"><path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="#0d9488"/><circle cx="16" cy="16" r="7" fill="#fff"/></svg>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
})

export function PropertyMap({ lat, lng, address }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [coords, setCoords] = useState<[number, number] | null>(null)
  const mapQuery = encodeURIComponent(address)

  useEffect(() => {
    if (!mapRef.current) return
    const floatLat = lat ? Number(lat) : null
    const floatLng = lng ? Number(lng) : null

    if (floatLat && floatLng) {
      setCoords([floatLat, floatLng])
      return
    }

    fetch(
      `https://nominatim.openstreetmap.org/search?q=${mapQuery}&format=json&limit=1`,
      { headers: { "Accept-Language": "en" } }
    )
      .then((r) => r.json())
      .then((data) => {
        if (data?.[0]) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)])
        } else {
          setStatus("error")
        }
      })
      .catch(() => setStatus("error"))
  }, [])

  useEffect(() => {
    if (!coords || !mapRef.current) return

    const map = L.map(mapRef.current, {
      center: coords,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map)

    L.marker(coords, { icon: pinIcon }).addTo(map)
    setStatus("ready")

    return () => { map.remove() }
  }, [coords])

  if (status === "error") {
    const fallbackUrl = address
      ? `https://www.google.com/maps?q=${mapQuery}&output=embed`
      : `https://www.google.com/maps?q=-1.2921,36.8219&output=embed`
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <iframe
          title="Property location"
          src={fallbackUrl}
          width="260"
          height="200"
          className="w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a
          href={`https://www.google.com/maps?q=${mapQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 border-t border-border px-3 py-2.5 text-xs font-medium text-primary-600 hover:bg-surface-secondary transition-colors"
        >
          <Globe size={12} />
          View on Google Maps
        </a>
      </div>
    )
  }

  if (status === "loading" || !coords) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center rounded-xl border border-border bg-surface/50">
        <Loader2 size={20} className="animate-spin text-text-secondary" />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div ref={mapRef} className="h-[200px] w-full" />
      <a
        href={`https://www.google.com/maps?q=${coords[0]},${coords[1]}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 border-t border-border px-3 py-2.5 text-xs font-medium text-primary-600 hover:bg-surface-secondary transition-colors"
      >
        <Globe size={12} />
        View on Google Maps
      </a>
    </div>
  )
}

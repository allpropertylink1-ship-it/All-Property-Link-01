"use client"

import { useRef, useEffect, useState } from "react"
import { Globe } from "lucide-react"

interface Props {
  lat?: number | string | null
  lng?: number | string | null
  address: string
}

type MapStatus = "loading" | "ready" | "geocoding" | "error" | "no-key"

export function PropertyMap({ lat, lng, address }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const [status, setStatus] = useState<MapStatus>("loading")
  const mapQuery = encodeURIComponent(address)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) { setStatus("no-key"); return }

    if (typeof google !== "undefined" && google.maps?.places) {
      setStatus("ready")
      return
    }

    const w = window as { __gmapsCallbacks?: Array<() => void> }
    w.__gmapsCallbacks = w.__gmapsCallbacks || []

    if (w.__gmapsCallbacks.length > 0) {
      w.__gmapsCallbacks.push(() => setStatus("ready"))
      return
    }

    w.__gmapsCallbacks.push(() => setStatus("ready"))

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__gmapsLoaded`
    script.async = true
    script.defer = true
    script.onerror = () => { setStatus("error") }

    ;(window as unknown as Record<string, unknown>).__gmapsLoaded = () => {
      ;(w.__gmapsCallbacks || []).forEach((fn) => fn())
      w.__gmapsCallbacks = []
    }

    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return

    const floatLat = lat ? Number(lat) : null
    const floatLng = lng ? Number(lng) : null

    if (floatLat && floatLng) {
      initMap(floatLat, floatLng)
      return
    }

    setStatus("geocoding")
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ address }, (results, geocodeStatus) => {
      if (geocodeStatus === "OK" && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location
        initMap(loc.lat(), loc.lng())
      } else {
        setStatus("error")
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  function initMap(latValue: number, lngValue: number) {
    if (!mapRef.current) return
    const position = { lat: latValue, lng: lngValue }
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: position,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      })
    } else {
      mapInstanceRef.current.setCenter(position)
    }
    if (markerRef.current) markerRef.current.setMap(null)
    markerRef.current = new google.maps.Marker({
      position,
      map: mapInstanceRef.current,
      title: address,
    })
    setStatus("ready")
  }

  if (status === "no-key" || status === "error") {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <iframe
          title="Property location on Google Maps"
          src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
          width="260"
          height="200"
          className="w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a
          href={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14`}
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

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div ref={mapRef} className="h-[200px] w-full" />
      <a
        href={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14`}
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

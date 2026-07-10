"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { MapPin, Loader2, AlertCircle } from "lucide-react"

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

export function LocationPicker({ initialAddress, initialLat, initialLng, onLocationChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [query, setQuery] = useState(initialAddress || "")
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "no-key">("loading")

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

  const initMap = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return
    const position = { lat, lng }

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: position,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      })

      mapInstanceRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          placeMarker(e.latLng.lat(), e.latLng.lng())
          reverseGeocode(e.latLng.lat(), e.latLng.lng())
        }
      })
    } else {
      mapInstanceRef.current.setCenter(position)
    }

    placeMarker(lat, lng)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  function placeMarker(lat: number, lng: number) {
    if (!mapInstanceRef.current) return
    if (markerRef.current) markerRef.current.setMap(null)

    markerRef.current = new google.maps.Marker({
      position: { lat, lng },
      map: mapInstanceRef.current,
      draggable: true,
      animation: google.maps.Animation.DROP,
    })

    markerRef.current.addListener("dragend", () => {
      const pos = markerRef.current?.getPosition()
      if (pos) reverseGeocode(pos.lat(), pos.lng())
    })
  }

  function reverseGeocode(lat: number, lng: number) {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ location: { lat, lng } }, (results, geocodeStatus) => {
      if (geocodeStatus !== "OK" || !results?.[0]) return

      const components = results[0].address_components || []
      const getComponent = (types: string[]) =>
        components.find((c) => types.some((t) => c.types.includes(t)))?.long_name || ""

      const city = getComponent(["locality", "administrative_area_level_2", "sublocality"])
      const region = getComponent(["administrative_area_level_1"])
      const country = getComponent(["country"])
      const number = getComponent(["street_number"])
      const road = getComponent(["route"])
      const address = results[0].formatted_address

      setQuery(address)

      onLocationChange({
        lat,
        lng,
        address: `${road} ${number}`.trim() || address,
        city: city || getComponent(["sublocality"]),
        region,
        country,
      })
    })
  }

  useEffect(() => {
    if (status !== "ready" || !inputRef.current) return

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "KE" },
    })

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace()
      if (!place?.geometry?.location) return

      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      const city = place.address_components?.find((c) =>
        c.types.includes("locality") || c.types.includes("administrative_area_level_2")
      )?.long_name || place.name || ""

      const region = place.address_components?.find((c) =>
        c.types.includes("administrative_area_level_1")
      )?.long_name || ""

      const country = place.address_components?.find((c) =>
        c.types.includes("country")
      )?.long_name || "Kenya"

      const number = place.address_components?.find((c) => c.types.includes("street_number"))?.long_name || ""
      const road = place.address_components?.find((c) => c.types.includes("route"))?.long_name || ""
      const address = `${road} ${number}`.trim() || place.formatted_address || query

      setQuery(place.formatted_address || query)
      initMap(lat, lng)

      onLocationChange({ lat, lng, address, city, region, country })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    if (status !== "ready" || !initialLat || !initialLng) return
    initMap(Number(initialLat), Number(initialLng))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return (
    <div className="space-y-3">
      <div className="relative">
        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a location..."
          className="w-full rounded-lg border border-border bg-surface pl-9 pr-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-300/20"
        />
      </div>

      {status === "loading" && (
        <div className="flex h-64 w-full items-center justify-center rounded-lg border border-border bg-surface/50">
          <div className="flex flex-col items-center gap-2 text-text-secondary">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm">Loading map...</span>
          </div>
        </div>
      )}

      {status === "no-key" && (
        <div className="flex h-64 w-full items-center justify-center rounded-lg border border-border bg-surface/50">
          <p className="text-sm text-text-secondary">Map not available</p>
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
        className="h-64 w-full rounded-lg border border-border"
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

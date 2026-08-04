"use client"

import { useEffect, useState } from "react"
import { FeaturedSection } from "./FeaturedSection"
import { ProfileCard, type ProfileRow } from "./ProfileCard"

export function FeaturedProviders() {
  const [services, setServices] = useState<ProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/services?type=SERVICE_PROVIDER&limit=6")
      .then((r) => {
        if (!r.ok) throw new Error(`Status ${r.status}`)
        return r.json()
      })
      .then((data: { services: ProfileRow[] }) => {
        setServices((data.services || []).filter((s) => s.user))
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  return (
    <FeaturedSection
      title="Service Providers"
      viewAllHref="/services"
      loading={loading}
      error={error ?? undefined}
      emptyMessage={
        !loading && !error && services.length === 0
          ? "No service providers yet."
          : undefined
      }
    >
      {services.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {services.map((s) => (
            <ProfileCard key={s.id} item={s} variant="provider" />
          ))}
        </div>
      )}
    </FeaturedSection>
  )
}

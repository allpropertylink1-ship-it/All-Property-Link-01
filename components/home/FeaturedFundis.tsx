"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "@/components/ui/icons"
import { FormBanner } from "@/components/shared/FormFeedback"
import { ProfileCard, type ProfileRow } from "./ProfileCard"

export function FeaturedFundis({ initialData }: { initialData?: ProfileRow[] }) {
  const [services, setServices] = useState<ProfileRow[]>(initialData || [])
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) return
    fetch("/api/services?type=FUNDI&limit=6")
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
  }, [initialData])

  return (
    <section aria-labelledby="home-fundis-heading" className="bg-surface-secondary">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-600">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent-500" />
              Vetted National Artisan Registry
            </p>
            <h2 id="home-fundis-heading" className="font-heading text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Verified Fundis &amp; Specialized Technicians
            </h2>
            <p className="mt-1 max-w-text text-sm text-text-secondary">
              Identity-checked, trade-certified Kenyan specialists ready for immediate deployment.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex min-h-touch shrink-0 items-center gap-1.5 rounded-xl bg-surface px-4 py-2 text-sm font-semibold text-text-primary shadow-sm transition-colors hover:bg-primary hover:text-text-onPrimary"
          >
            Browse All Trades
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3" aria-busy="true" aria-label="Loading verified fundis">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex animate-pulse flex-col items-center rounded-lg border border-border bg-surface px-4 py-6">
                <div className="mb-4 h-20 w-20 rounded-full bg-surface-secondary" />
                <div className="h-4 w-2/3 rounded bg-surface-secondary" />
                <div className="mt-2 h-3 w-1/2 rounded bg-surface-secondary" />
              </div>
            ))}
          </div>
        ) : error ? (
          <FormBanner variant="error">Could not load verified fundis: {error}</FormBanner>
        ) : services.length === 0 ? (
          <p role="status" className="py-8 text-center text-sm text-text-secondary">
            No fundis listed yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {services.map((s) => (
              <ProfileCard key={s.id} item={s} variant="fundi" />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

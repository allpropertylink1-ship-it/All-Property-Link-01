"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, MessageCircle, Phone } from "@/components/ui/icons"
import { FormBanner } from "@/components/shared/FormFeedback"
import { ProfileCard, type ProfileRow } from "./ProfileCard"
import { SectionHeading } from "./SectionHeading"

function displayName(item: ProfileRow) {
  if (item.user.companyName) return item.user.companyName
  return `${item.user.firstName} ${item.user.lastName}`
}

/** Real phone only — never invented. Returns trimmed source or null. */
function getPhone(item: ProfileRow): string | null {
  const phone = (item.user as ProfileRow["user"] & { phone?: string | null }).phone
  return typeof phone === "string" && phone.trim() ? phone.trim() : null
}

/** wa.me needs full international digits; 0-prefixed Kenyan numbers become 254…. */
function whatsappDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, "")
  if (!digits) return null
  const normalized = digits.startsWith("0") ? `254${digits.slice(1)}` : digits
  return normalized.length >= 12 ? normalized : null
}

function ContactButtons({ phone, label }: { phone: string; label: string }) {
  const wa = whatsappDigits(phone)
  return (
    <div className={wa ? "mt-2 grid grid-cols-2 gap-2" : "mt-2"}>
      <a
        href={`tel:${phone}`}
        aria-label={`Call ${label}`}
        className="inline-flex min-h-touch w-full items-center justify-center gap-1 rounded-lg bg-surface-secondary px-2 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-primary hover:text-text-onPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Phone size={14} aria-hidden="true" />
        Call
      </a>
      {wa && (
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp ${label}`}
          className="inline-flex min-h-touch w-full items-center justify-center gap-1 rounded-lg bg-whatsapp px-2 py-2 text-xs font-bold text-white transition-colors hover:bg-whatsapp-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <MessageCircle size={14} aria-hidden="true" />
          WhatsApp
        </a>
      )}
    </div>
  )
}

function ProfileFallback({ id, label }: { id: string; label: string }) {
  return (
    <Link
      href={`/services/${id}`}
      aria-label={`View ${label} details`}
      className="mt-2 inline-flex min-h-touch w-full items-center justify-center gap-1 rounded-lg bg-surface-secondary px-2 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-primary hover:text-text-onPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      View Profile
    </Link>
  )
}

export function FeaturedProviders({ initialData }: { initialData?: ProfileRow[] }) {
  const [services, setServices] = useState<ProfileRow[]>(initialData || [])
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) return
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
  }, [initialData])

  return (
    <section aria-labelledby="home-providers-heading" className="bg-surface">
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="home-providers-heading"
            eyebrow="Hire with confidence"
            title="Service Providers"
            subtitle="Cleaning, moving, security & more"
          />
          <Link
            href="/services"
            className="inline-flex min-h-touch shrink-0 items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            View All Providers
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6" aria-busy="true" aria-label="Loading service providers">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex animate-pulse flex-col items-center rounded-lg border border-border bg-surface px-4 py-6">
                <div className="mb-4 h-20 w-20 rounded-full bg-surface-secondary" />
                <div className="h-4 w-2/3 rounded bg-surface-secondary" />
                <div className="mt-2 h-3 w-1/2 rounded bg-surface-secondary" />
              </div>
            ))}
          </div>
        ) : error ? (
          <FormBanner variant="error">Could not load service providers: {error}</FormBanner>
        ) : services.length === 0 ? (
          <p role="status" className="py-8 text-center text-sm text-text-secondary">
            No service providers yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 items-stretch gap-4 md:grid-cols-3 xl:grid-cols-6">
            {services.map((s) => {
              const phone = getPhone(s)
              return (
                <div key={s.id} className="flex min-w-0 flex-1 flex-col items-stretch">
                  <ProfileCard item={s} variant="provider" />
                  {phone ? (
                    <ContactButtons phone={phone} label={displayName(s)} />
                  ) : (
                    <ProfileFallback id={s.id} label={displayName(s)} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

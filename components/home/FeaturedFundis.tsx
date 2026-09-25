"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Briefcase, MessageCircle, Phone } from "@/components/ui/icons"
import { FormBanner } from "@/components/shared/FormFeedback"
import { ProfileCard, type ProfileRow } from "./ProfileCard"
import { getTradeLabel } from "@/lib/trade-label"

function displayName(item: ProfileRow) {
  if (item.user.companyName) return item.user.companyName
  return `${item.user.firstName} ${item.user.lastName}`
}

/** Real phone only — never invented. Returns trimmed digits source or null. */
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
        className="inline-flex min-h-touch items-center justify-center gap-1 rounded-lg bg-surface-secondary px-2 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-primary hover:text-text-onPrimary"
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
          className="inline-flex min-h-touch items-center justify-center gap-1 rounded-lg bg-whatsapp px-2 py-2 text-xs font-bold text-white transition-colors hover:bg-whatsapp-dark"
        >
          <MessageCircle size={14} aria-hidden="true" />
          WhatsApp
        </a>
      )}
    </div>
  )
}

function ServicePill({ item }: { item: ProfileRow }) {
  const name = displayName(item)
  const tradeLabel = getTradeLabel(item.category, item.title)
  return (
    <Link
      href={`/services/${item.id}`}
      aria-label={`View ${name}${tradeLabel ? ` — ${tradeLabel}` : ""}`}
      className="flex min-h-touch items-center gap-2 rounded-xl bg-surface-secondary p-3 transition-colors hover:bg-primary/5"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-primary shadow-sm" aria-hidden="true">
        <Briefcase size={18} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-bold text-text-primary">{name}</span>
        <span className="block truncate text-xs text-text-secondary">
          {tradeLabel || item.title}
        </span>
      </span>
    </Link>
  )
}

export function FeaturedFundis({
  initialData,
  servicePills,
}: {
  initialData?: ProfileRow[]
  servicePills?: ProfileRow[]
}) {
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
            <h2 id="home-fundis-heading" className="font-heading text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Verified Fundis &amp; Specialized Technicians
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex min-h-touch shrink-0 items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-accent-600"
          >
            View All Fundis
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6" aria-busy="true" aria-label="Loading verified fundis">
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
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
              {services.map((s) => {
                const phone = getPhone(s)
                return (
                  <div key={s.id} className="flex min-w-0 flex-col">
                    <ProfileCard item={s} variant="fundi" />
                    {phone && <ContactButtons phone={phone} label={displayName(s)} />}
                  </div>
                )
              })}
            </div>
            {servicePills && servicePills.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 md:hidden" aria-label="More professional services">
                {servicePills.slice(0, 2).map((s) => (
                  <ServicePill key={s.id} item={s} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

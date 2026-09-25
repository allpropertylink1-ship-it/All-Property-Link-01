"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Building2, Home, Tent, Trees, Wrench, ConciergeBell, LayoutDashboard } from "@/components/ui/icons"
import { getProperties } from "@/lib/services/property"
import { getServiceListings } from "@/lib/services/service"

interface Category {
  readonly title: string
  readonly href: string
  readonly icon: typeof Building2
  readonly desc: string
  readonly count?: number
}

const categoryConfigs: readonly Omit<Category, "count">[] = [
  {
    title: "For Sale",
    href: "/properties?purpose=FOR_SALE",
    icon: Building2,
    desc: "Houses & apartments",
  },
  {
    title: "For Rent",
    href: "/properties?purpose=FOR_RENT_LONG_TERM",
    icon: Home,
    desc: "Long-term rentals",
  },
  {
    title: "Airbnbs",
    href: "/airbnbs",
    icon: Tent,
    desc: "Short-term stays",
  },
  {
    title: "Plots & Land",
    href: "/land",
    icon: Trees,
    desc: "Land for sale",
  },
  {
    title: "Fundis",
    href: "/fundis",
    icon: Wrench,
    desc: "Skilled trades",
  },
  {
    title: "Services",
    href: "/services",
    icon: ConciergeBell,
    desc: "Property services",
  },
]

function CategoryPill({
  href,
  icon: Icon,
  title,
  desc,
  count,
}: {
  href: string
  icon: typeof Building2
  title: string
  desc: string
  count?: number
}) {
  return (
    <Link
      href={href}
      aria-label={`${title}: ${desc}`}
      className="flex min-h-touch shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium bg-surface text-text-primary shadow-sm hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors"
    >
      <Icon size={16} className="text-primary" aria-hidden="true" />
      <span>{title}</span>
      {count !== undefined && (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary-700">
          {count}
        </span>
      )}
    </Link>
  )
}

export function CategoryGrid() {
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [saleRent, airbnbs, land, fundis, providers] = await Promise.all([
          getProperties({ purpose: "FOR_SALE", pageSize: 1 }),
          getProperties({ purpose: "FOR_RENT_SHORT_TERM", pageSize: 1 }),
          getProperties({ propertyType: "LAND", pageSize: 1 }),
          getServiceListings({ type: "FUNDI", limit: "1" }),
          getServiceListings({ type: "SERVICE_PROVIDER", limit: "1" }),
        ])
        setCounts({
          "For Sale": saleRent.total,
          "For Rent": (await getProperties({ purpose: "FOR_RENT_LONG_TERM", pageSize: 1 })).total,
          "Airbnbs": airbnbs.total,
          "Plots & Land": land.total,
          "Fundis": fundis.total,
          "Services": providers.total,
        })
      } catch {
        // ignore count errors
      }
    }
    fetchCounts()
  }, [])

  const categoriesWithCounts = categoryConfigs.map(cat => ({
    ...cat,
    count: counts[cat.title],
  }))

  return (
    <section className="py-10 sm:py-14">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-bold text-text-primary sm:text-3xl">
            Browse by Category
          </h2>
          <p className="text-sm text-text-secondary">
            Find exactly what you&apos;re looking for
          </p>
        </div>

        {/* Mobile: 2-column vertical stacks */}
        <div className="grid grid-cols-2 gap-6 lg:hidden">
          <div className="space-y-3">
            <h3 className="font-heading text-lg font-semibold text-text-primary">Properties</h3>
            <div className="flex flex-col gap-2" role="list" aria-label="Property categories">
              {categoriesWithCounts
                .filter(c => ["For Sale", "For Rent", "Airbnbs", "Plots & Land"].includes(c.title))
                .map((cat) => (
                  <CategoryPill key={cat.title} {...cat} />
                ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-heading text-lg font-semibold text-text-primary">Services</h3>
            <div className="flex flex-col gap-2" role="list" aria-label="Service categories">
              {categoriesWithCounts
                .filter(c => ["Fundis", "Services"].includes(c.title))
                .map((cat) => (
                  <CategoryPill key={cat.title} {...cat} />
                ))}
            </div>
          </div>
        </div>

        {/* Desktop: horizontal wrapping pills */}
        <div className="hidden lg:block space-y-6">
          <div>
            <h3 className="mb-3 font-heading text-lg font-semibold text-text-primary">Properties</h3>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Property categories">
              {categoriesWithCounts
                .filter(c => ["For Sale", "For Rent", "Airbnbs", "Plots & Land"].includes(c.title))
                .map((cat) => (
                  <CategoryPill key={cat.title} {...cat} />
                ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-heading text-lg font-semibold text-text-primary">Services</h3>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Service categories">
              {categoriesWithCounts
                .filter(c => ["Fundis", "Services"].includes(c.title))
                .map((cat) => (
                  <CategoryPill key={cat.title} {...cat} />
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
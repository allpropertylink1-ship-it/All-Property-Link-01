"use client"

import Link from "next/link"
import { Building2, Home, Tent, Trees, Wrench, ConciergeBell, LayoutDashboard } from "@/components/ui/icons"

interface Category {
  readonly title: string
  readonly filterKey: string
  readonly filterType: "purpose" | "type" | "serviceType"
  readonly icon: typeof Building2
  readonly desc: string
}

const categories: readonly Category[] = [
  {
    title: "For Sale",
    filterKey: "FOR_SALE",
    filterType: "purpose",
    icon: Building2,
    desc: "Houses & apartments",
  },
  {
    title: "For Rent",
    filterKey: "FOR_RENT_LONG_TERM",
    filterType: "purpose",
    icon: Home,
    desc: "Long-term rentals",
  },
  {
    title: "Short-Term",
    filterKey: "FOR_RENT_SHORT_TERM",
    filterType: "purpose",
    icon: Tent,
    desc: "Airbnbs & vacation",
  },
  {
    title: "Land & Plots",
    filterKey: "LAND",
    filterType: "type",
    icon: Trees,
    desc: "Development land",
  },
  {
    title: "Fundis",
    filterKey: "FUNDI",
    filterType: "serviceType",
    icon: Wrench,
    desc: "Skilled trades",
  },
  {
    title: "Services",
    filterKey: "SERVICE_PROVIDER",
    filterType: "serviceType",
    icon: ConciergeBell,
    desc: "Property services",
  },
]

function hrefFor(category: Category): string {
  const baseHref = category.filterType === "serviceType" ? "/services" : "/browse"
  const param =
    category.filterType === "purpose"
      ? "purpose"
      : category.filterType === "type"
        ? "type"
        : "serviceType"
  return `${baseHref}?${param}=${category.filterKey}`
}

function CategoryPill({
  href,
  icon: Icon,
  title,
  desc,
  active = false,
}: {
  href: string
  icon: typeof Building2
  title: string
  desc: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      aria-label={`${title}: ${desc}`}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-touch shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition-colors ${
        active
          ? "bg-primary text-text-onPrimary"
          : "bg-surface text-text-primary hover:bg-surface-secondary"
      }`}
    >
      <Icon size={16} className={active ? "" : "text-primary"} aria-hidden="true" />
      <span>{title}</span>
    </Link>
  )
}

export function CategoryGrid() {
  return (
    <section aria-label="Browse categories" className="hidden bg-surface pb-2 pt-8 sm:pt-10 md:block">
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="sr-only">Browse by category</h2>
        {/* Mobile: horizontal snap rail (Stitch) — Desktop: wrapping row */}
        <div
          className="flex snap-x snap-mandatory items-center gap-2 overflow-x-auto py-1 scrollbar-hide lg:snap-none lg:flex-wrap lg:overflow-visible"
          role="list"
          aria-label="Property and service categories"
        >
          <div role="listitem" className="snap-start shrink-0">
            <CategoryPill href="/browse" icon={LayoutDashboard} title="All" desc="Everything on All Property Link" active />
          </div>
          {categories.map((cat) => (
            <div key={cat.title} role="listitem" className="snap-start shrink-0">
              <CategoryPill href={hrefFor(cat)} icon={cat.icon} title={cat.title} desc={cat.desc} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

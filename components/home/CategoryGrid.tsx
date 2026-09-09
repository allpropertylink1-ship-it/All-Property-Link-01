"use client"

import Link from "next/link"
import { Building2, Home, Tent, Trees, Wrench, ConciergeBell } from "@/components/ui/icons"

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

function CategoryPill({ category, isService = false }: { category: Category; isService?: boolean }) {
  const baseHref = isService ? "/services" : "/browse"
  const param = category.filterType === "purpose" ? "purpose" : category.filterType === "type" ? "type" : "serviceType"

  return (
    <Link
      href={`${baseHref}?${param}=${category.filterKey}`}
      className="flex h-[36px] items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-medium text-text-secondary transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-sm"
      aria-label={`${category.title}: ${category.desc}`}
    >
      <category.icon size={14} className="shrink-0" />
      <span>{category.title}</span>
    </Link>
  )
}

export function CategoryGrid() {
  const propertyCategories = categories.filter(c => c.filterType === "purpose" || c.filterType === "type")
  const serviceCategories = categories.filter(c => c.filterType === "serviceType")

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

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-heading text-lg font-semibold text-text-primary">Properties</h3>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Property categories">
              {propertyCategories.map((cat) => (
                <CategoryPill key={cat.title} category={cat} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-heading text-lg font-semibold text-text-primary">Services</h3>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Service categories">
              {serviceCategories.map((cat) => (
                <CategoryPill key={cat.title} category={cat} isService />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
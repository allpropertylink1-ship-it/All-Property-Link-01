"use client"
import Link from "next/link"
import { Building2, Home, Tent, Trees, Wrench, ConciergeBell, UserCheck } from "@/components/ui/icons"

const categories = [
  { title: "For Sale", href: "/browse?type=sale", icon: Building2, desc: "Houses & apartments" },
  { title: "For Rent", href: "/browse?type=rent", icon: Home, desc: "Long-term rentals" },
  { title: "Short-Term", href: "/browse?type=short-term", icon: Tent, desc: "Airbnbs & vacation" },
  { title: "Land & Plots", href: "/browse?type=land", icon: Trees, desc: "Development land" },
  { title: "Fundis", href: "/services?category=fundi", icon: Wrench, desc: "Skilled trades" },
  { title: "Services", href: "/services", icon: ConciergeBell, desc: "Property services" },
  { title: "Agents", href: "/agents", icon: UserCheck, desc: "APL representatives" },
]

export function CategoryGrid() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">Browse by Category</h2>
        <p className="mb-8 text-sm text-muted">Find exactly what you&apos;re looking for</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <Link key={cat.title} href={cat.href}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{cat.title}</p>
                  <p className="text-xs text-muted">{cat.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

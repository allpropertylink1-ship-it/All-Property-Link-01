"use client"
import Link from "next/link"
import { Building2, Home, Tent, Trees, Wrench, ConciergeBell } from "@/components/ui/icons"

const PEXELS = "https://images.pexels.com/photos"
const IMG = "?auto=compress&cs=tinysrgb&w=600"

const categories = [
  {
    title: "For Sale",
    href: "/browse?type=sale",
    icon: Building2,
    desc: "Houses & apartments",
    img: `${PEXELS}/8482510/pexels-photo-8482510.jpeg${IMG}`,
    alt: "Modern house with a For Sale sign in front yard",
  },
  {
    title: "For Rent",
    href: "/browse?type=rent",
    icon: Home,
    desc: "Long-term rentals",
    img: `${PEXELS}/358636/pexels-photo-358636.jpeg${IMG}`,
    alt: "Residential apartment building facade under a blue sky",
  },
  {
    title: "Short-Term",
    href: "/browse?type=short-term",
    icon: Tent,
    desc: "Airbnbs & vacation",
    img: `${PEXELS}/164595/pexels-photo-164595.jpeg${IMG}`,
    alt: "Cozy hotel bedroom with elegant decor and soft lighting",
  },
  {
    title: "Land & Plots",
    href: "/browse?type=land",
    icon: Trees,
    desc: "Development land",
    img: `${PEXELS}/17935676/pexels-photo-17935676.jpeg${IMG}`,
    alt: "Lush green countryside field under a bright blue sky",
  },
  {
    title: "Fundis",
    href: "/services?category=fundi",
    icon: Wrench,
    desc: "Skilled trades",
    img: `${PEXELS}/8829888/pexels-photo-8829888.jpeg${IMG}`,
    alt: "Carpenter working on a wooden roof frame",
  },
  {
    title: "Services",
    href: "/services",
    icon: ConciergeBell,
    desc: "Property services",
    img: `${PEXELS}/1036863/pexels-photo-1036863.jpeg${IMG}`,
    alt: "Worker painting a building exterior wall",
  },
]

export function CategoryGrid() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
          Browse by Category
        </h2>
        <p className="mb-8 text-sm text-muted">
          Find exactly what you&apos;re looking for
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className="group relative block overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-secondary">
                  <img
                    src={cat.img}
                    alt={cat.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Bottom gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent transition-colors duration-300 group-hover:from-black/80" />
                  {/* Icon chip */}
                  <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-white/25">
                    <Icon size={18} />
                  </div>
                  {/* Text */}
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="font-heading text-sm font-bold leading-tight text-white sm:text-base">
                      {cat.title}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-tight text-white/80 sm:text-xs">
                      {cat.desc}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

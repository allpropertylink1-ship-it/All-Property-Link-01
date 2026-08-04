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
    img: `${PEXELS}/20693413/pexels-photo-20693413.jpeg${IMG}`,
    alt: "Coastal Kenyan house surrounded by palm trees and lush greenery",
  },
  {
    title: "For Rent",
    href: "/browse?type=rent",
    icon: Home,
    desc: "Long-term rentals",
    img: `${PEXELS}/13418220/pexels-photo-13418220.jpeg${IMG}`,
    alt: "Kenyan coastal town buildings along a lush waterfront",
  },
  {
    title: "Short-Term",
    href: "/browse?type=short-term",
    icon: Tent,
    desc: "Airbnbs & vacation",
    img: `${PEXELS}/14786461/pexels-photo-14786461.jpeg${IMG}`,
    alt: "Tropical palm-fringed beach in Mombasa, Kenya",
  },
  {
    title: "Land & Plots",
    href: "/browse?type=land",
    icon: Trees,
    desc: "Development land",
    img: `${PEXELS}/13751001/pexels-photo-13751001.jpeg${IMG}`,
    alt: "Aerial view of coastal land with ocean and trees in Kilifi, Kenya",
  },
  {
    title: "Fundis",
    href: "/services?category=fundi",
    icon: Wrench,
    desc: "Skilled trades",
    img: `${PEXELS}/16850260/pexels-photo-16850260.jpeg${IMG}`,
    alt: "Carpenter working with wooden planks in a workshop",
  },
  {
    title: "Services",
    href: "/services",
    icon: ConciergeBell,
    desc: "Property services",
    img: `${PEXELS}/30987058/pexels-photo-30987058.jpeg${IMG}`,
    alt: "Motorcycle delivery service on a Nairobi street with vibrant street art",
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

"use client"
import Link from "next/link"
import { Search } from "@/components/ui/icons"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-accent pb-20 pt-16 sm:pb-24 sm:pt-20">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
      <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/5 blur-3xl" />
      <div className="container relative mx-auto max-w-7xl px-4 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
          <span className="flex h-1.5 w-1.5 rounded-full bg-teal-300" />
          Kenya&apos;s Trusted Property Marketplace
        </div>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          Find Your Perfect
          <span className="block text-teal-200">Property in Kenya</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/70 sm:text-lg">
          Browse thousands of properties for sale, rent, and short-term stays across Kenya.
          Connect directly with verified agents and property owners.
        </p>
        <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-1.5 backdrop-blur-sm">
          <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">
            <Search size={18} className="text-white/60" />
            <input
              type="text"
              placeholder="Search by location, property type..."
              className="w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
            />
          </div>
          <Link
            href="/browse"
            className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-teal-50"
          >
            Search
          </Link>
        </div>
      </div>
    </section>
  )
}

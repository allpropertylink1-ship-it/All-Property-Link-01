"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { BlogCategory } from "@/lib/services/blog"

interface BlogHeroProps {
  title: string
  description: string
  categories: BlogCategory[]
  selectedCategory?: string
  searchQuery?: string
}

export default function BlogHero({ title, description, categories, selectedCategory, searchQuery }: BlogHeroProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState(selectedCategory ?? "")

  useEffect(() => {
    setActiveCategory(selectedCategory ?? "")
  }, [selectedCategory])

  function handleCategoryChange(slug: string | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) params.set("category", slug)
    else params.delete("category")
    params.delete("page")
    router.push(`/blog?${params.toString()}`)
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value.trim()
    const params = new URLSearchParams(searchParams.toString())
    if (q) params.set("search", q)
    else params.delete("search")
    params.delete("page")
    router.push(`/blog?${params.toString()}`)
  }

  return (
    <section className="rounded-2xl border border-border bg-primary p-8 lg:p-12 text-white">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold font-heading lg:text-4xl">{title}</h1>
        <p className="mt-2 text-primary/90 text-lg">{description}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <input
            type="search"
            placeholder="Search posts…"
            defaultValue={searchQuery ?? ""}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
          />
        </div>
        <select
          value={activeCategory || ""}
          onChange={(e) => handleCategoryChange(e.target.value || undefined)}
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/blog"
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            !activeCategory ? "bg-white text-primary" : "border border-white/30 bg-white/10 hover:bg-white/20"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/blog?category=${cat.slug}`}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat.slug ? "bg-white text-primary" : "border border-white/30 bg-white/10 hover:bg-white/20"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </section>
  )
}

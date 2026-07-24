"use client"

import { useEffect, useState } from "react"
import { FeaturedSection } from "./FeaturedSection"
import { ServiceCard } from "./ServiceCard"
import { Briefcase } from "@/components/ui/icons"

interface ApiService {
  id: string; title: string; price: string | null; currency: string;
  city: string | null; region: string | null; images: unknown;
  userId: string; categoryId: string;
  category: { id: string; name: string } | null;
  user: { id: string; firstName: string; lastName: string; avatar: string | null; city: string | null };
}

export function FeaturedProviders() {
  const [services, setServices] = useState<ApiService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/services?type=SERVICE_PROVIDER&limit=6")
      .then((r) => { if (!r.ok) throw new Error(`Status ${r.status}`); return r.json() })
      .then((data: { services: ApiService[] }) => {
        setServices((data.services || []).filter((s) => s.user))
        setLoading(false)
      })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [])

  return (
    <FeaturedSection title="Service Providers" viewAllHref="/services" loading={loading} error={error ?? undefined} emptyMessage={!loading && !error && services.length === 0 ? "No service providers yet." : undefined}>
      {services.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => <ServiceCard key={s.id} item={s} icon={Briefcase} />)}
        </div>
      )}
    </FeaturedSection>
  )
}

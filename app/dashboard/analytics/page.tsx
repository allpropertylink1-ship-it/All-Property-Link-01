"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Eye,
  Save,
  Activity,
  Building2,
  ArrowRight,
} from "@/components/ui/icons"
import { cn } from "@/lib/utils"

interface PropertyRow {
  id: string
  slug: string
  title: string
  city: string | null
  propertyType: string
  listingPurpose: string | null
  status: string
  moderationStatus: string
  views: number
  saves: number
  clicks: number
  createdAt: string
}

interface ServiceRow {
  id: string
  title: string
  city: string | null
  region: string | null
  status: string
  moderationStatus: string
  views: number
  saves: number
  clicks: number
  createdAt: string
}

interface AnalyticsSummary {
  totalListings: number
  totalViews: number
  totalSaves: number
  totalClicks: number
}

interface AnalyticsResponse {
  summary: AnalyticsSummary
  properties: PropertyRow[]
  services: ServiceRow[]
}

async function fetchAnalytics(endpoint: string): Promise<AnalyticsResponse | null> {
  try {
    const res = await fetch(`/api${endpoint}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) return null
    return res.json() as Promise<AnalyticsResponse>
  } catch {
    return null
  }
}

export default function AnalyticsPage() {
  const [propData, setPropData] = useState<AnalyticsResponse | null>(null)
  const [svcData, setSvcData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [p, s] = await Promise.all([
        fetchAnalytics("/properties/analytics"),
        fetchAnalytics("/services/analytics"),
      ])
      setPropData(p)
      setSvcData(s)
      setLoading(false)
    }
    load()
  }, [])

  const props = propData?.properties || []
  const svcs = svcData?.services || []
  const totalViews = (propData?.summary.totalViews || 0) + (svcData?.summary.totalViews || 0)
  const totalSaves = (propData?.summary.totalSaves || 0) + (svcData?.summary.totalSaves || 0)
  const totalClicks = (propData?.summary.totalClicks || 0) + (svcData?.summary.totalClicks || 0)
  const totalListings = (propData?.summary.totalListings || 0) + (svcData?.summary.totalListings || 0)

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="flex h-8 w-8 rounded-full border-4 border-surface-secondary border-t-primary-600 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">Analytics</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Views, clicks, and saves across your listings and services
            </p>
          </div>
          <Link
            href="/dashboard/listings"
            className="touch-target inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary"
          >
            Manage Listings <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Summary stats */}
      <section aria-labelledby="overview-heading" className="mx-auto max-w-7xl px-4 sm:p-6">
        <h2 id="overview-heading" className="font-heading text-lg font-bold text-text-primary mb-4">
          Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Eye size={24} className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="font-heading text-2xl font-bold text-text-primary">{totalViews}</p>
                <p className="text-xs text-text-secondary">Total Views</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Save size={24} className="text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="font-heading text-2xl font-bold text-text-primary">{totalSaves}</p>
                <p className="text-xs text-text-secondary">Total Saves</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Activity size={24} className="text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="font-heading text-2xl font-bold text-text-primary">{totalClicks}</p>
                <p className="text-xs text-text-secondary">Total Clicks</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Building2 size={24} className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="font-heading text-2xl font-bold text-text-primary">{totalListings}</p>
                <p className="text-xs text-text-secondary">Total Listings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property listings */}
      {props.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-text-primary">
                Property Listings
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Views, saves, and clicks per listing
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-secondary text-text-secondary">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium text-left">
                    Listing
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-right">
                    Views
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-right">
                    Saves
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-right">
                    Clicks
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-left">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {props.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-secondary">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-text-primary">{p.title}</p>
                        <span className="text-xs text-text-secondary">
                          {p.city}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-primary">
                      {p.views}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-primary">
                      {p.saves}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-primary">
                      {p.clicks}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                          p.moderationStatus !== "APPROVED"
                            ? "bg-amber-500/10 text-amber-700"
                            : p.status === "AVAILABLE"
                              ? "bg-success-500/10 text-success-700"
                              : "bg-surface-secondary text-text-secondary"
                        )}
                      >
                        {p.moderationStatus.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Service listings */}
      {svcs.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-text-primary">
                Service Listings
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Views, saves, and clicks per service
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-secondary text-text-secondary">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium text-left">
                    Service
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-right">
                    Views
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-right">
                    Saves
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-right">
                    Clicks
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-left">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {svcs.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-secondary">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-text-primary">{s.title}</p>
                        <span className="text-xs text-text-secondary">
                          {s.city}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-primary">
                      {s.views}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-primary">
                      {s.saves}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-primary">
                      {s.clicks}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                          s.moderationStatus !== "APPROVED"
                            ? "bg-amber-500/10 text-amber-700"
                            : s.status === "APPROVED"
                              ? "bg-success-500/10 text-success-700"
                              : "bg-surface-secondary text-text-secondary"
                        )}
                      >
                        {s.moderationStatus.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Empty state */}
      {props.length === 0 && svcs.length === 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:p-6">
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="text-sm text-text-secondary">
              No listings or services yet. Start by adding a listing or service
              to begin tracking analytics.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
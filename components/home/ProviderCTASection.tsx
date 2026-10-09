"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { CheckCircle, ArrowRight } from "@/components/ui/icons"

const CHECKLIST = [
  "Free profile — list your first property or service at no cost",
  "Reach thousands of verified customers across Kenya",
  "Featured listings get 5× more visibility",
]

function formatCount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}k+`
  }
  return String(n)
}

export function ProviderCTASection({
  fundiCount,
  providerCount,
  propertyCount,
}: {
  fundiCount: number
  providerCount: number
  propertyCount: number
}) {
  const { user } = useAuth()
  const ctaHref = user ? "/dashboard/listings/new" : "/auth/login?next=/dashboard/listings/new"

  const stats = [
    { value: fundiCount, label: "Active fundis" },
    { value: providerCount, label: "Service providers" },
    { value: propertyCount, label: "Properties listed" },
  ].filter((s) => s.value > 0)

  const hasSocialProof = fundiCount > 0 || providerCount > 0

  return (
    <section aria-labelledby="home-provider-cta-heading" className="border-t border-border bg-surface">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h2
              id="home-provider-cta-heading"
              className="mt-1 font-heading text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl"
            >
              Turn your service or skill into income.
            </h2>
            <p className="mt-2 max-w-xl text-sm text-text-secondary sm:text-base">
              {hasSocialProof ? (
                <>
                  Join{" "}
                  {fundiCount > 0 && (
                    <strong className="font-semibold text-text-primary">
                      {formatCount(fundiCount)} fundi{fundiCount === 1 ? "" : "s"}
                    </strong>
                  )}
                  {fundiCount > 0 && providerCount > 0 && " and "}
                  {providerCount > 0 && (
                    <strong className="font-semibold text-text-primary">
                      {formatCount(providerCount)} service provider{providerCount === 1 ? "" : "s"}
                    </strong>
                  )}{" "}
                  on All Property Link and get hired fast.
                </>
              ) : (
                <>Be among the first to earn on All Property Link. Free to join — pay only when you get hired.</>
              )}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {CHECKLIST.map((point) => (
                <li key={point} className="flex items-center gap-2 text-sm text-text-primary">
                  <CheckCircle size={18} className="shrink-0 text-accent-500" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href={ctaHref}
              className="mt-5 inline-flex min-h-touch items-center gap-2 rounded-md bg-accent-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Start earning today
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          {stats.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4" role="list" aria-label="Marketplace totals">
              {stats.map((s) => (
                <div
                  key={s.label}
                  role="listitem"
                  className="rounded-md bg-surface-secondary px-2 py-5 text-center sm:py-6"
                >
                  <div className="font-heading text-2xl font-bold text-primary sm:text-3xl">
                    {formatCount(s.value)}
                  </div>
                  <div className="mt-1 text-xs text-text-secondary">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { IconHeart } from "@tabler/icons-react"
import { api } from "@/lib/api-client"
import { useFavorites, type FavoriteType } from "@/lib/favorites-context"
import { LatestListCard, type LatestListCardData } from "@/components/home/LatestListCard"
import { ServiceCardCompact } from "@/components/browse/ServiceCardCompact"
import { FavoriteButton } from "@/components/shared/FavoriteButton"
import { FormBanner } from "@/components/shared/FormFeedback"
import { Phone } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

interface FavoriteApiItem {
  targetType: FavoriteType
  id: string
  available: boolean
  property?: { id?: string; slug?: string } | null
  service?: { id?: string } | null
  agent?: { id?: string } | null
}

type Tab = FavoriteType

const TABS: { key: Tab; label: string }[] = [
  { key: "PROPERTY", label: "Properties" },
  { key: "SERVICE", label: "Services" },
  { key: "AGENT", label: "Agents" },
]

const TAB_NOUN: Record<Tab, string> = {
  PROPERTY: "property",
  SERVICE: "service",
  AGENT: "representative",
}

function propertyToLatestCard(p: Record<string, unknown>): LatestListCardData {
  const agent = (p.agent ?? {}) as { phone?: string | null; userTypes?: string[] | null }
  const types = agent.userTypes ?? []
  const listerKind = types.includes("AGENT")
    ? ("AGENT" as const)
    : types.includes("PROPERTY_OWNER")
      ? ("OWNER" as const)
      : null
  return {
    slug: String(p.slug ?? ""),
    title: String(p.title ?? ""),
    price: p.price == null ? null : Number(p.price),
    propertyType: String(p.propertyType ?? ""),
    listingPurpose: (p.listingPurpose as string | null) ?? null,
    city: String(p.city ?? ""),
    region: (p.region as string | null) ?? null,
    bedrooms: p.bedrooms == null ? null : Number(p.bedrooms),
    bathrooms: p.bathrooms == null ? null : Number(p.bathrooms),
    area: p.area == null ? null : Number(p.area),
    plotSize: (p.plotSize as number | string | null) ?? null,
    plotSizeUnit: (p.plotSizeUnit as string | null) ?? null,
    images: p.images,
    coverImage: (p.coverImage as string | null) ?? null,
    agentPhone: agent.phone ?? null,
    listerKind,
    hasMultipleUnits: p.hasMultipleUnits === true,
    units: Array.isArray(p.units) ? (p.units as LatestListCardData["units"]) : undefined,
  }
}

function AgentSavedRow({ agent, refId, label }: { agent: Record<string, unknown>; refId: string; label: string }) {
  const fullName = String(agent.fullName ?? label)
  const phone = ((agent.phone as string | null) ?? "").trim() || null
  const regions = Array.isArray(agent.regions) ? (agent.regions as string[]).slice(0, 3) : []
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-base font-bold text-text-primary">{fullName}</p>
          <p className="text-xs text-text-secondary">{String(agent.agentCode ?? "")}</p>
        </div>
        <FavoriteButton type="AGENT" refId={refId} label={fullName} variant="circle" />
      </div>
      <p className="text-sm text-text-secondary">
        {(agent._count as { users?: number } | undefined)?.users ?? 0} referrals
        {agent.propertyCount != null ? ` · ${agent.propertyCount} listings` : ""}
      </p>
      {regions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {regions.map((r) => (
            <span key={r} className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
              {r}
            </span>
          ))}
        </div>
      )}
<div className="flex flex-wrap gap-2 pt-1">
        <Link
          href={`/aplreps/${refId}`}
          className="touch-target inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-100"
        >
          View profile
        </Link>
        {phone && (
          <a
            href={`tel:${phone}`}
            className="touch-target inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
          >
            <Phone size={15} />
            Call
          </a>
        )}
      </div>
    </div>
  )
}

export function FavoritesClient() {
  const { saved, isMember } = useFavorites()
  const [tab, setTab] = useState<Tab>("PROPERTY")
  const [error, setError] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)
  const [payload, setPayload] = useState<Record<Tab, unknown[]>>({ PROPERTY: [], SERVICE: [], AGENT: [] })

  const savedByType = useMemo(() => {
    const m: Record<Tab, string[]> = { PROPERTY: [], SERVICE: [], AGENT: [] }
    for (const s of saved) m[s.type].push(s.ref)
    return m
  }, [saved])

  const savedSignature = useMemo(() => saved.map((s) => `${s.type}:${s.ref}`).join(","), [saved])

  const load = useCallback(async () => {
    setFetching(true)
    setError(null)
    try {
      if (isMember) {
        const { data, error: err } = await api.get<{ favorites: FavoriteApiItem[] }>("/api/favorites")
        if (err) throw new Error(err)
        const b: Record<Tab, unknown[]> = { PROPERTY: [], SERVICE: [], AGENT: [] }
        for (const f of data?.favorites ?? []) {
          if (f.targetType === "PROPERTY") {
            b.PROPERTY.push(f.property ?? { id: f.id, slug: f.id, available: f.available })
          } else if (f.targetType === "SERVICE") {
            b.SERVICE.push(f.service ?? { id: f.id })
          } else {
            b.AGENT.push(f.agent ?? { id: f.id })
          }
        }
        setPayload(b)
        return
      }

      // Guest / agent: batch-fetch each type from public endpoints.
      const b: Record<Tab, unknown[]> = { PROPERTY: [], SERVICE: [], AGENT: [] }
      const slugs = savedByType.PROPERTY
      const serviceIds = savedByType.SERVICE
      const agentIds = savedByType.AGENT

      if (slugs.length > 0) {
        const { data } = await api.get<{ properties: Record<string, unknown>[] }>(`/api/properties?slugs=${encodeURIComponent(slugs.join(","))}`)
        b.PROPERTY = data?.properties ?? []
      }
      if (serviceIds.length > 0) {
        const { data } = await api.get<{ services: Record<string, unknown>[] }>(`/api/services?ids=${encodeURIComponent(serviceIds.join(","))}`)
        b.SERVICE = data?.services ?? []
      }
      if (agentIds.length > 0) {
        const { data } = await api.get<{ agents: Record<string, unknown>[] }>(`/api/apl-agents?ids=${encodeURIComponent(agentIds.join(","))}`)
        b.AGENT = data?.agents ?? []
      }
      setPayload(b)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your saved items")
    } finally {
      setFetching(false)
    }
  }, [isMember, savedByType])

  useEffect(() => {
    void load()
  }, [load, savedSignature])

  const keyOf = (s: { type: Tab; ref: string }) => `${s.type}:${s.ref}`

  // Filter out items un-saved on the page (store is the source of truth).
  const savedKeys = useMemo(() => new Set(saved.map((s) => keyOf(s))), [saved])

  const visible = useMemo(() => {
    const perTab: Record<Tab, { ref: string; available: boolean; card: unknown }[]> = {
      PROPERTY: [],
      SERVICE: [],
      AGENT: [],
    }
    for (const item of payload.PROPERTY) {
      const rec = item as { slug?: string; id?: string }
      const ref = String(rec.slug || rec.id || "")
      if (ref && savedKeys.has(`PROPERTY:${ref}`)) perTab.PROPERTY.push({ ref, available: true, card: item })
    }
    for (const item of payload.SERVICE) {
      const ref = String((item as { id?: string }).id || "")
      if (ref && savedKeys.has(`SERVICE:${ref}`)) perTab.SERVICE.push({ ref, available: true, card: item })
    }
    for (const item of payload.AGENT) {
      const ref = String((item as { id?: string }).id || "")
      if (ref && savedKeys.has(`AGENT:${ref}`)) perTab.AGENT.push({ ref, available: true, card: item })
    }
    return perTab
  }, [payload, savedKeys])

  const counts = useMemo(
    () => ({
      PROPERTY: (visible.PROPERTY ?? []).length,
      SERVICE: (visible.SERVICE ?? []).length,
      AGENT: (visible.AGENT ?? []).length,
    }),
    [visible],
  )

  const totalCount = counts.PROPERTY + counts.SERVICE + counts.AGENT
  const currentTabCount = (visible[tab] ?? []).length

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <header className="mb-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">Your shortlist</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-text-primary">Saved listings</h1>
            <p className="mt-1 text-sm text-text-secondary">
              {totalCount === 0 ? "Nothing saved yet." : `${totalCount} saved ${totalCount === 1 ? "item" : "items"}`}
            </p>
          </div>
          {!isMember && totalCount > 0 && (
            <Link
              href="/auth"
              className="touch-target inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
            >
              Sign in to sync & get price-drop alerts
            </Link>
          )}
        </div>
      </header>

      {error && <FormBanner variant="error">{error}</FormBanner>}

      {totalCount > 0 && (
        <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Saved item types">
          {TABS.map((t) => {
            const c = t.key === "PROPERTY" ? counts.PROPERTY : t.key === "SERVICE" ? counts.SERVICE : counts.AGENT
            const active = tab === t.key
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.key)}
                className={cn(
                  "touch-target inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  active ? "border-primary bg-primary text-white" : "border-border bg-surface text-text-secondary hover:border-primary-200 hover:text-text-primary",
                )}
              >
                {t.label}
                <span className={cn("rounded-full px-1.5 text-xs font-bold", active ? "bg-white/20" : "bg-surface-secondary")}>{c}</span>
              </button>
            )
          })}
        </div>
      )}

      <div role="tabpanel" aria-busy={fetching}>
        {fetching ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading saved listings">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-xl border border-border bg-surface-secondary" />
            ))}
          </div>
        ) : currentTabCount === 0 ? (
          <EmptyState tab={tab} total={totalCount} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tab === "PROPERTY" &&
              (visible.PROPERTY ?? []).map((row) => <LatestListCard key={row.ref} item={propertyToLatestCard(row.card as Record<string, unknown>)} />)}
            {tab === "SERVICE" &&
              (visible.SERVICE ?? []).map((row) => {
                const c = row.card as Record<string, unknown>
                return (
                  <ServiceCardCompact
                    key={row.ref}
                    id={row.ref}
                    title={String(c.title ?? "")}
                    description={(c.description as string | null) ?? undefined}
                    price={(c.price as number | string | null) ?? null}
                    currency={String(c.currency ?? "KES")}
                    pricePeriod={String(c.pricePeriod ?? "TOTAL")}
                    city={(c.city as string | null) ?? null}
                    region={(c.region as string | null) ?? null}
                    images={c.images}
                    category={(c.category as { name: string; slug: string } | null) ?? null}
                    user={(((c.user ?? null) as { firstName: string; lastName: string; companyName: string | null; businessLogo: string | null; phone?: string | null; userTypes?: string[] | null } | null))}
                    phone={(c.user as { phone?: string | null } | undefined)?.phone ?? null}
                    avgRating={(c.avgRating as number | null) ?? null}
                    reviewCount={(c.reviewCount as number | null) ?? null}
                  />
                )
              })}
            {tab === "AGENT" &&
              (visible.AGENT ?? []).map((row) => (
                <AgentSavedRow
                  key={row.ref}
                  refId={row.ref}
                  label={(row.card as { fullName?: string }).fullName ?? "Representative"}
                  agent={row.card as Record<string, unknown>}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ tab, total }: { tab: Tab; total: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-12 text-center">
      <IconHeart size={28} stroke={1.5} className="mx-auto mb-3 text-text-secondary" aria-hidden="true" />
      <p className="font-heading text-base font-semibold text-text-primary">
        {total === 0 ? "No saved items yet" : `No saved ${TAB_NOUN}${tab === "AGENT" ? "s" : ""} yet`}
      </p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-text-secondary">
        {total === 0
          ? "Tap the heart on any listing to save it here for later."
          : `Your ${TAB_NOUN[tab]} folder is empty. Tap the heart on a ${TAB_NOUN[tab]} to add it here.`}
      </p>
      <Link
        href={tab === "PROPERTY" ? "/properties" : tab === "SERVICE" ? "/services" : "/aplreps"}
        className="mt-5 inline-flex touch-target items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
      >
        Browse {TAB_NOUN[tab]}s
      </Link>
    </div>
  )
}
/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api-client"
import { Loader2, AlertCircle, Building2, ArrowLeft, Plus, Trash2 } from "@/components/ui/icons"
import Link from "next/link"
import { AgentGuard } from "@/components/dashboard/AgentGuard"
import { StatusPill } from "@/components/shared/StatusPill"
import { fmtKES } from "@/lib/utils"
import { resolveImageUrl } from "@/lib/images";

interface Property {
  id: string
  title: string
  slug: string
  price: number
  currency: string
  propertyType: string
  city: string
  status: string
  moderationStatus: string
  coverImage?: string | null
  images: string | { url: string }[] | null
  createdAt: string
  deletedAt?: string | null
}

interface ReferralService {
  id: string
  title: string
  price: number | null
  currency: string
  city: string | null
  status: string
  moderationStatus: string
  images: string[] | null
  createdAt: string
  deletedAt?: string | null
  category: { id: string; name: string } | null
}

interface ReferralDetail {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  category: string | null
  kycStatus: string
  accountStatus: string
  createdAt: string
  userTypes?: string[]
  properties: Property[]
  serviceListings?: ReferralService[]
}

export default function AgentReferralDetailPage() {
  const params = useParams()
  const [referral, setReferral] = useState<ReferralDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState("")
  const [showBin, setShowBin] = useState(false)
  const [purgeTarget, setPurgeTarget] = useState<{ kind: "property" | "service"; id: string; title: string } | null>(null)
  const [purgeConsent, setPurgeConsent] = useState(false)
  const [purgeTitle, setPurgeTitle] = useState("")
  const [purging, setPurging] = useState(false)

  const fetchReferral = useCallback(async () => {
    setLoading(true)
    setError("")
    const { data, error } = await api.get<{ referral: ReferralDetail }>(`/api/referral-partner/referrals/${params.id}${showBin ? "?deleted=1" : ""}`)
    if (data) setReferral(data.referral)
    else setError(error || "Failed to load")
    setLoading(false)
  }, [params.id, showBin])

  useEffect(() => { fetchReferral() }, [fetchReferral])

  async function handleDelete(propertyId: string) {
    if (confirmDeleteId !== propertyId) {
      setConfirmDeleteId(propertyId)
      return
    }
    setDeleting(true)
    setActionError("")
    const { error } = await api.delete(
      `/api/agent/referrals/${params.id}/properties/${propertyId}`
    )
    setDeleting(false)
    if (error) {
      setActionError(error)
      setConfirmDeleteId(null)
      return
    }
    setConfirmDeleteId(null)
    fetchReferral()
  }

  async function handleServiceDelete(serviceId: string) {
    if (confirmDeleteId !== serviceId) {
      setConfirmDeleteId(serviceId)
      return
    }
    setDeleting(true)
    setActionError("")
    const { error } = await api.delete(
      `/api/agent/referrals/${params.id}/services/${serviceId}`
    )
    setDeleting(false)
    if (error) {
      setActionError(error)
      setConfirmDeleteId(null)
      return
    }
    setConfirmDeleteId(null)
    fetchReferral()
  }

  async function handleRestore(kind: "property" | "service", id: string) {
    setDeleting(true)
    setActionError("")
    const base = kind === "property" ? "properties" : "services"
    const { error } = await api.post(
      `/api/agent/referrals/${params.id}/${base}/${id}/restore`, {}
    )
    setDeleting(false)
    if (error) {
      setActionError(error)
      return
    }
    fetchReferral()
  }

  async function handlePurge() {
    if (!purgeTarget) return
    setPurging(true)
    setActionError("")
    const base = purgeTarget.kind === "property" ? "properties" : "services"
    const { error } = await api.post(
      `/api/agent/referrals/${params.id}/${base}/${purgeTarget.id}/purge`,
      { ownerConsent: purgeConsent, confirmTitle: purgeTitle }
    )
    setPurging(false)
    if (error) {
      setActionError(error)
      return
    }
    setPurgeTarget(null)
    setPurgeConsent(false)
    setPurgeTitle("")
    fetchReferral()
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted" /></div>
  if (error) return (
    <div className="flex flex-col items-center gap-4 py-20">
      <AlertCircle size={24} className="text-error-500" />
      <p className="text-sm text-text-secondary">{error}</p>
    </div>
  )
  if (!referral) return null

  const referralTypes = referral.userTypes ?? []
  const canOfferServices =
    referralTypes.includes("FUNDI") || referralTypes.includes("SERVICE_PROVIDER")
  const services = referral.serviceListings ?? []

  return (
    <AgentGuard>
      <Link href="/dashboard/agent/referrals" className="touch-target mb-2 inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-primary-600 hover:text-primary-700">
        <ArrowLeft size={16} /> Back to referrals
      </Link>

      <section aria-labelledby="referral-name" className="mb-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
          Referral
        </p>
        <h1 id="referral-name" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">{referral.firstName} {referral.lastName}</h1>
        <p className="mt-1 text-sm text-text-secondary">{referral.email}</p>
        {referral.phone && <p className="text-sm text-text-secondary">{referral.phone}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {referral.category && <span className="rounded-full bg-surface-secondary px-3 py-1 text-xs text-text-secondary">{referral.category}</span>}
          <StatusPill status={referral.kycStatus} label={`KYC: ${referral.kycStatus}`} />
        </div>
      </section>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold text-text-primary">Properties ({referral.properties.length})</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setShowBin(!showBin); setPurgeTarget(null); }}
            className="touch-target inline-flex min-h-[44px] items-center rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-secondary"
          >
            {showBin ? "Show active" : "Recycle bin"}
          </button>
          <Link
            href={`/dashboard/agent/referrals/${referral.id}/properties/new`}
            className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            <Plus size={16} />
            Post listing
          </Link>
        </div>
      </div>

      {actionError && (
        <p role="alert" className="mb-4 rounded-lg border border-error-500/20 bg-error-50 px-4 py-3 text-sm text-error-700">
          {actionError}
        </p>
      )}

      {referral.properties.length === 0 ? (
        <p className="text-sm text-text-secondary">No properties listed yet</p>
      ) : (
        <div className="space-y-3">
          {referral.properties.map((p) => {
            const img = (p.coverImage ?? (Array.isArray(p.images) ? p.images[0] : null)) as string | { url: string } | null
            return (
              <div key={p.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:gap-4">
                <Link href={`/${p.propertyType === "LAND" ? "land" : "properties"}/${p.city?.toLowerCase() || "unknown"}/${p.slug}`} className="flex min-w-0 flex-1 items-center gap-4">
                  {img ? (
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-secondary">
                      <img src={resolveImageUrl(typeof img === "string" ? img : img.url) ?? undefined} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-surface-secondary">
                      <Building2 size={20} className="text-muted" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{p.title}</p>
                    <p className="text-xs text-text-secondary">{p.city} &middot; {p.propertyType}</p>
                    <p className="text-sm font-semibold text-text-primary">{fmtKES(p.price)}</p>
                  </div>
                </Link>
                <div className="flex w-full shrink-0 flex-row flex-wrap items-center justify-between gap-2 border-t border-border pt-3 sm:w-auto sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                  <StatusPill status={p.moderationStatus} label={p.status} />
                  <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
                    <Link href={`/dashboard/agent/referrals/${referral.id}/properties/${p.id}/edit`} className="touch-target inline-flex min-h-[44px] items-center rounded-lg border border-accent-200 bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700 transition-colors hover:bg-accent-100">
                      Edit
                    </Link>
                    {!showBin ? (
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => handleDelete(p.id)}
                        className={`touch-target inline-flex min-h-[44px] items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                          confirmDeleteId === p.id
                            ? "border-error-500 bg-error-500 text-white hover:bg-error-700"
                            : "border-border text-text-secondary hover:bg-surface-secondary hover:text-error-600"
                        }`}
                      >
                        <Trash2 size={14} />
                        {confirmDeleteId === p.id ? (deleting ? "Deleting..." : "Confirm delete") : "Delete"}
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={deleting}
                          onClick={() => handleRestore("property", p.id)}
                          className="touch-target inline-flex min-h-[44px] items-center rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 disabled:opacity-50"
                        >
                          Restore
                        </button>
                        <button
                          type="button"
                          disabled={deleting}
                          onClick={() => { setPurgeTarget({ kind: "property", id: p.id, title: p.title }); setPurgeConsent(false); setPurgeTitle(""); }}
                          className="touch-target inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-error-600 transition-colors hover:bg-error-500/10 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          Purge
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {canOfferServices && (
        <>
          <div className="mb-4 mt-10 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-text-primary">Services ({services.length})</h2>
            <Link
              href={`/dashboard/agent/referrals/${referral.id}/services/new`}
              className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              <Plus size={16} />
              Post service
            </Link>
          </div>

          {services.length === 0 ? (
            <p className="text-sm text-text-secondary">No services listed yet</p>
          ) : (
            <div className="space-y-3">
              {services.map((s) => (
                <div key={s.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{s.title}</p>
                    <p className="text-xs text-text-secondary">
                      {s.category?.name ?? "Service"}{s.city ? ` · ${s.city}` : ""}
                    </p>
                    {s.price != null && (
                      <p className="text-sm font-semibold text-text-primary">{fmtKES(s.price)}</p>
                    )}
                  </div>
                  <div className="flex w-full shrink-0 flex-row flex-wrap items-center justify-between gap-2 border-t border-border pt-3 sm:w-auto sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                    <StatusPill status={s.moderationStatus} label={s.status} />
                    <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
                      <Link href={`/dashboard/agent/referrals/${referral.id}/services/${s.id}/edit`} className="touch-target inline-flex min-h-[44px] items-center rounded-lg border border-accent-200 bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700 transition-colors hover:bg-accent-100">
                        Edit
                      </Link>
                      {!showBin ? (
                        <button
                          type="button"
                          disabled={deleting}
                          onClick={() => handleServiceDelete(s.id)}
                          className={`touch-target inline-flex min-h-[44px] items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                            confirmDeleteId === s.id
                              ? "border-error-500 bg-error-500 text-white hover:bg-error-700"
                              : "border-border text-text-secondary hover:bg-surface-secondary hover:text-error-600"
                          }`}
                        >
                          <Trash2 size={14} />
                          {confirmDeleteId === s.id ? (deleting ? "Deleting..." : "Confirm delete") : "Delete"}
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={deleting}
                            onClick={() => handleRestore("service", s.id)}
                            className="touch-target inline-flex min-h-[44px] items-center rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 disabled:opacity-50"
                          >
                            Restore
                          </button>
                          <button
                            type="button"
                            disabled={deleting}
                            onClick={() => { setPurgeTarget({ kind: "service", id: s.id, title: s.title }); setPurgeConsent(false); setPurgeTitle(""); }}
                            className="touch-target inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-error-600 transition-colors hover:bg-error-500/10 disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            Purge
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {purgeTarget && (
        <div role="dialog" aria-modal="true" aria-label="Confirm permanent delete" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5">
            <h3 className="font-heading text-lg font-bold text-text-primary">Permanently delete?</h3>
            <p className="mt-1 text-sm text-text-secondary">
              &ldquo;{purgeTarget.title}&rdquo; will be gone forever: reviews, photos and the public page are
              removed. The URL will never be reused. Backup copies expire with retention.
            </p>
            <label className="mt-4 flex items-start gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={purgeConsent}
                onChange={(e) => setPurgeConsent(e.target.checked)}
                className="mt-1"
              />
              The owner agreed to this permanent deletion.
            </label>
            <label htmlFor="purge-title" className="mt-3 block text-sm font-medium text-text-primary">
              Type &ldquo;{purgeTarget.title}&rdquo; to confirm
            </label>
            <input
              id="purge-title"
              type="text"
              value={purgeTitle}
              onChange={(e) => setPurgeTitle(e.target.value)}
              placeholder={purgeTarget.title}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPurgeTarget(null)}
                className="touch-target inline-flex min-h-[44px] items-center rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={purging || !purgeConsent || purgeTitle !== purgeTarget.title}
                onClick={handlePurge}
                className="touch-target inline-flex min-h-[44px] items-center rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white hover:bg-error-700 disabled:opacity-50"
              >
                {purging ? "Purging…" : "Purge forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AgentGuard>
  )
}

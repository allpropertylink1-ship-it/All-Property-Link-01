"use client"

import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { FormBanner } from "@/components/shared/FormFeedback"
import { Search, Plus, Trash2, Activity, Mail, MessageCircle, Phone } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

interface SavedSearch {
  id: string
  name: string | null
  criteria: {
    query?: string
    city?: string
    propertyType?: string
    listingPurpose?: string
    minPrice?: number
    maxPrice?: number
    bedrooms?: number
  }
  active: boolean
  notifyEmail: boolean
  notifySms: boolean
  notifyWhatsApp: boolean
  lastMatchedAt?: string | null
  createdAt: string
}

const PROPERTY_TYPES = ["HOUSE", "APARTMENT", "LAND", "COMMERCIAL"]
const PURPOSES = ["FOR_SALE", "FOR_RENT_LONG_TERM", "FOR_RENT_SHORT_TERM"]

const PURPOSE_LABEL: Record<string, string> = {
  FOR_SALE: "For sale",
  FOR_RENT_LONG_TERM: "For rent",
  FOR_RENT_SHORT_TERM: "Airbnb / short stay",
}

type Criteria = SavedSearch["criteria"]

const EMPTY_CRITERIA: Criteria = {}

function criteriaSummary(c: Criteria): string {
  const parts: string[] = []
  if (c.query) parts.push(`"${c.query}"`)
  if (c.city) parts.push(c.city)
  if (c.propertyType) parts.push(c.propertyType.toLowerCase())
  if (c.listingPurpose) parts.push(PURPOSE_LABEL[c.listingPurpose] ?? c.listingPurpose.toLowerCase().replace(/_/g, " "))
  if (c.bedrooms) parts.push(`${c.bedrooms}+ bed`)
  if (c.minPrice != null && c.maxPrice != null) parts.push(`KES ${c.minPrice.toLocaleString()}–${c.maxPrice.toLocaleString()}`)
  else if (c.minPrice != null) parts.push(`from KES ${c.minPrice.toLocaleString()}`)
  else if (c.maxPrice != null) parts.push(`up to KES ${c.maxPrice.toLocaleString()}`)
  return parts.join(" · ") || "Any property"
}

function ChannelPills({ search }: { search: SavedSearch }) {
  const channels = [
    { on: search.notifyEmail, label: "Email", Icon: Mail },
    { on: search.notifySms, label: "SMS", Icon: Phone },
    { on: search.notifyWhatsApp, label: "WhatsApp", Icon: MessageCircle },
  ]
  return (
    <div className="flex flex-wrap gap-1.5">
      {channels.map(({ on, label, Icon }) => (
        <span
          key={label}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            on ? "bg-accent-500 text-white" : "bg-surface-secondary text-text-secondary",
          )}
        >
          <Icon size={11} />
          {label}
        </span>
      ))}
    </div>
  )
}

export default function SavedSearchesPage() {
  const { user } = useAuth()
  const hasPhone = !!user?.phone
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ variant: "error" | "success"; message: string } | null>(null)

  // Draft (create form)
  const [showForm, setShowForm] = useState(false)
  const [draftName, setDraftName] = useState("")
  const [draftCriteria, setDraftCriteria] = useState<Criteria>(EMPTY_CRITERIA)
  const [draftChannels, setDraftChannels] = useState({ email: true, sms: false, whatsapp: false })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await api.get<{ searches: SavedSearch[] }>("/api/saved-searches")
      if (err) throw new Error(err)
      setSearches(data?.searches ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load saved searches")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function setCriteria(patch: Partial<Criteria>) {
    setDraftCriteria((prev) => {
      const next = { ...prev, ...patch }
      const hasAny = Object.values(next).some((v) => v !== undefined && v !== "" && v !== null)
      return hasAny ? next : EMPTY_CRITERIA
    })
  }

  const validDraft = Object.values(draftCriteria).some((v) => v !== undefined && v !== "" && v !== null)

  async function createSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!validDraft || saving) return
    setSaving(true)
    setFeedback(null)
    try {
      const body = {
        name: draftName.trim() || null,
        criteria: draftCriteria,
        notifyEmail: draftChannels.email,
        notifySms: hasPhone && draftChannels.sms,
        notifyWhatsApp: hasPhone && draftChannels.whatsapp,
      }
      const { error: err } = await api.post("/api/saved-searches", body)
      if (err) throw new Error(err)
      setFeedback({ variant: "success", message: "Search saved. You'll be alerted when new listings match." })
      setShowForm(false)
      setDraftName("")
      setDraftCriteria(EMPTY_CRITERIA)
      setDraftChannels({ email: true, sms: false, whatsapp: false })
      await load()
    } catch (e) {
      setFeedback({ variant: "error", message: e instanceof Error ? e.message : "Could not create the search" })
    } finally {
      setSaving(false)
    }
  }

  async function patchSearch(id: string, patch: Partial<SavedSearch>) {
    const { error: err } = await api.patch(`/api/saved-searches/${id}`, patch)
    if (err) throw new Error(err)
  }

  async function toggleChannel(id: string, key: "notifyEmail" | "notifySms" | "notifyWhatsApp", next: boolean) {
    // SMS/WhatsApp need a phone number on the account.
    if (key !== "notifyEmail" && !hasPhone) {
      setFeedback({ variant: "error", message: "Add and verify a phone number on your profile to enable SMS/WhatsApp alerts." })
      return
    }
    try {
      await patchSearch(id, { [key]: next })
      setSearches((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: next } : s)))
    } catch (e) {
      setFeedback({ variant: "error", message: e instanceof Error ? e.message : "Update failed" })
    }
  }

  async function toggleActive(id: string, active: boolean) {
    try {
      await patchSearch(id, { active })
      setSearches((prev) => prev.map((s) => (s.id === id ? { ...s, active } : s)))
    } catch (e) {
      setFeedback({ variant: "error", message: e instanceof Error ? e.message : "Update failed" })
    }
  }

  async function removeSearch(id: string) {
    try {
      await api.delete(`/api/saved-searches/${id}`)
      setSearches((prev) => prev.filter((s) => s.id !== id))
    } catch (e) {
      setFeedback({ variant: "error", message: e instanceof Error ? e.message : "Delete failed" })
    }
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="saved-searches-heading" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-heading text-[11px] font-semibold uppercase tracking-widest text-text-secondary">Alerts</p>
            <h1 id="saved-searches-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight text-text-primary">
              Saved Searches
            </h1>
            <p className="mt-1 max-w-xl text-sm text-text-secondary">
              Save a search and we&apos;ll notify you (in-app, plus email/SMS/WhatsApp if enabled) when new matching properties are listed.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="touch-target inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
          >
            {showForm ? <span>Cancel</span> : <><Plus size={16} /> New search</>}
          </button>
        </div>
      </section>

      {feedback && <FormBanner variant={feedback.variant}>{feedback.message}</FormBanner>}
      {!hasPhone && (
        <FormBanner variant="error">
          Add a phone number on your profile to enable SMS and WhatsApp alerts. Email + in-app alerts work without one.
        </FormBanner>
      )}

      {showForm && (
        <form onSubmit={createSearch} className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">New saved search</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-text-primary">Name (optional)</span>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="e.g. 3-bed in Lavington"
                maxLength={80}
                className="min-h-touch w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-text-primary">Keyword</span>
              <input
                type="text"
                value={draftCriteria.query ?? ""}
                onChange={(e) => setCriteria({ query: e.target.value })}
                placeholder="gated, studio, near school…"
                maxLength={120}
                className="min-h-touch w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-text-primary">City / town</span>
              <input
                type="text"
                value={draftCriteria.city ?? ""}
                onChange={(e) => setCriteria({ city: e.target.value })}
                placeholder="Nairobi, Nakuru, Mombasa…"
                maxLength={80}
                className="min-h-touch w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-text-primary">Property type</span>
              <select
                value={draftCriteria.propertyType ?? ""}
                onChange={(e) => setCriteria({ propertyType: e.target.value || undefined })}
                className="min-h-touch w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"
              >
                <option value="">Any</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t.toLowerCase()}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-text-primary">Purpose</span>
              <select
                value={draftCriteria.listingPurpose ?? ""}
                onChange={(e) => setCriteria({ listingPurpose: e.target.value || undefined })}
                className="min-h-touch w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"
              >
                <option value="">Any</option>
                {PURPOSES.map((p) => (
                  <option key={p} value={p}>{PURPOSE_LABEL[p]}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-text-primary">Minimum bedrooms</span>
              <select
                value={draftCriteria.bedrooms ?? ""}
                onChange={(e) => setCriteria({ bedrooms: e.target.value ? Number(e.target.value) : undefined })}
                className="min-h-touch w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}+ bed</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-text-primary">Min price (KES)</span>
              <input
                type="number"
                min={0}
                value={draftCriteria.minPrice ?? ""}
                onChange={(e) => setCriteria({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="100000"
                className="min-h-touch w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-text-primary">Max price (KES)</span>
              <input
                type="number"
                min={0}
                value={draftCriteria.maxPrice ?? ""}
                onChange={(e) => setCriteria({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="5000000"
                className="min-h-touch w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"
              />
            </label>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-text-primary">Alert channels</p>
            <div className="flex flex-wrap gap-3">
              {(["email", "sms", "whatsapp"] as const).map((ch) => {
                const enabled = draftChannels[ch]
                const disabled = ch !== "email" && !hasPhone
                return (
                  <label key={ch} className={cn("inline-flex touch-target items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium", disabled ? "opacity-50" : "cursor-pointer")}>
                    <input
                      type="checkbox"
                      checked={enabled}
                      disabled={disabled}
                      onChange={(e) => setDraftChannels((prev) => ({ ...prev, [ch]: e.target.checked }))}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="capitalize">{ch === "sms" ? "SMS" : ch === "whatsapp" ? "WhatsApp" : "Email"}</span>
                  </label>
                )
              })}
            </div>
            {!hasPhone && <p className="mt-2 text-xs text-text-secondary">Add a phone number to unlock SMS & WhatsApp channels.</p>}
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="submit"
              disabled={!validDraft || saving}
              className="touch-target rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save search"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading saved searches">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-surface-secondary" />
          ))}
        </div>
      ) : error ? (
        <FormBanner variant="error">{error}</FormBanner>
      ) : searches.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <Search size={26} className="mx-auto mb-3 text-text-secondary" />
          <p className="font-heading text-base font-semibold text-text-primary">No saved searches yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-text-secondary">
            Save a search and get alerted every time a matching property hits the market.
          </p>
        </div>
      ) : (
        <ul className="space-y-3" aria-label="Saved searches">
          {searches.map((s) => (
            <li key={s.id} className="rounded-xl border border-border bg-surface p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-base font-bold text-text-primary">
                    {s.name || criteriaSummary(s.criteria)}
                  </p>
                  <p className="mt-0.5 text-sm text-text-secondary">{criteriaSummary(s.criteria)}</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {s.active ? "Active" : "Paused"}
                    {s.lastMatchedAt ? ` · last matched ${new Date(s.lastMatchedAt).toLocaleDateString()}` : ""}
                  </p>
                  <div className="mt-2">
                    <ChannelPills search={s} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleActive(s.id, !s.active)}
                    className={cn(
                      "touch-target inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      s.active
                        ? "border-border bg-surface text-text-secondary hover:bg-surface-secondary"
                        : "border-accent-500 bg-accent-50 text-accent-700 hover:bg-accent-100",
                    )}
                  >
                    <Activity size={14} />
                    {s.active ? "Pause" : "Resume"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeSearch(s.id)}
                    className="touch-target inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-error transition-colors hover:bg-error-50"
                    aria-label={`Delete search: ${s.name || criteriaSummary(s.criteria)}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                {(["notifyEmail", "notifySms", "notifyWhatsApp"] as const).map((key) => {
                  const label = key === "notifyEmail" ? "Email" : key === "notifySms" ? "SMS" : "WhatsApp"
                  const locked = (key === "notifySms" || key === "notifyWhatsApp") && !hasPhone
                  return (
                    <label
                      key={key}
                      className={cn("inline-flex touch-target items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium", locked ? "cursor-not-allowed opacity-50" : "cursor-pointer")}
                    >
                      <input
                        type="checkbox"
                        checked={s[key]}
                        disabled={locked}
                        onChange={(e) => void toggleChannel(s.id, key, e.target.checked)}
                        className="h-3.5 w-3.5 accent-primary"
                      />
                      <span>{label}</span>
                    </label>
                  )
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
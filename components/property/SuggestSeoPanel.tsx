"use client"
import { useState } from "react"
import { api } from "@/lib/api-client"
import { FormBanner } from "@/components/shared/FormFeedback"

export interface SeoSuggestionInput {
  title: string
  propertyType?: string
  listingPurpose?: string
  city?: string
  area?: string
  price?: number | null
  pricePeriod?: string
  description?: string
}

// Phase 3 (2026-09): advisory SEO suggestion (Use / Edit / Keep mine).
// Never overwrites the human title: "Use" PATCHes { seoTitle,
// seoDescription, acceptSeo: true } so search engines read the accepted
// text while the title stays the human truth.
export function SuggestSeoPanel({ propertyId, getInput }: {
  propertyId: string
  getInput: () => SeoSuggestionInput
}) {
  const [state, setState] = useState<"idle" | "loading" | "ready" | "accepted" | "dismissed" | "error">("idle")
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [message, setMessage] = useState("")

  async function fetchSuggestion() {
    setState("loading")
    setMessage("")
    const { data, error } = await api.post<{ seoTitle: string; seoDescription: string }>("/api/properties/suggest-seo", getInput())
    if (error || !data) {
      setMessage(error || "Could not generate a suggestion")
      setState("error")
      return
    }
    setSeoTitle(data.seoTitle)
    setSeoDescription(data.seoDescription)
    setState("ready")
  }

  async function accept() {
    setState("loading")
    setMessage("")
    const { error } = await api.patch(`/api/properties/${propertyId}`, { seoTitle, seoDescription, acceptSeo: true })
    if (error) {
      setMessage(error)
      setState("error")
      return
    }
    setState("accepted")
  }

  if (state === "dismissed") return null

  return (
    <div className="rounded-xl border border-dashed border-border bg-surface-secondary/50 p-4" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Search-engine suggestion</h3>
          <p className="mt-0.5 text-xs text-text-secondary">Optional — your own title always stays. Use, edit, or keep yours.</p>
        </div>
        {state === "idle" && (
          <button type="button" onClick={fetchSuggestion}
            className="touch-target shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary-600 hover:bg-surface">
            Suggest
          </button>
        )}
      </div>

      {state === "loading" && (
        <p className="mt-3 text-xs text-text-secondary" role="status">Working…</p>
      )}

      {state === "error" && message && (
        <div className="mt-3"><FormBanner variant="error">{message}</FormBanner></div>
      )}

      {(state === "ready" || state === "error") && seoTitle && (
        <div className="mt-3 space-y-3">
          <div>
            <label htmlFor="seo-suggest-title" className="block text-xs font-semibold text-text-primary">Suggested title</label>
            <input id="seo-suggest-title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
              style={{ fontSize: "16px" }} />
          </div>
          <div>
            <label htmlFor="seo-suggest-desc" className="block text-xs font-semibold text-text-primary">Suggested description</label>
            <textarea id="seo-suggest-desc" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2}
              className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
              style={{ fontSize: "16px" }} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={accept}
              className="touch-target rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-600">
              Use this suggestion
            </button>
            <button type="button" onClick={() => setState("dismissed")}
              className="touch-target rounded-lg border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary">
              Keep mine
            </button>
            <button type="button" onClick={fetchSuggestion}
              className="touch-target rounded-lg border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary">
              Regenerate
            </button>
          </div>
        </div>
      )}

      {state === "accepted" && (
        <p className="mt-3 text-xs font-medium text-primary-600" role="status">Suggestion applied — search engines will use it. Your title is unchanged.</p>
      )}
    </div>
  )
}

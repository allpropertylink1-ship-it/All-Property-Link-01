"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api-client"
import { MessageCircle, Phone, Mail, Lock } from "@/components/ui/icons"

/** wa.me needs full international digits; 0-prefixed Kenyan numbers become 254…. */
function whatsappDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, "")
  if (!digits) return null
  const normalized = digits.startsWith("0") ? `254${digits.slice(1)}` : digits
  return normalized.length >= 12 ? normalized : null
}

function LoginPrompt({ serviceId }: { serviceId: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface-secondary/50 p-4 text-center">
      <p className="text-sm font-medium text-text-primary">Sign in to contact this pro</p>
      <p className="mt-1 text-xs text-text-secondary">
        Numbers are hidden for guests to cut spam. It takes a minute.
      </p>
      <Link
        href={`/auth/login?return=${encodeURIComponent(`/services/${serviceId}`)}`}
        className="mt-3 inline-flex min-h-touch items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Lock size={16} aria-hidden="true" />
        Sign in to reveal contact
      </Link>
    </div>
  )
}

/**
 * GatedContact — detail-only contact island. The server NEVER embeds numbers
 * (detail API strips PII for everyone); this island fetches them client-side
 * from the authed GET /api/services/:id/contact, which is audited + capped
 * at 50 reveals/day. Guests see the login prompt (page stays cacheable).
 */
export function GatedContact({
  serviceId,
  title,
  variant,
}: {
  serviceId: string
  title: string
  variant: "compact" | "full"
}) {
  const { user, loading } = useAuth()
  const [phone, setPhone] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [state, setState] = useState<"idle" | "loading" | "ready" | "capped" | "empty">("idle")

  async function handleReveal() {
    if (state === "loading") return
    setState("loading")
    const { data, error, code } = await api.get<{ phone: string | null; email: string | null }>(
      `/api/services/${serviceId}/contact`
    )
    if (error) {
      setState(code === "REVEAL_LIMIT" ? "capped" : "empty")
      return
    }
    const p = data?.phone ?? null
    const e = data?.email ?? null
    setPhone(p)
    setEmail(e)
    setState(p || e ? "ready" : "empty")
  }

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Loading contact options" className="animate-pulse rounded-lg bg-surface-secondary p-4">
        <div className="h-4 w-2/3 rounded bg-border" />
        <div className="mt-2 h-9 rounded bg-border" />
      </div>
    )
  }

  if (!user) return <LoginPrompt serviceId={serviceId} />
  if (state === "idle") {
    return (
      <button
        type="button"
        onClick={handleReveal}
        className="inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Lock size={16} aria-hidden="true" />
        Show contact
      </button>
    )
  }
  if (state === "loading") {
    return (
      <div aria-busy="true" aria-label="Loading contact options" className="animate-pulse rounded-lg bg-surface-secondary p-4">
        <div className="h-4 w-2/3 rounded bg-border" />
        <div className="mt-2 h-9 rounded bg-border" />
      </div>
    )
  }
  if (state === "capped") {
    return (
      <p role="status" className="rounded-lg border border-border bg-surface-secondary/50 p-4 text-center text-sm text-text-secondary">
        Daily contact view limit reached. Try again tomorrow.
      </p>
    )
  }
  if (state === "empty" || (!phone && !email)) {
    return (
      <p role="status" className="rounded-lg border border-border bg-surface-secondary/50 p-4 text-center text-sm text-text-secondary">
        This pro hasn’t shared contact details yet.
      </p>
    )
  }

  const wa = phone ? whatsappDigits(phone) : null
  const waHref = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(`Hi, I'm interested in ${title}`)}`
    : null

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-2">
        {phone && waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp about ${title}`}
            className="flex min-h-touch items-center gap-1.5 rounded-lg bg-whatsapp px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-whatsapp-dark"
          >
            <MessageCircle size={14} aria-hidden="true" />
            WhatsApp
          </a>
        )}
        {phone && (
          <a
            href={`tel:${phone}`}
            aria-label={`Call about ${title}`}
            className="flex min-h-touch items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
          >
            <Phone size={14} aria-hidden="true" />
            Call
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="flex min-h-touch items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-secondary"
          >
            <Mail size={14} aria-hidden="true" />
            Email
          </a>
        )}
      </div>
    )
  }
  return (
    <div className="space-y-2.5">
      {phone && waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp about ${title}`}
          className="flex min-h-touch w-full items-center justify-center gap-2 rounded-lg bg-whatsapp px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-whatsapp-dark"
        >
          <MessageCircle size={16} aria-hidden="true" />
          WhatsApp
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone}`}
          aria-label={`Call about ${title}`}
          className="flex min-h-touch w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-text-primary transition-colors [overflow-wrap:anywhere] hover:bg-surface-secondary"
        >
          <Phone size={16} className="shrink-0" aria-hidden="true" />
          {phone}
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="flex w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-text-primary transition-colors [overflow-wrap:anywhere] hover:bg-surface-secondary"
        >
          <Mail size={16} className="shrink-0" aria-hidden="true" />
          {email}
        </a>
      )}
    </div>
  )
}

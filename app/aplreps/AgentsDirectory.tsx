"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api-client"
import { resolveImageUrl } from "@/lib/images"
import { Loader2, AlertCircle, Phone, Mail, Building2, ExternalLink } from "@/components/ui/icons"

interface Agent {
  id: string
  fullName: string
  phone: string | null
  email: string | null
  agentCode: string
  avatar: string | null
  regions: string[]
  specificArea: string | null
  _count: { users: number }
  propertyCount: number
}

function WhatsAppIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.14 2 11.27c0 2.92 1.45 5.55 3.72 7.25L5 22.1l3.85-1.74c.99.27 2.05.41 3.15.41 5.52 0 10-4.14 10-9.5S17.52 2 12 2z" />
    </svg>
  )
}

function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("0")) return `254${digits.slice(1)}`
  if (digits.startsWith("+")) return digits.slice(1)
  return digits
}

export function AgentsDirectory() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    setLoading(true)
    api.get<{ agents: Agent[] }>("/api/apl-agents").then(({ data, error }) => {
      if (data) setAgents(data.agents)
      else setError(error || "Failed to load representatives")
      setLoading(false)
    })
  }, [])

  const filtered = agents.filter((a) =>
    !search || a.fullName.toLowerCase().includes(search.toLowerCase()) ||
    a.agentCode.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted" /></div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <AlertCircle size={24} className="text-error-500" />
        <p className="text-sm text-text-secondary">{error}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or code..."
          className="w-full max-w-md rounded-xl border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-text-secondary">No representatives found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map((agent) => {
            const photoUrl = resolveImageUrl(agent.avatar)
            const cities = agent.specificArea ? [...agent.regions, agent.specificArea] : agent.regions
            return (
              <div key={agent.id} className="flex flex-col rounded-3xl border-2 border-accent-300/60 bg-surface p-6 transition-shadow hover:shadow-md sm:p-7">
                <div className="flex gap-5 sm:gap-7">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full ring-2 ring-accent-200/50 sm:h-[120px] sm:w-[120px]">
                    {photoUrl ? (
                      <Image src={photoUrl} alt={agent.fullName} fill className="object-cover" sizes="120px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary-100 text-2xl font-bold text-primary-600">
                        {initials(agent.fullName)}
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="flex items-baseline justify-between gap-4">
                      <Link href={`/aplreps/${agent.id}`} className="truncate font-heading text-xl font-bold text-text-primary hover:text-primary-600 sm:text-2xl">
                        {agent.fullName}
                      </Link>
                      <span className="shrink-0 text-xs text-text-secondary sm:text-sm">{agent.agentCode}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                      <p className="text-sm text-text-secondary">
                        {agent._count.users} referral{agent._count.users !== 1 ? "s" : ""} | {agent.propertyCount} listing{agent.propertyCount !== 1 ? "s" : ""}
                      </p>
                      <Link
                        href={`/aplreps/${agent.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-accent-300/60 px-4 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-accent-300/10"
                      >
                        View profile <ExternalLink size={13} className="text-muted" />
                      </Link>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {agent.phone && (
                        <a href={`tel:${agent.phone}`}
                          className="touch-target inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-5 py-2 text-sm font-medium text-primary-800 transition-colors hover:bg-primary-100"
                        ><Phone size={15} />Call</a>
                      )}
                      {agent.phone && (
                        <a href={`https://wa.me/${formatPhoneForWhatsApp(agent.phone)}`} target="_blank" rel="noopener noreferrer"
                          className="touch-target inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                        ><WhatsAppIcon />WhatsApp</a>
                      )}
                      {agent.email && (
                        <a href={`mailto:${agent.email}`}
                          className="touch-target inline-flex items-center gap-2 rounded-full bg-pink-100 px-5 py-2 text-sm font-medium text-pink-800 transition-colors hover:bg-pink-200"
                        ><Mail size={15} className="text-pink-600" />E-Mail</a>
                      )}
                    </div>
                  </div>
                </div>
                {cities.length > 0 && (
                  <>
                    <div className="my-5 border-t border-border sm:my-6" />
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                      <span className="inline-flex shrink-0 items-center gap-2.5 text-base font-medium text-text-primary">
                        <Building2 size={22} className="text-primary-700" />
                        Cities Covered
                      </span>
                      <div className="flex flex-wrap gap-2.5">
                        {cities.map((c) => (
                          <Link key={c} href={`/browse?region=${encodeURIComponent(c)}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-4 py-1.5 text-sm font-medium text-pink-800 transition-colors hover:bg-pink-200"
                          >
                            {c} <ExternalLink size={11} className="text-pink-500" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}